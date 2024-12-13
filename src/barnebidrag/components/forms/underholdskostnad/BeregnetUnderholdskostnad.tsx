import elementId from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { BodyShort, Box, Heading, HStack, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString } from "@utils/date-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { formatterBeløpForBeregning } from "../../../../utils/number-utils";
import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import BeregningsdetaljerUnderholdskostnad from "./BeregningsdetaljerUnderholdskostnad";

export const BeregnetUnderholdskostnad = ({
    underholdFieldName,
}: {
    underholdFieldName: `underholdskostnaderMedIBehandling.${number}`;
}) => {
    const { underholdskostnader } = useGetBehandlingV2();
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(underholdFieldName);
    const beregnetUnderholdskostnad = underholdskostnader.find((u) => u.id === underhold.id).underholdskostnad;

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
                            <Table.HeaderCell textSize="small" scope="col" className="w-[124px]">
                                {text.label.fraOgMed}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" className="w-[124px]">
                                {text.label.tilOgMed}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[75px]">
                                {text.label.forbruk}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[90px]">
                                {text.label.boutgifter}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[115px]">
                                {text.label.stønadTilBarnetilsyn}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[100px]">
                                {text.label.beregnet_tilsynsutgift}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[95px]">
                                {text.label.barnetrygd}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[145px]">
                                {text.label.underholdskostnad}
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                textSize="small"
                                scope="col"
                                align="right"
                                className="w-[50px]"
                            ></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {beregnetUnderholdskostnad.map((underholdskostnad, index) => (
                            <Table.ExpandableRow
                                expansionDisabled={!underholdskostnad.beregningsdetaljer}
                                content={
                                    <BeregningsdetaljerUnderholdskostnad
                                        detaljer={underholdskostnad.beregningsdetaljer}
                                    />
                                }
                                key={`underholdskostnad-${index}`}
                                togglePlacement="right"
                                className="align-top"
                            >
                                <Table.DataCell>
                                    <BodyShort size="small">
                                        {DateToDDMMYYYYString(dateOrNull(underholdskostnad.periode.fom))}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell>
                                    <BodyShort size="small">
                                        {DateToDDMMYYYYString(dateOrNull(underholdskostnad.periode.tom))}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    <BodyShort size="small">
                                        {formatterBeløpForBeregning(underholdskostnad.forbruk)}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    <BodyShort size="small">
                                        {formatterBeløpForBeregning(underholdskostnad.boutgifter)}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    <BodyShort size="small">
                                        {formatterBeløpForBeregning(underholdskostnad.stønadTilBarnetilsyn)}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    <BodyShort size="small">
                                        {formatterBeløpForBeregning(underholdskostnad.tilsynsutgifter)}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    <BodyShort size="small">
                                        {formatterBeløpForBeregning(underholdskostnad.barnetrygd)}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    <BodyShort size="small">
                                        {formatterBeløpForBeregning(underholdskostnad.total)}
                                    </BodyShort>
                                </Table.DataCell>
                            </Table.ExpandableRow>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </Box>
    );
};
