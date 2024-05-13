import { BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { Fragment } from "react";
import { useFormContext } from "react-hook-form";

import {
    GrunnlagInntektEndringstype,
    IkkeAktivInntektDto,
    InntektDtoV2,
    OpplysningerType,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useAktiveGrunnlagsdata, useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { formatterBeløp } from "../../../utils/number-utils";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
import { transformInntekt } from "../helpers/inntektFormHelpers";

const inntektTypeToOpplysningerMapper = {
    småbarnstillegg: OpplysningerType.SMABARNSTILLEGG,
    utvidetBarnetrygd: OpplysningerType.UTVIDET_BARNETRYGD,
    barnetillegg: OpplysningerType.BARNETILLEGG,
    kontantstøtte: OpplysningerType.KONTANTSTOTTE,
    årsinntekter: OpplysningerType.SKATTEPLIKTIGE_INNTEKTER,
};

export const Opplysninger = ({
    fieldName,
}: {
    fieldName: "småbarnstillegg" | "utvidetBarnetrygd" | "barnetillegg" | "kontantstøtte" | `årsinntekter.${string}`;
}) => {
    const { ikkeAktiverteEndringerIGrunnlagsdata, roller } = useGetBehandlingV2();
    const aktiverGrunnlagFn = useAktiveGrunnlagsdata();
    const virkningsdato = useVirkningsdato();
    const { lesemodus } = useForskudd();
    const { resetField } = useFormContext<InntektFormValues>();
    const transformFn = transformInntekt(virkningsdato);
    const [inntektType] = fieldName.split(".");

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

    const onUpdate = async () => {
        for (const personident in ikkeAktiverteEndringer) {
            if (ikkeAktiverteEndringer[personident].length > 0) {
                await aktiverGrunnlag(personident);
            }
        }
    };
    const aktiverGrunnlag = (aktiverForIdent: string): Promise<unknown> => {
        return aktiverGrunnlagFn.mutateAsync(
            {
                personident: aktiverForIdent,
                type: inntektTypeToOpplysningerMapper[inntektType],
            },
            {
                onSuccess: ({ data }, { personident }) => {
                    if (["barnetillegg", "kontantstøtte"].includes(inntektType)) {
                        const barn = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
                        resetField(inntektType as "barnetillegg" | "kontantstøtte", {
                            defaultValue: barn.reduce(
                                (acc, rolle) => ({
                                    ...acc,
                                    [rolle.ident]: data.inntekter[inntektType]
                                        ?.filter((inntekt) => inntekt.gjelderBarn === rolle.ident)
                                        .map(transformFn),
                                }),
                                {}
                            ),
                        });
                    } else if (inntektType === "årsinntekter") {
                        resetField(`${inntektType}.${personident}`, {
                            defaultValue: data.inntekter[inntektType]
                                .filter((v: InntektDtoV2) => v.ident == personident)
                                .map(transformFn),
                        });
                    } else {
                        resetField(fieldName, {
                            defaultValue: data.inntekter[inntektType]
                                .filter((v: InntektDtoV2) => v.ident == personident)
                                .map(transformFn),
                        });
                    }
                },
            }
        );
    };

    function endringstypeTilVisningsnavn(endringstype: GrunnlagInntektEndringstype): string {
        switch (endringstype) {
            case GrunnlagInntektEndringstype.NY:
                return "Ny";
            case GrunnlagInntektEndringstype.SLETTET:
                return "Fjernes";
            default:
                return "Endring";
        }
    }
    if (lesemodus) return null;

    return (
        <>
            <Box
                padding="4"
                background="surface-default"
                borderWidth="1"
                borderRadius="medium"
                borderColor="border-default"
            >
                <Heading size="xsmall" level="6">
                    {text.alert.nyOpplysninger}
                </Heading>
                <BodyShort size="small">{text.alert.nyOpplysningerInfomelding}</BodyShort>
                {Object.keys(ikkeAktiverteEndringer).map((key) => {
                    if (ikkeAktiverteEndringer[key].length < 1) return null;
                    const rolle = roller.find((rolle) => rolle.ident === key);
                    return (
                        <Fragment key={key}>
                            <BodyShort className="font-bold	mt-4">
                                <RolleTag rolleType={rolle.rolletype} />
                                <PersonNavn ident={key} />
                            </BodyShort>
                            <table className="mt-2">
                                <thead>
                                    <tr>
                                        <th align="left">{text.label.opplysninger}</th>
                                        <th align="left">{text.label.beløp}</th>
                                        <th align="left">{text.label.status}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ikkeAktiverteEndringer[key].map(
                                        (
                                            {
                                                beløp,
                                                rapporteringstype,
                                                periode,
                                                endringstype,
                                                inntektsposterSomErEndret,
                                            },
                                            i
                                        ) => (
                                            <>
                                                <tr key={i + rapporteringstype}>
                                                    <td width="250px" scope="row">
                                                        {hentVisningsnavn(rapporteringstype, periode.fom, periode.til)}
                                                    </td>
                                                    <td width="75px">{formatterBeløp(beløp)}</td>
                                                    <td width="100px">{endringstypeTilVisningsnavn(endringstype)}</td>
                                                </tr>
                                                {inntektsposterSomErEndret.map((i, index) => (
                                                    <tr
                                                        style={
                                                            index == inntektsposterSomErEndret.length - 1
                                                                ? {
                                                                      borderBottom: "1px solid black",
                                                                  }
                                                                : {}
                                                        }
                                                    >
                                                        <td>{i.visningsnavn}</td>
                                                        <td>{formatterBeløp(i.beløp)}</td>
                                                        <td>{endringstypeTilVisningsnavn(i.endringstype)}</td>
                                                    </tr>
                                                ))}
                                            </>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </Fragment>
                    );
                })}
                <Button
                    size="xsmall"
                    variant="secondary"
                    disabled={aktiverGrunnlagFn.isPending || aktiverGrunnlagFn.isSuccess}
                    loading={aktiverGrunnlagFn.isPending}
                    className="mt-2"
                    onClick={onUpdate}
                >
                    Oppdater opplysninger
                </Button>
            </Box>
        </>
    );
};
