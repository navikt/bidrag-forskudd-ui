import { FormControlledTextField } from "@common/components/formFields/FormControlledTextField";
import LeggTilPeriodeButton from "@common/components/formFields/FormLeggTilPeriode";
import elementId from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { BodyShort, Box, Heading, HStack, Table } from "@navikt/ds-react";
import { formatterBeløp, formatterBeløpForBeregning } from "@utils/number-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import { useOnSaveTilleggstønad } from "../../../hooks/useOnSaveTilleggstønad";
import {
    FaktiskTilsynsutgiftPeriode,
    StønadTilBarnetilsynPeriode,
    TilleggsstonadPeriode,
    UnderholdkostnadsFormPeriode,
    UnderholdskostnadFormValues,
} from "../../../types/underholdskostnadFormValues";
import { DeleteButton, EditOrSaveButton, UnderholdskostnadPeriode } from "./Barnetilsyn";
import { UnderholdskostnadTabel } from "./UnderholdskostnadTabel";

const Dagsats = ({
    item,
    fieldName,
}: {
    item: TilleggsstonadPeriode;
    fieldName: `underholdskostnaderMedIBehandling.${number}.tilleggsstønad.${number}`;
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
                    step="1"
                    hideLabel
                />
            ) : (
                <div className="h-8 flex items-center justify-end">
                    <BodyShort size="small">{formatterBeløp(item.dagsats)}</BodyShort>
                </div>
            )}
        </>
    );
};
const Totalt12Måned = ({ item }: { item: TilleggsstonadPeriode }) => {
    return (
        <div className="h-8 flex items-center justify-end">
            <BodyShort size="small">{formatterBeløpForBeregning(item.total)}</BodyShort>
        </div>
    );
};

export const TilleggstønadTabel = ({
    underholdFieldName,
}: {
    underholdFieldName: `underholdskostnaderMedIBehandling.${number}`;
}) => {
    const fieldName = `${underholdFieldName}.tilleggsstønad` as const;
    const { getValues, setError, clearErrors } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(underholdFieldName);
    const saveTilleggstønad = useOnSaveTilleggstønad(underhold.id);

    const createPayload = (index: number) => {
        const { id, datoFom, datoTom, dagsats, total } = getValues(`${fieldName}.${index}`);
        const payload = {
            id,
            dagsats: Number(dagsats),
            total,
            periode: { fom: datoFom, tom: datoTom },
        };
        return payload;
    };

    const validateRow = (index: number) => {
        const { datoFom, dagsats } = getValues(`${fieldName}.${index}`);
        if (datoFom === null) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }
        if (dagsats <= 0) {
            setError(`${fieldName}.${index}.dagsats`, {
                type: "notValid",
                message: text.error.dagsatsVerdi,
            });
        } else {
            clearErrors(`${fieldName}.${index}.dagsats`);
        }
    };

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2 w-full">
            <HStack gap={"2"}>
                <Heading level="2" size="small" id={elementId.seksjon_underholdskostnad_tilleggstønad}>
                    {text.title.tilleggsstønad}
                </Heading>
            </HStack>
            <UnderholdskostnadTabel
                fieldName={fieldName}
                saveFn={saveTilleggstønad}
                createPayload={createPayload}
                customRowValidation={validateRow}
            >
                {({
                    controlledFields,
                    onRemovePeriode,
                    onSaveRow,
                    onEditRow,
                    addPeriod,
                }: {
                    controlledFields: UnderholdkostnadsFormPeriode[];
                    onRemovePeriode: (index: number) => void;
                    onSaveRow: (index: number) => void;
                    onEditRow: (index: number) => void;
                    addPeriod: (
                        periode: StønadTilBarnetilsynPeriode | FaktiskTilsynsutgiftPeriode | TilleggsstonadPeriode
                    ) => void;
                }) => (
                    <>
                        {controlledFields.length > 0 && (
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
                                            <Table.HeaderCell
                                                align="right"
                                                textSize="small"
                                                scope="col"
                                                className="w-[384px]"
                                            >
                                                {text.label.dagsats}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[144px]"
                                            >
                                                {text.label.totalt12Måned}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {controlledFields.map((item: TilleggsstonadPeriode, index) => (
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
                                                <Table.DataCell align="right">
                                                    <Dagsats fieldName={`${fieldName}.${index}`} item={item} />
                                                </Table.DataCell>
                                                <Table.DataCell align="right">
                                                    <Totalt12Måned item={item} />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <EditOrSaveButton
                                                        index={index}
                                                        item={item}
                                                        onEditRow={() => onEditRow(index)}
                                                        onSaveRow={() => onSaveRow(index)}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <DeleteButton onDelete={() => onRemovePeriode(index)} />
                                                </Table.DataCell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        )}
                        {
                            <LeggTilPeriodeButton
                                addPeriode={() =>
                                    addPeriod({
                                        datoFom: "",
                                        datoTom: "",
                                        dagsats: 0,
                                        total: 0,
                                        erRedigerbart: true,
                                        kanRedigeres: true,
                                    })
                                }
                            />
                        }
                    </>
                )}
            </UnderholdskostnadTabel>
        </Box>
    );
};
