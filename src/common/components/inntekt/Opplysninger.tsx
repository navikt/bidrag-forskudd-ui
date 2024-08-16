import {
    GrunnlagInntektEndringstype,
    IkkeAktivInntektDto,
    InntektDtoV2,
    OpplysningerType,
    Rolletype,
} from "@api/BidragBehandlingApiV1";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { PersonNavn } from "@common/components/PersonNavn";
import { RolleTag } from "@common/components/RolleTag";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { transformInntekt } from "@common/helpers/inntektFormHelpers";
import { useAktiveGrunnlagsdata, useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { hentVisningsnavn } from "@common/hooks/useVisningsnavn";
import { InntektFormValues } from "@common/types/inntektFormValues";
import { BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import { formatterBeløp } from "@utils/number-utils";
import React, { Fragment } from "react";
import { useFormContext } from "react-hook-form";

import { useInntektTableProvider } from "./InntektTableContext";

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
    fieldName:
        | `småbarnstillegg.${string}`
        | `utvidetBarnetrygd.${string}`
        | `årsinntekter.${string}`
        | `barnetillegg.${string}.${string}`
        | `kontantstøtte.${string}.${string}`;
}) => {
    const { ident } = useInntektTableProvider();
    const { ikkeAktiverteEndringerIGrunnlagsdata, roller, feilOppståttVedSisteGrunnlagsinnhenting } =
        useGetBehandlingV2();
    const aktiverGrunnlagFn = useAktiveGrunnlagsdata();
    const virkningsdato = useVirkningsdato();
    const { lesemodus, setSaveErrorState } = useBehandlingProvider();
    const { resetField } = useFormContext<InntektFormValues>();
    const [inntektType] = fieldName.split(".");
    const transformFn = transformInntekt(virkningsdato);
    const feilVedInnhentingAvOffentligData = feilOppståttVedSisteGrunnlagsinnhenting?.some(
        (innhentingsFeil) =>
            ident === innhentingsFeil.rolle.ident &&
            innhentingsFeil.grunnlagsdatatype === inntektTypeToOpplysningerMapper[inntektType]
    );

    if (ikkeAktiverteEndringerIGrunnlagsdata.inntekter[inntektType].length === 0) return null;

    const ikkeAktiverteEndringer: { [p: string]: IkkeAktivInntektDto[] } = roller.reduce(
        (acc, rolle) => ({
            ...acc,
            [rolle.ident]: ikkeAktiverteEndringerIGrunnlagsdata.inntekter[inntektType]?.filter((v) => {
                if (["barnetillegg", "kontantstøtte"].includes(inntektType)) {
                    return v.gjelderBarn === rolle.ident && v.ident === ident;
                }
                return v.ident === rolle.ident;
            }),
        }),
        {}
    );

    const onUpdate = async () => {
        for (const gjelderIdent in ikkeAktiverteEndringer) {
            if (ikkeAktiverteEndringer[gjelderIdent].length > 0) {
                await aktiverGrunnlag(ident, gjelderIdent);
                //Bare ta den første da aktivering av ett barn aktiverer alle
                return;
            }
        }
    };
    const aktiverGrunnlag = (aktiverForIdent: string, aktiverForBarn?: string): Promise<unknown> => {
        return aktiverGrunnlagFn.mutateAsync(
            {
                personident: aktiverForIdent,
                gjelderIdent: aktiverForBarn,
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
                                    [ident]: {
                                        ...acc[ident],
                                        [rolle.ident]:
                                            data.inntekter[inntektType]
                                                ?.filter((inntekt) => inntekt.gjelderBarn === rolle.ident)
                                                .map(transformFn) ?? [],
                                    },
                                }),
                                {}
                            ),
                        });
                    } else if (inntektType === "årsinntekter") {
                        resetField(`${inntektType}.${personident}`, {
                            defaultValue: data.inntekter[inntektType]
                                .filter((v: InntektDtoV2) => v.ident === personident)
                                .map(transformFn),
                        });
                    } else {
                        resetField(fieldName, {
                            defaultValue: data.inntekter[inntektType]
                                .filter((v: InntektDtoV2) => v.ident === personident)
                                .map(transformFn),
                        });
                    }
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => aktiverGrunnlag(aktiverForIdent),
                    });
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
    if (
        lesemodus ||
        (inntektType === "årsinntekter" && ident && ikkeAktiverteEndringer[ident].length < 1) ||
        Object.values(ikkeAktiverteEndringer).every((ikkeAktiverteEndring) => ikkeAktiverteEndring.length < 1)
    )
        return null;

    return (
        <>
            {feilVedInnhentingAvOffentligData && (
                <BehandlingAlert variant="info" className="w-[708px] mb-2">
                    <Heading size="small" level="3">
                        {text.alert.feilVedInnhentingAvOffentligData}
                    </Heading>
                    {text.feilVedInnhentingAvOffentligData}
                </BehandlingAlert>
            )}
            <Box
                padding="4"
                background="surface-default"
                borderWidth="1"
                borderRadius="medium"
                borderColor="border-default"
                className="w-[708px]"
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
                                            <Fragment key={i + rapporteringstype}>
                                                <tr>
                                                    <td width="250px" scope="row">
                                                        {hentVisningsnavn(rapporteringstype, periode.fom, periode.til)}
                                                    </td>
                                                    <td width="75px">{formatterBeløp(beløp)}</td>
                                                    <td width="100px">{endringstypeTilVisningsnavn(endringstype)}</td>
                                                </tr>
                                                {inntektsposterSomErEndret.map((i, index) => (
                                                    <tr
                                                        key={i.visningsnavn + index}
                                                        style={
                                                            index === inntektsposterSomErEndret.length - 1
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
                                            </Fragment>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </Fragment>
                    );
                })}
                <Button
                    size="xsmall"
                    type="button"
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
