import { BarnetilsynGrunnlagDto, OpplysningerType } from "@api/BidragBehandlingApiV1";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2, useGetOpplysningerBarnetilsyn } from "@common/hooks/useApiData";
import { useOnActivateGrunnlag } from "@common/hooks/useOnActivateGrunnlag";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { BodyShort, Box, Button, Heading, ReadMore, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYHHMMString, DateToDDMMYYYYString, isBeforeDate } from "@utils/date-utils";
import React from "react";

import {
    STONAD_TIL_BARNETILSYNS_SKOLEALDER,
    STONAD_TIL_BARNETILSYNS_TYPE,
} from "../../../constants/stønadTilBarnetilsyn";

const Header = () => (
    <BodyShort size="small" className="flex h-2">
        {text.title.opplysningerFraFolkeregistret}
    </BodyShort>
);
export const NyOpplysningerAlert = () => {
    const { ikkeAktiverteEndringerIGrunnlagsdata } = useGetBehandlingV2();
    const ikkeAktiverteEndringer = ikkeAktiverteEndringerIGrunnlagsdata?.stønadTilBarnetilsyn?.grunnlag;

    if (ikkeAktiverteEndringer == null) return null;
    const innhentetTidspunkt = ikkeAktiverteEndringerIGrunnlagsdata?.stønadTilBarnetilsyn?.innhentetTidspunkt;

    return (
        <BehandlingAlert variant="info">
            <Heading size="xsmall" level="3">
                {text.alert.nyOpplysningerInfo}
            </Heading>
            <BodyShort size="small">
                Nye opplysninger fra offentlige registre er tilgjengelig. Oppdatert{" "}
                {DateToDDMMYYYYHHMMString(dateOrNull(innhentetTidspunkt))}
            </BodyShort>
        </BehandlingAlert>
    );
};
const Opplysninger = ({ perioder }: { perioder: BarnetilsynGrunnlagDto[] }) => {
    const virkningsOrSoktFraDato = useVirkningsdato();

    if (!perioder) {
        return null;
    }

    return (
        <ReadMore header={<Header />} size="small">
            <Table className="opplysninger table-fixed table w-max" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{text.label.periode}</Table.HeaderCell>
                        <Table.HeaderCell className="w-[170px]">{text.label.stønadTilBarnetilsyn}</Table.HeaderCell>
                        <Table.HeaderCell className="w-[80px]">{text.label.omfang}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {perioder.map((periode, index) => (
                        <Table.Row key={`${periode.partPersonId}-${index}`} className="align-top">
                            <Table.DataCell className="flex justify-start gap-2">
                                <>
                                    {virkningsOrSoktFraDato &&
                                    new Date(periode.periodeFra) < new Date(virkningsOrSoktFraDato)
                                        ? DateToDDMMYYYYString(virkningsOrSoktFraDato)
                                        : DateToDDMMYYYYString(new Date(periode.periodeFra))}
                                    <div>{"-"}</div>
                                    {periode.periodeTil ? DateToDDMMYYYYString(new Date(periode.periodeTil)) : ""}
                                </>
                            </Table.DataCell>
                            <Table.DataCell>{STONAD_TIL_BARNETILSYNS_SKOLEALDER[periode.skolealder]}</Table.DataCell>
                            <Table.DataCell>{STONAD_TIL_BARNETILSYNS_TYPE[periode.tilsynstype]}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </ReadMore>
    );
};
export const BarnetilsynOpplysninger = ({ ident }: { ident: string }) => {
    const { aktiveOpplysninger, ikkeAktiverteOpplysninger } = useGetOpplysningerBarnetilsyn();
    const activateGrunnlag = useOnActivateGrunnlag();
    const { lesemodus, setSaveErrorState } = useBehandlingProvider();
    const aktivePerioder = aktiveOpplysninger?.grunnlag[ident];
    const ikkeAktivertePerioder = ikkeAktiverteOpplysninger?.grunnlag[ident];
    const hasNewOpplysningerFraFolkeregistre = ikkeAktivertePerioder?.length > 0;

    const onActivate = () => {
        activateGrunnlag.mutation.mutate(
            {
                overskriveManuelleOpplysninger: false,
                personident: ident,
                gjelderIdent: ident,
                grunnlagstype: OpplysningerType.BARNETILSYN,
            },
            {
                onSuccess: (response) => {
                    activateGrunnlag.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            aktiveGrunnlagsdata: response.aktiveGrunnlagsdata,
                            ikkeAktiverteEndringerIGrunnlagsdata: response.ikkeAktiverteEndringerIGrunnlagsdata,
                        };
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onActivate(),
                    });
                },
            }
        );
    };

    return (
        <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-4">
                <Opplysninger perioder={aktivePerioder} />
            </div>
            {hasNewOpplysningerFraFolkeregistre && !lesemodus && (
                <NyOpplysningerFraFolkeregistreTabell
                    ikkeAktivertePerioder={ikkeAktivertePerioder}
                    onActivate={onActivate}
                    isPending={activateGrunnlag.mutation.isPending}
                />
            )}
        </div>
    );
};

function NyOpplysningerFraFolkeregistreTabell({
    onActivate,
    ikkeAktivertePerioder,
    isPending,
}: {
    onActivate: () => void;
    ikkeAktivertePerioder: BarnetilsynGrunnlagDto[];
    isPending?: boolean;
}) {
    const virkningsOrSoktFraDato = useVirkningsdato();
    return (
        <Box
            padding="4"
            background="surface-default"
            borderWidth="1"
            borderRadius="medium"
            borderColor="border-default"
            className="w-[708px]"
        >
            <Heading size="xsmall">{text.alert.nyOpplysningerBoforhold}</Heading>
            <table className="mt-2">
                <thead>
                    <tr>
                        <th align="left">{text.label.fraOgMed}</th>
                        <th align="left">{text.label.tilOgMed}</th>
                        <th align="left">{text.label.stønadTilBarnetilsyn}</th>
                        <th align="left">{text.label.omfang}</th>
                    </tr>
                </thead>
                <tbody>
                    {ikkeAktivertePerioder?.map((periode, index) => (
                        <tr key={index + periode.partPersonId}>
                            <td width="100px" scope="row">
                                {virkningsOrSoktFraDato && isBeforeDate(periode.periodeFra, virkningsOrSoktFraDato)
                                    ? DateToDDMMYYYYString(virkningsOrSoktFraDato)
                                    : DateToDDMMYYYYString(new Date(periode.periodeFra))}
                            </td>
                            <td width="100px">
                                {" "}
                                {periode.periodeTil ? DateToDDMMYYYYString(new Date(periode.periodeTil)) : ""}
                            </td>
                            <td width="170px">{STONAD_TIL_BARNETILSYNS_SKOLEALDER[periode.skolealder]}</td>
                            <td width="80px">{STONAD_TIL_BARNETILSYNS_TYPE[periode.tilsynstype]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Button
                className="mt-4"
                type="button"
                variant="secondary"
                size="xsmall"
                onClick={() => onActivate()}
                loading={isPending}
            >
                Ja
            </Button>
        </Box>
    );
}
