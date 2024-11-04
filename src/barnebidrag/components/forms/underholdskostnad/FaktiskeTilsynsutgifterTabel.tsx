import elementId from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { Box, Heading, HStack, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { EditOrSaveButton, UnderholdskostnadPeriode } from "./Barnetilsyn";

const TotalTilysnsutgift = () => {
    return <div></div>;
};

const Kostpenger = () => {
    return <div></div>;
};

const Kommentar = () => {
    return <div></div>;
};

export const FaktiskeTilsynsutgifterTabel = ({ underholdIndex }: { underholdIndex: number }) => {
    const fieldName = `underholdskostnader.${underholdIndex}.faktiskeTilsynsutgifter` as const;
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const faktiskeTilsynsutgifter = getValues(fieldName);

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2 w-full">
            <HStack gap={"2"}>
                <Heading level="2" size="small" id={elementId.seksjon_underholdskostnad_tilysnsutgifter}>
                    {text.title.faktiskeTilsynsutgifter}
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
                            <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                {text.label.totalTilysnsutgift}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.kostpenger}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.totalt12Måned}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.kommentar}
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {faktiskeTilsynsutgifter.map((item, index) => (
                            <Table.Row key={item?.id + index} className="align-top">
                                <Table.DataCell textSize="small">
                                    <UnderholdskostnadPeriode
                                        index={index}
                                        label={text.label.fraOgMed}
                                        fieldName={fieldName}
                                        field="datoFom"
                                        item={item}
                                    />
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <UnderholdskostnadPeriode
                                        index={index}
                                        label={text.label.tilOgMed}
                                        fieldName={fieldName}
                                        field="datoTom"
                                        item={item}
                                    />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <TotalTilysnsutgift />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Kostpenger />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Kommentar />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <EditOrSaveButton
                                        index={index}
                                        item={item}
                                        onEditRow={() => {}}
                                        onSaveRow={() => {}}
                                    />
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </Box>
    );
};
