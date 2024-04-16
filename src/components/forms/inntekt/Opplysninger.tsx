import { BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React from "react";

import {
    IkkeAktivInntektDto,
    IkkeAktivInntektDtoEndringstypeEnum,
    OpplysningerType,
    RolleDto,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useAktiveGrunnlagsdata, useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";

const inntektTypeToOpplysningerMapper = {
    småbarnstillegg: OpplysningerType.SMABARNSTILLEGG,
    utvidetBarnetrygd: OpplysningerType.UTVIDET_BARNETRYGD,
    barnetillegg: OpplysningerType.BARNETILLEGG,
    kontantstøtte: OpplysningerType.KONTANTSTOTTE,
    årsinntekter: OpplysningerType.SKATTEPLIKTIGE_INNTEKTER,
};

export const Opplysninger = ({
    fieldName,
    roller,
}: {
    fieldName:
        | "småbarnstillegg"
        | "utvidetBarnetrygd"
        | `årsinntekter.${string}`
        | `barnetillegg.${string}`
        | `kontantstøtte.${string}`;
    roller: RolleDto[];
}) => {
    const { ikkeAktiverteEndringerIGrunnlagsdata } = useGetBehandlingV2();
    const aktiverGrunnlagFn = useAktiveGrunnlagsdata();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [inntektType, ident] = fieldName.split(".");

    if (ikkeAktiverteEndringerIGrunnlagsdata.inntekter[inntektType].length === 0) return null;

    const ikkeAktiverteEndringer: { [p: string]: IkkeAktivInntektDto[] } = roller.reduce(
        (acc, rolle) => ({
            ...acc,
            [rolle.ident]: ikkeAktiverteEndringerIGrunnlagsdata.inntekter[inntektType]?.filter((v) => {
                if (["barnetillegg", "kontantstøtte"].includes(inntektType)) {
                    return v.gjelderBarn === rolle.ident;
                }
                return v.ident === rolle.ident;
            }),
        }),
        {}
    );

    return (
        <>
            <Box padding="4" background="surface-default" borderWidth="1">
                <Heading size="small">{text.alert.nyOpplysninger}</Heading>
                <BodyShort>{text.alert.nyOpplysningerInfomelding}</BodyShort>
                {Object.keys(ikkeAktiverteEndringer).map((key) => {
                    if (ikkeAktiverteEndringer[key].length < 1) return null;
                    const rolle = roller.find((rolle) => rolle.ident === key);
                    return (
                        <>
                            <BodyShort className="font-bold	mt-4">
                                <RolleTag rolleType={rolle.rolletype} />
                                <PersonNavn ident={key} />
                            </BodyShort>
                            <table key={key} className="mt-2">
                                <thead>
                                    <tr>
                                        <th align="left">{text.label.opplysninger}</th>
                                        <th align="left">{text.label.beløp}</th>
                                        <th align="left">{text.label.status}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ikkeAktiverteEndringer[key].map(
                                        ({ beløp, rapporteringstype, periode, endringstype }, i) => (
                                            <tr key={i + rapporteringstype}>
                                                <td width="250px" scope="row">
                                                    {hentVisningsnavn(rapporteringstype, periode.fom, periode.til)}
                                                </td>
                                                <td width="75px">{beløp}</td>
                                                <td width="100px">
                                                    {endringstype == IkkeAktivInntektDtoEndringstypeEnum.NY
                                                        ? " Ny"
                                                        : endringstype == IkkeAktivInntektDtoEndringstypeEnum.SLETTET
                                                          ? "Fjernes"
                                                          : "Endring"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    );
                })}
                <Button
                    size="xsmall"
                    variant="secondary"
                    disabled={aktiverGrunnlagFn.isPending || aktiverGrunnlagFn.isSuccess}
                    loading={aktiverGrunnlagFn.isPending}
                    className="mt-2"
                    onClick={() =>
                        aktiverGrunnlagFn.mutate({
                            personident: ident,
                            type: inntektTypeToOpplysningerMapper[inntektType],
                        })
                    }
                >
                    Oppdater opplysninger
                </Button>
            </Box>
        </>
    );
};
