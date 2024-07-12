import { AktivereGrunnlagRequestV2, BostatusperiodeGrunnlagDto, OpplysningerType } from "@api/BidragBehandlingApiV1";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2, useGetOpplysningerBoforhold } from "@common/hooks/useApiData";
import useFeatureToogle from "@common/hooks/useFeatureToggle";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { hentVisningsnavn } from "@common/hooks/useVisningsnavn";
import { BoforholdFormValues } from "@common/types/boforholdFormValues";
import { BodyShort, Box, Button, Heading, HStack, ReadMore, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYHHMMString, DateToDDMMYYYYString, isBeforeDate } from "@utils/date-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { useOnActivateGrunnlag } from "../../hooks/useOnActivateGrunnlag";

const Header = () => (
    <BodyShort size="small" className="flex h-2">
        {text.title.opplysningerFraFolkeregistret}
    </BodyShort>
);
export const NyOpplysningerAlert = () => {
    const { ikkeAktiverteEndringerIGrunnlagsdata } = useGetBehandlingV2();
    const { enableSivilstandV2 } = useFeatureToogle();
    const ikkeAktiverteEndringerBoforhold = ikkeAktiverteEndringerIGrunnlagsdata.husstandsbarn;
    const ikkeAktiverteEndringerSivilstand = ikkeAktiverteEndringerIGrunnlagsdata.sivilstand;

    if (
        ikkeAktiverteEndringerBoforhold.length === 0 &&
        (!enableSivilstandV2 || ikkeAktiverteEndringerSivilstand == null)
    )
        return null;
    const innhentetTidspunkt =
        ikkeAktiverteEndringerSivilstand?.innhentetTidspunkt ?? ikkeAktiverteEndringerBoforhold[0]?.innhentetTidspunkt;
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
const Opplysninger = ({ perioder }: { perioder: BostatusperiodeGrunnlagDto[] }) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    if (!perioder) {
        return null;
    }

    return (
        <ReadMore header={<Header />} size="small">
            <Table className="w-[350px] opplysninger" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{text.label.periode}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.status}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {perioder.map((periode, index) => (
                        <Table.Row key={`${periode.bostatus}-${index}`}>
                            <Table.DataCell className="flex justify-start gap-2">
                                <>
                                    {virkningsOrSoktFraDato &&
                                    new Date(periode.datoFom) < new Date(virkningsOrSoktFraDato)
                                        ? DateToDDMMYYYYString(virkningsOrSoktFraDato)
                                        : DateToDDMMYYYYString(new Date(periode.datoFom))}
                                    <div>{"-"}</div>
                                    {periode.datoTom ? DateToDDMMYYYYString(new Date(periode.datoTom)) : ""}
                                </>
                            </Table.DataCell>
                            <Table.DataCell>{hentVisningsnavn(periode.bostatus)}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </ReadMore>
    );
};
export const BoforholdOpplysninger = ({
    ident,
    showResetButton,
    resetTilDataFraFreg,
    onActivateOpplysninger,
    fieldName,
}: {
    ident: string;
    showResetButton: boolean;
    resetTilDataFraFreg: () => void;
    onActivateOpplysninger: (overskriveManuelleOpplysninger: boolean) => void;
    fieldName: `husstandsbarn.${number}.perioder`;
}) => {
    const { aktiveOpplysninger, ikkeAktiverteOpplysninger } = useGetOpplysningerBoforhold();
    const activateGrunnlag = useOnActivateGrunnlag();
    const { lesemodus, setSaveErrorState } = useBehandlingProvider();
    const { setValue } = useFormContext<BoforholdFormValues>();
    const aktivePerioder = aktiveOpplysninger.find((opplysning) => opplysning.ident === ident)?.perioder;
    const ikkeAktivertePerioder = ikkeAktiverteOpplysninger.find((opplysning) => opplysning.ident === ident)?.perioder;
    const hasOpplysningerFraFolkeregistre = aktivePerioder?.length > 0;
    const hasNewOpplysningerFraFolkeregistre = ikkeAktivertePerioder?.length > 0;

    const onActivate = (overskriveManuelleOpplysninger: boolean) => {
        activateGrunnlag.mutation.mutate(
            {
                overskriveManuelleOpplysninger,
                personident: ident,
                grunnlagstype: OpplysningerType.BOFORHOLD,
            },
            {
                onSuccess: (response) => {
                    activateGrunnlag.queryClientUpdater((currentData) => {
                        const oppdatertHusstandsbarn = response.boforhold.husstandsbarn.find(
                            (barn) => barn.ident === ident
                        );
                        setValue(fieldName, oppdatertHusstandsbarn.perioder);

                        onActivateOpplysninger(overskriveManuelleOpplysninger);
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                husstandsbarn: response.boforhold.husstandsbarn,
                                valideringsfeil: {
                                    ...currentData.boforhold.valideringsfeil,
                                    husstandsbarn: currentData.boforhold.valideringsfeil.husstandsmedlem.filter(
                                        (husstandsbarn) =>
                                            husstandsbarn.barn.husstandsmedlemId !== oppdatertHusstandsbarn.id
                                    ),
                                },
                            },
                            aktiveGrunnlagsdata: response.aktiveGrunnlagsdata,
                            ikkeAktiverteEndringerIGrunnlagsdata: response.ikkeAktiverteEndringerIGrunnlagsdata,
                        };
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onActivate(overskriveManuelleOpplysninger),
                    });
                },
            }
        );
    };

    if (lesemodus) return null;

    return (
        <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-4">
                <Opplysninger perioder={aktivePerioder} />

                {!hasNewOpplysningerFraFolkeregistre && hasOpplysningerFraFolkeregistre && showResetButton && (
                    <div className="flex justify-end">
                        <Button
                            variant="tertiary"
                            type="button"
                            size="small"
                            className="w-fit h-fit"
                            onClick={resetTilDataFraFreg}
                        >
                            {text.resetTilOpplysninger}
                        </Button>
                    </div>
                )}
            </div>
            {hasNewOpplysningerFraFolkeregistre && (
                <NyOpplysningerFraFolkeregistreTabell
                    ikkeAktivertePerioder={ikkeAktivertePerioder}
                    onActivate={onActivate}
                    pendingActivate={activateGrunnlag.mutation.isPending ? activateGrunnlag.mutation.variables : null}
                />
            )}
        </div>
    );
};

