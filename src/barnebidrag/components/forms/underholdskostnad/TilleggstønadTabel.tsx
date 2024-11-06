import { FormControlledTextField } from "@common/components/formFields/FormControlledTextField";
import elementId from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { Box, Heading, HStack, Table } from "@navikt/ds-react";
import { formatterBeløp } from "@utils/number-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { useOnSaveTilleggstønad } from "../../../hooks/useOnSaveTilleggstønad";
import { TilleggsstonadPeriode, UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { EditOrSaveButton, UnderholdskostnadPeriode } from "./Barnetilsyn";

const Dagsats = ({
    item,
    fieldName,
}: {
    item: TilleggsstonadPeriode;
    fieldName: `underholdskostnader.${number}.tilleggsstønad.${number}`;
}) => {
    return (
        <>
            {item.erRedigerbart ? (
                <FormControlledTextField
                    name={`${fieldName}.dagsats`}
                    label="Totalt"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    hideLabel
                />
            ) : (
                <div className="h-8 flex items-center justify-end">{formatterBeløp(item.dagsats)}</div>
            )}
        </>
    );
};
const Totalt12Måned = ({
    item,
    fieldName,
}: {
    item: TilleggsstonadPeriode;
    fieldName: `underholdskostnader.${number}.tilleggsstønad.${number}`;
}) => {
    return (
        <>
            {item.erRedigerbart ? (
                <FormControlledTextField
                    name={`${fieldName}.total`}
                    label="Totalt"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    hideLabel
                />
            ) : (
                <div className="h-8 flex items-center justify-end">{formatterBeløp(item.total)}</div>
            )}
        </>
    );
};

export const TilleggstønadTabel = ({ underholdIndex }: { underholdIndex: number }) => {
    const fieldName = `underholdskostnader.${underholdIndex}.tilleggsstønad` as const;
    const { getValues, setValue } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(`underholdskostnader.${underholdIndex}`);
    const tilleggsstønad = underhold.tilleggsstønad;
    const saveTilleggstønad = useOnSaveTilleggstønad(underhold.id);

    const onSaveRow = (index: number) => {
        const { id, datoFom, datoTom, dagsats, total } = getValues(`${fieldName}.${index}`);
        const payload = {
            id,
            dagsats,
            total,
            periode: { fom: datoFom, tom: datoTom },
        };

        saveTilleggstønad.mutation.mutate(payload, {
            onSuccess: (response) => {
                saveTilleggstønad.queryClientUpdater((currentData) => {
                    const updatedTilleggsstønadIndex = currentData.underholdskostnader[
                        underholdIndex
                    ].tilleggsstønad.findIndex((tilleggsstønad) => tilleggsstønad?.id === response?.tilleggsstønad?.id);

                    const updatedTilleggsstønadListe =
                        updatedTilleggsstønadIndex === -1
                            ? currentData.underholdskostnader[underholdIndex].tilleggsstønad.concat(
                                  response.tilleggsstønad
                              )
                            : currentData.underholdskostnader[underholdIndex].tilleggsstønad.toSpliced(
                                  updatedTilleggsstønadIndex,
                                  1,
                                  response.tilleggsstønad
                              );

                    return {
                        ...currentData,
                        underholdskostnader: currentData.underholdskostnader.toSpliced(underholdIndex, 1, {
                            ...currentData.underholdskostnader[underholdIndex],
                            tilleggsstønad: updatedTilleggsstønadListe,
                        }),
                    };
                });
            },
            onError: () => {},
        });
    };

    const onEditRow = (index: number) => {
        const tilleggstønadPeriode = getValues(`${fieldName}.${index}`);
        setValue(`${fieldName}.${index}`, { ...tilleggstønadPeriode, erRedigerbart: true });
    };

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2 w-full">
            <HStack gap={"2"}>
                <Heading level="2" size="small" id={elementId.seksjon_underholdskostnad_tilleggstønad}>
                    {text.title.tilleggstønad}
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
                                {text.label.dagsats}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.totalt12Måned}
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {tilleggsstønad.map((item, index) => (
                            <Table.Row key={item?.id + index} className="align-top">
                                <Table.DataCell textSize="small">
                                    <UnderholdskostnadPeriode
                                        label={text.label.fraOgMed}
                                        fieldName={`${fieldName}.${index}`}
                                        field="datoFom"
                                        item={item}
                                    />
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <UnderholdskostnadPeriode
                                        label={text.label.tilOgMed}
                                        fieldName={`${fieldName}.${index}`}
                                        field="datoTom"
                                        item={item}
                                    />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Dagsats fieldName={`${fieldName}.${index}`} item={item} />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Totalt12Måned fieldName={`${fieldName}.${index}`} item={item} />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <EditOrSaveButton
                                        index={index}
                                        item={item}
                                        onEditRow={() => onEditRow(index)}
                                        onSaveRow={() => onSaveRow(index)}
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
