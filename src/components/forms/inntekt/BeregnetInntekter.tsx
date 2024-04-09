import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";

import { Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { dateOrNull, DateToDDMMYYYYString } from "../../../utils/date-utils";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";

export const BeregnetInntekter = () => {
    const {
        inntekter: { beregnetInntekter },
    } = useGetBehandlingV2();

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                {text.title.beregnetTotalt}
            </Heading>
            {beregnetInntekter
                .filter((inntekt) => inntekt.inntektGjelderBarnIdent != null)
                .map((inntektPerBarn, index) => (
                    <React.Fragment key={`${index}-${inntektPerBarn.inntektGjelderBarnIdent}`}>
                        {inntektPerBarn.inntektGjelderBarnIdent && (
                            <div className="grid grid-cols-[max-content,max-content,auto] mb-2 p-2 bg-[#EFECF4]">
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
                            <Table size="small" className="table-fixed">
                                <Table.Header>
                                    <Table.Row className="align-baseline">
                                        <Table.HeaderCell scope="col" className="w-[198px]">
                                            {text.label.fraOgMed} - {text.label.tilOgMed}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell scope="col" align="left" className="w-[138px]">
                                            {text.label.skattepliktigeInntekter}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell scope="col" align="left" className="w-[122px]">
                                            {text.label.barnetillegg}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell scope="col" align="left" className="w-[112px]">
                                            {text.label.utvidetBarnetrygd}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell scope="col" align="left" className="w-[94px]">
                                            {text.label.småbarnstillegg}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell scope="col" align="left" className="w-[132px]">
                                            {text.label.kontantstøtte}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell scope="col" align="left" className="w-[92px]">
                                            {text.label.totalt}
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {inntektPerBarn.summertInntektListe.map((delberegningSumInntekt, index) => (
                                        <Table.Row key={`${delberegningSumInntekt}-${index}`} className="align-top">
                                            <Table.DataCell>
                                                {DateToDDMMYYYYString(dateOrNull(delberegningSumInntekt.periode.fom))} -{" "}
                                                {DateToDDMMYYYYString(dateOrNull(delberegningSumInntekt.periode.til))}
                                            </Table.DataCell>
                                            <Table.DataCell align="left">
                                                {delberegningSumInntekt.skattepliktigInntekt?.toLocaleString("nb-NO") ??
                                                    0}
                                            </Table.DataCell>
                                            <Table.DataCell align="left">
                                                {delberegningSumInntekt.barnetillegg?.toLocaleString("nb-NO") ?? 0}
                                            </Table.DataCell>
                                            <Table.DataCell align="left">
                                                {delberegningSumInntekt.utvidetBarnetrygd?.toLocaleString("nb-NO") ?? 0}
                                            </Table.DataCell>
                                            <Table.DataCell align="left">
                                                {delberegningSumInntekt.småbarnstillegg?.toLocaleString("nb-NO") ?? 0}
                                            </Table.DataCell>
                                            <Table.DataCell align="left">
                                                {delberegningSumInntekt.kontantstøtte?.toLocaleString("nb-NO") ?? 0}
                                            </Table.DataCell>
                                            <Table.DataCell align="left">
                                                {delberegningSumInntekt.totalinntekt.toLocaleString("nb-NO")}
                                            </Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </React.Fragment>
                ))}
        </Box>
    );
};
