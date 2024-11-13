import elementId from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { Box, Heading, HStack, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString } from "@utils/date-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";

export const BeregnetUnderholdskostnad = ({
    underholdFieldName,
}: {
    underholdFieldName: `underholdskostnaderMedIBehandling.${number}`;
}) => {
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(underholdFieldName);
    const underholdskostnader = underhold.underholdskostnad;

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2 w-full">
            <HStack gap={"2"}>
                <Heading level="2" size="small" id={elementId.seksjon_underholdskostnad_beregnet}>
                    {text.title.underholdskostnad}
                </Heading>
            </HStack>
            <div className="overflow-x-auto whitespace-nowrap">
                <Table size="small" className="table-fixed table bg-white w-fit">
                    <Table.Header>
                        <Table.Row className="align-baseline">
                            <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                {text.label.fraOgMed}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                {text.label.tilOgMed}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[70px]">
                                {text.label.forbruk}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[144px]">
                                {text.label.boutgifter}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[200px]">
                                {text.label.stønadTilBarnetilsyn}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[200px]">
                                {text.label.beregnet_tilsynsutgift}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[144px]">
                                {text.label.barnetrygd}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[174px]">
                                {text.label.underholdskostnad}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {underholdskostnader.map((underholdskostnad, index) => (
                            <Table.Row key={`underholdskostnad-${index}`} className="align-top">
                                <Table.DataCell>
                                    {DateToDDMMYYYYString(dateOrNull(underholdskostnad.periode.fom))}
                                </Table.DataCell>
                                <Table.DataCell>
                                    {DateToDDMMYYYYString(dateOrNull(underholdskostnad.periode.tom))}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {underholdskostnad.forbruk?.toLocaleString("nb-NO") ?? 0}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {underholdskostnad.boutgifter?.toLocaleString("nb-NO") ?? 0}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {underholdskostnad.stønadTilBarnetilsyn?.toLocaleString("nb-NO") ?? 0}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {underholdskostnad.tilsynsutgifter?.toLocaleString("nb-NO") ?? 0}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {underholdskostnad.barnetrygd?.toLocaleString("nb-NO") ?? 0}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {underholdskostnad.total?.toLocaleString("nb-NO") ?? 0}
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </Box>
    );
};
