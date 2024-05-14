import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";

import { Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { dateOrNull, DateToDDMMYYYYString, deductDays } from "../../../utils/date-utils";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";

export const BeregnetInntekter = () => {
    const {
        inntekter: { beregnetInntekter },
    } = useGetBehandlingV2();

    return (
        <Box padding="4" background="surface-subtle">
            <Heading level="3" size="medium" className="mb-4">
                {text.title.beregnetTotalt}
            </Heading>
            <div className="grid gap-y-[24px]">
                {beregnetInntekter
                    .filter((inntekt) => inntekt.inntektGjelderBarnIdent != null)
                    .map((inntektPerBarn, index) => (
                        <div className="grid gap-y-2" key={`${index}-${inntektPerBarn.inntektGjelderBarnIdent}`}>
                            {inntektPerBarn.inntektGjelderBarnIdent && (
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
                            <div className="overflow-x-auto whitespace-nowrap">
                                <Table size="small" className="table-fixed bg-white">
                                    <Table.Header>
                                        <Table.Row className="align-baseline">
                                            <Table.HeaderCell textSize="small" scope="col" className="w-[198px]">
                                                {text.label.fraOgMed} - {text.label.tilOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[138px]"
                                            >
                                                {text.label.skattepliktigeInntekter}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[122px]"
                                            >
                                                {text.label.barnetillegg}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[112px]"
                                            >
                                                {text.label.utvidetBarnetrygd}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[94px]"
                                            >
                                                {text.label.småbarnstillegg}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[132px]"
                                            >
                                                {text.label.kontantstøtte}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[92px]"
                                            >
                                                {text.label.totalt}
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {inntektPerBarn.summertInntektListe.map((delberegningSumInntekt, index) => (
                                            <Table.Row key={`${delberegningSumInntekt}-${index}`} className="align-top">
                                                <Table.DataCell textSize="small">
                                                    {DateToDDMMYYYYString(
                                                        dateOrNull(delberegningSumInntekt.periode.fom)
                                                    )}{" "}
                                                    -{" "}
                                                    {delberegningSumInntekt.periode.til
                                                        ? DateToDDMMYYYYString(
                                                              deductDays(
                                                                  dateOrNull(delberegningSumInntekt.periode.til),
                                                                  1
                                                              )
                                                          )
                                                        : null}
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.skattepliktigInntekt?.toLocaleString(
                                                        "nb-NO"
                                                    ) ?? 0}
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.barnetillegg?.toLocaleString("nb-NO") ?? 0}
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.utvidetBarnetrygd?.toLocaleString(
                                                        "nb-NO"
                                                    ) ?? 0}
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.småbarnstillegg?.toLocaleString("nb-NO") ??
                                                        0}
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small" align="right">
                                                    {delberegningSumInntekt.kontantstøtte?.toLocaleString("nb-NO") ?? 0}
                                                </Table.DataCell>
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
