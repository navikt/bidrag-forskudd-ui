import { Rolletype, TypeBehandling } from "@api/BidragBehandlingApiV1";
import { PersonNavn } from "@common/components/PersonNavn";
import { RolleTag } from "@common/components/RolleTag";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString, deductDays } from "@utils/date-utils";
import React from "react";

import { hasValue } from "@utils/array-utils";
import { inntekterTablesViewRules, InntektTableType } from "../../helpers/inntektFormHelpers";
import { useInntektTableProvider } from "./InntektTableContext";

export const columnWitdhRules = {
    [TypeBehandling.SAeRBIDRAG]: {
        [Rolletype.BM]: {
            [InntektTableType.SKATTEPLIKTIG]: "w-[138px]",
            [InntektTableType.BARNETILLEGG]: "w-[122px]",
            [InntektTableType.UTVIDET_BARNETRYGD]: "w-[112px]",
            [InntektTableType.SMÅBARNSTILLEGG]: "w-[110px]",
            [InntektTableType.KONTANTSTØTTE]: "w-[140px]",
            [InntektTableType.TOTAL_INNTEKTER]: "w-[92px]",
        },
        [Rolletype.BP]: {
            [InntektTableType.SKATTEPLIKTIG]: "w-[150px]",
            [InntektTableType.BARNETILLEGG]: "w-[150px]",
            [InntektTableType.TOTAL_INNTEKTER]: "w-[150px]",
        },
        [Rolletype.BA]: {
            [InntektTableType.SKATTEPLIKTIG]: "w-[150px]",
            [InntektTableType.TOTAL_INNTEKTER]: "w-[150px]",
        },
    },
    [TypeBehandling.FORSKUDD]: {
        [Rolletype.BM]: {
            [InntektTableType.SKATTEPLIKTIG]: "w-[138px]",
            [InntektTableType.BARNETILLEGG]: "w-[122px]",
            [InntektTableType.UTVIDET_BARNETRYGD]: "w-[112px]",
            [InntektTableType.SMÅBARNSTILLEGG]: "w-[94px]",
            [InntektTableType.KONTANTSTØTTE]: "w-[132px]",
            [InntektTableType.TOTAL_INNTEKTER]: "w-[92px]",
        },
    },
};
export const BeregnetInntekter = () => {
    const { rolle } = useInntektTableProvider();
    const {
        inntekter: { beregnetInntekter },
        type,
    } = useGetBehandlingV2();

    const behandlingViewRules = inntekterTablesViewRules[type][rolle.rolletype] as InntektTableType[];
    const behandlingColumnWitdhRules = columnWitdhRules[type][rolle.rolletype] as {
        [_key in InntektTableType]: string;
    };

    const beregnetInntekterForRolle = beregnetInntekter
        .find((inntekt) => inntekt.ident === rolle.ident)
        ?.inntekter?.filter((inntekt) =>
            rolle.rolletype === Rolletype.BA
                ? inntekt.inntektGjelderBarnIdent == null
                : inntekt.inntektGjelderBarnIdent != null
        );

    if (
        !beregnetInntekterForRolle ||
        beregnetInntekterForRolle.length === 0 ||
        beregnetInntekterForRolle.every((v) => v.summertInntektListe.length === 0)
    ) {
        return null;
    }
    return (
        <Box padding="4" background="surface-subtle" key={`beregnet-inntekter-${rolle.id}`} className="w-full">
            <Heading level="2" size="small" spacing>
                {text.title.beregnetTotalt}
            </Heading>
            <div className="grid gap-y-[24px]">
                {beregnetInntekterForRolle.map((inntektPerBarn, index) => (
                    <div
                        className="grid gap-y-2"
                        key={`${rolle.id}-${index}-${inntektPerBarn.inntektGjelderBarnIdent}`}
                    >
                        {inntektPerBarn.inntektGjelderBarnIdent &&
                            rolle.rolletype !== Rolletype.BA &&
                            beregnetInntekterForRolle.length > 1 && (
                                <div className="grid grid-cols-[max-content,max-content,auto] p-2 bg-white border border-[var(--a-border-default)]">
                                    <div className="w-8 mr-2 h-max">
                                        <RolleTag rolleType={Rolletype.BA} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <BodyShort size="small" className="font-bold">
                                            <PersonNavn ident={inntektPerBarn.inntektGjelderBarnIdent}></PersonNavn>
                                        </BodyShort>
                                        <BodyShort size="small">{inntektPerBarn.inntektGjelderBarnIdent}</BodyShort>
                                    </div>
                                </div>
                            )}
                        <div
                            className="overflow-x-auto whitespace-nowrap"
                            key={`table-${index}-${inntektPerBarn.inntektGjelderBarnIdent}`}
                        >
                            <Table size="small" className="table-fixed bg-white w-fit">
                                <Table.Header>
                                    <Table.Row className="align-baseline">
                                        <Table.HeaderCell textSize="small" scope="col" className="w-[198px]">
                                            {text.label.fraOgMed} - {text.label.tilOgMed}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell
                                            textSize="small"
                                            scope="col"
                                            align="right"
                                            className={behandlingColumnWitdhRules[InntektTableType.SKATTEPLIKTIG]}
                                        >
                                            {text.label.skattepliktigeInntekter}
                                        </Table.HeaderCell>
                                        {hasValue(behandlingViewRules, InntektTableType.BARNETILLEGG) && (
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className={behandlingColumnWitdhRules[InntektTableType.BARNETILLEGG]}
                                            >
                                                {text.label.barnetillegg}
                                            </Table.HeaderCell>
                                        )}
                                        {hasValue(behandlingViewRules, InntektTableType.UTVIDET_BARNETRYGD) && (
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className={
                                                    behandlingColumnWitdhRules[InntektTableType.UTVIDET_BARNETRYGD]
                                                }
                                            >
                                                {text.label.utvidetBarnetrygd}
                                            </Table.HeaderCell>
                                        )}
                                        {hasValue(behandlingViewRules, InntektTableType.SMÅBARNSTILLEGG) && (
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className={behandlingColumnWitdhRules[InntektTableType.SMÅBARNSTILLEGG]}
                                            >
                                                {text.label.småbarnstillegg}
                                            </Table.HeaderCell>
                                        )}
                                        {hasValue(behandlingViewRules, InntektTableType.KONTANTSTØTTE) && (
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className={behandlingColumnWitdhRules[InntektTableType.KONTANTSTØTTE]}
                                            >
                                                {text.label.kontantstøtte}
                                            </Table.HeaderCell>
                                        )}
                                        <Table.HeaderCell
                                            textSize="small"
                                            scope="col"
                                            align="right"
                                            className={behandlingColumnWitdhRules[InntektTableType.TOTAL_INNTEKTER]}
                                        >
                                            {text.label.totalt}
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {inntektPerBarn.summertInntektListe.map((delberegningSumInntekt, index) => (
                                        <Table.Row
                                            key={`body-${delberegningSumInntekt}-${index}`}
                                            className="align-top"
                                        >
                                            <Table.DataCell textSize="small">
                                                {DateToDDMMYYYYString(dateOrNull(delberegningSumInntekt.periode.fom))} -{" "}
                                                {delberegningSumInntekt.periode.til
                                                    ? DateToDDMMYYYYString(
                                                          deductDays(dateOrNull(delberegningSumInntekt.periode.til), 1)
                                                      )
                                                    : null}
                                            </Table.DataCell>

                                            <Table.DataCell textSize="small" align="right">
                                                {delberegningSumInntekt.skattepliktigInntekt?.toLocaleString("nb-NO") ??
                                                    0}
                                            </Table.DataCell>
                                            {hasValue(behandlingViewRules, InntektTableType.BARNETILLEGG) && (
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.barnetillegg?.toLocaleString("nb-NO") ?? 0}
                                                </Table.DataCell>
                                            )}
                                            {hasValue(behandlingViewRules, InntektTableType.UTVIDET_BARNETRYGD) && (
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.utvidetBarnetrygd?.toLocaleString(
                                                        "nb-NO"
                                                    ) ?? 0}
                                                </Table.DataCell>
                                            )}
                                            {hasValue(behandlingViewRules, InntektTableType.SMÅBARNSTILLEGG) && (
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.småbarnstillegg?.toLocaleString("nb-NO") ??
                                                        0}
                                                </Table.DataCell>
                                            )}
                                            {hasValue(behandlingViewRules, InntektTableType.KONTANTSTØTTE) && (
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.kontantstøtte?.toLocaleString("nb-NO") ?? 0}
                                                </Table.DataCell>
                                            )}
                                            <Table.DataCell textSize="small" align="right">
                                                {delberegningSumInntekt.totalinntekt.toLocaleString("nb-NO")}
                                            </Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </div>
                ))}
            </div>
        </Box>
    );
};