function NyOpplysningerFraFolkeregistreTabell({
    onActivate,
    ikkeAktivertePerioder,
    pendingActivate,
}: {
    onActivate: (overskriveManuelleOpplysninger: boolean) => void;
    ikkeAktivertePerioder: BostatusperiodeGrunnlagDto[];
    pendingActivate?: AktivereGrunnlagRequestV2;
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
                        <th align="left">{text.label.status}</th>
                    </tr>
                </thead>
                <tbody>
                    {ikkeAktivertePerioder?.map((periode, index) => (
                        <tr key={index + periode.datoFom}>
                            <td width="100px" scope="row">
                                {virkningsOrSoktFraDato && isBeforeDate(periode.datoFom, virkningsOrSoktFraDato)
                                    ? DateToDDMMYYYYString(virkningsOrSoktFraDato)
                                    : DateToDDMMYYYYString(new Date(periode.datoFom))}
                            </td>
                            <td width="100px">
                                {" "}
                                {periode.datoTom ? DateToDDMMYYYYString(new Date(periode.datoTom)) : ""}
                            </td>
                            <td width="250px">{hentVisningsnavn(periode.bostatus)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <HStack gap="6" className="mt-4">
                <Button
                    type="button"
                    variant="secondary"
                    size="xsmall"
                    onClick={() => onActivate(true)}
                    loading={pendingActivate?.overskriveManuelleOpplysninger === true}
                    disabled={pendingActivate?.overskriveManuelleOpplysninger === false}
                >
                    Ja
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="xsmall"
                    onClick={() => onActivate(false)}
                    loading={pendingActivate?.overskriveManuelleOpplysninger === false}
                    disabled={pendingActivate?.overskriveManuelleOpplysninger === true}
                >
                    Nei
                </Button>
            </HStack>
        </Box>
    );
}
