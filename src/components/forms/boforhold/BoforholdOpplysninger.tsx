import { BodyShort, Box, Button, Heading, HStack, ReadMore, Table, Tag } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { HusstandsbarnGrunnlagPeriodeDto, OpplysningerType } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetOpplysningerBoforhold } from "../../../hooks/useApiData";
import { useOnActivateGrunnlag } from "../../../hooks/useOnActivateGrunnlag";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { DateToDDMMYYYYString, isBeforeDate } from "../../../utils/date-utils";

const Header = ({ nyttTag }: { nyttTag: boolean }) => (
    <BodyShort size="small" className="flex h-2">
        {text.title.opplysningerFraFolkeregistret}{" "}
        {nyttTag && (
            <Tag variant="success" size="xsmall" className="w-fit h-1.5 p-1 rounded ml-2">
                Nytt
            </Tag>
        )}
    </BodyShort>
);
const Opplysninger = ({ perioder, nyttTag }: { perioder: HusstandsbarnGrunnlagPeriodeDto[]; nyttTag?: boolean }) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    if (!perioder) {
        return null;
    }

    return (
        <ReadMore header={<Header nyttTag={nyttTag} />} size="small">
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
    fieldName,
}: {
    ident: string;
    showResetButton: boolean;
    resetTilDataFraFreg: () => void;
    fieldName: `husstandsbarn.${number}.perioder`;
}) => {
    const { aktiveOpplysninger, ikkeAktiverteOpplysninger } = useGetOpplysningerBoforhold();
    const activateGrunnlag = useOnActivateGrunnlag();
    const { lesemodus } = useForskudd();
    const { setValue } = useFormContext<BoforholdFormValues>();
    const aktivePerioder = aktiveOpplysninger.find((opplysning) => opplysning.ident == ident)?.perioder;
    const ikkeAktivertePerioder = ikkeAktiverteOpplysninger.find((opplysning) => opplysning.ident == ident)?.perioder;
    const hasOpplysningerFraFolkeregistre = aktivePerioder?.length > 0;
    const nyeOpplysningerEnabled = true;
    const hasNewOpplysningerFraFolkeregistre = nyeOpplysningerEnabled && ikkeAktivertePerioder?.length > 0;

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

                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                husstandsbarn: response.boforhold.husstandsbarn,
                                valideringsfeil: {
                                    ...currentData.boforhold.valideringsfeil,
                                    husstandsbarn: currentData.boforhold.valideringsfeil.husstandsbarn.filter(
                                        (husstandsbarn) => husstandsbarn.barn.tekniskId !== oppdatertHusstandsbarn.id
                                    ),
                                },
                            },
                            aktiveGrunnlagsdata: response.aktiveGrunnlagsdata,
                            ikkeAktiverteEndringerIGrunnlagsdata: response.ikkeAktiverteEndringerIGrunnlagsdata,
                        };
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
                {hasNewOpplysningerFraFolkeregistre && (
                    <div className="justify-end">
                        <Opplysninger perioder={ikkeAktivertePerioder} nyttTag />
                    </div>
                )}
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
                />
            )}
        </div>
    );
};

function NyOpplysningerFraFolkeregistreTabell({
    onActivate,
    ikkeAktivertePerioder,
}: {
    onActivate: (overskriveManuelleOpplysninger: boolean) => void;
    ikkeAktivertePerioder: HusstandsbarnGrunnlagPeriodeDto[];
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
            <Table size="small" className="table-fixed opplysninger">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{text.label.fraOgMed}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.tilOgMed}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.status}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.kilde}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {ikkeAktivertePerioder?.map((periode, index) => (
                        <Table.Row key={`${periode.bostatus}-${index}`}>
                            <Table.DataCell>
                                {virkningsOrSoktFraDato && isBeforeDate(periode.datoFom, virkningsOrSoktFraDato)
                                    ? DateToDDMMYYYYString(virkningsOrSoktFraDato)
                                    : DateToDDMMYYYYString(new Date(periode.datoFom))}
                            </Table.DataCell>
                            <Table.DataCell>
                                {periode.datoTom ? DateToDDMMYYYYString(new Date(periode.datoTom)) : ""}
                            </Table.DataCell>
                            <Table.DataCell>{hentVisningsnavn(periode.bostatus)}</Table.DataCell>
                            <Table.DataCell>{KildeTexts.OFFENTLIG}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            <HStack gap="2" className="mt-4">
                <Button type="button" variant="secondary" size="small" onClick={() => onActivate(true)}>
                    Ja
                </Button>
                <Button type="button" variant="secondary" size="small" onClick={() => onActivate(false)}>
                    Nei
                </Button>
            </HStack>
        </Box>
    );
}
