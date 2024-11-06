import {
    StonadTilBarnetilsynDtoSkolealderEnum,
    StonadTilBarnetilsynDtoTilsynstypeEnum,
} from "@api/BidragBehandlingApiV1";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { KildeIcon } from "@common/components/inntekt/InntektTable";
import elementId from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { Box, Heading, HStack, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import {
    STONAD_TIL_BARNETILSYNS_SKOLEALDER,
    STONAD_TIL_BARNETILSYNS_TYPE,
} from "../../../constants/stønadTilBarnetilsyn";
import { useOnSaveStønadTilBarnetilsyn } from "../../../hooks/useOnSaveStønadTilBarnetilsyn";
import { StønadTilBarnetilsynPeriode, UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { EditOrSaveButton, UnderholdskostnadPeriode } from "./Barnetilsyn";

const Omfang = ({
    fieldName,
    item,
}: {
    editableRow: boolean;
    fieldName: `underholdskostnader.${number}.stønadTilBarnetilsyn.${number}`;
    item: StønadTilBarnetilsynPeriode;
}) => {
    const { clearErrors } = useFormContext<UnderholdskostnadFormValues>();

    return item.erRedigerbart ? (
        <FormControlledSelectField
            name={`${fieldName}.tilsynstype`}
            className="w-fit"
            label={text.label.status}
            options={Object.values(StonadTilBarnetilsynDtoTilsynstypeEnum).map((value) => ({
                value,
                text: STONAD_TIL_BARNETILSYNS_TYPE[value],
            }))}
            hideLabel
            onSelect={() => clearErrors(`${fieldName}.tilsynstype`)}
        />
    ) : (
        <div className="h-8 flex items-center">{STONAD_TIL_BARNETILSYNS_TYPE[item.tilsynstype]}</div>
    );
};

const StønadTilBarnetilsyn = ({
    fieldName,
    item,
}: {
    editableRow: boolean;
    fieldName: `underholdskostnader.${number}.stønadTilBarnetilsyn.${number}`;
    item: StønadTilBarnetilsynPeriode;
}) => {
    const { clearErrors } = useFormContext<UnderholdskostnadFormValues>();

    return item.erRedigerbart ? (
        <FormControlledSelectField
            name={`${fieldName}.skolealder`}
            className="w-fit"
            label={text.label.status}
            options={Object.values(StonadTilBarnetilsynDtoSkolealderEnum).map((value) => ({
                value,
                text: STONAD_TIL_BARNETILSYNS_SKOLEALDER[value],
            }))}
            hideLabel
            onSelect={() => clearErrors(`${fieldName}.skolealder`)}
        />
    ) : (
        <div className="h-8 flex items-center">{STONAD_TIL_BARNETILSYNS_SKOLEALDER[item.skolealder]}</div>
    );
};

export const BarnetilsynTabel = ({ underholdIndex }: { underholdIndex: number }) => {
    const fieldName = `underholdskostnader.${underholdIndex}.stønadTilBarnetilsyn` as const;
    const { getValues, setValue } = useFormContext<UnderholdskostnadFormValues>();
    const underhold = getValues(`underholdskostnader.${underholdIndex}`);
    const stønadTilBarnetilsyn = underhold.stønadTilBarnetilsyn;
    const saveStønadTilBarnetilsyn = useOnSaveStønadTilBarnetilsyn(underhold.id.toString());

    const onSaveRow = (index: number) => {
        const { id, datoFom, datoTom, skolealder, tilsynstype, kilde } = getValues(`${fieldName}.${index}`);
        const payload = {
            id,
            skolealder,
            tilsynstype,
            kilde,
            periode: { fom: datoFom, tom: datoTom },
        };

        saveStønadTilBarnetilsyn.mutation.mutate(payload, {
            onSuccess: (response) => {
                saveStønadTilBarnetilsyn.queryClientUpdater((currentData) => {
                    const updatedStønadTilBarnetilsynIndex = currentData.underholdskostnader[
                        underholdIndex
                    ].stønadTilBarnetilsyn.findIndex((stønad) => stønad?.id === response?.stønadTilBarnetilsyn?.id);

                    const updatedStønadTilBarnetilsynListe =
                        updatedStønadTilBarnetilsynIndex === -1
                            ? currentData.underholdskostnader[underholdIndex].stønadTilBarnetilsyn.concat(
                                  response.stønadTilBarnetilsyn
                              )
                            : currentData.underholdskostnader[underholdIndex].stønadTilBarnetilsyn.toSpliced(
                                  updatedStønadTilBarnetilsynIndex,
                                  1,
                                  response.stønadTilBarnetilsyn
                              );

                    return {
                        ...currentData,
                        underholdskostnader: currentData.underholdskostnader.toSpliced(underholdIndex, 1, {
                            ...currentData.underholdskostnader[underholdIndex],
                            stønadTilBarnetilsyn: updatedStønadTilBarnetilsynListe,
                        }),
                    };
                });
            },
            onError: () => {},
        });
    };

    const onEditRow = (index: number) => {
        const stønadTilBarnetilsynPeriode = getValues(`${fieldName}.${index}`);
        setValue(`${fieldName}.${index}`, { ...stønadTilBarnetilsynPeriode, erRedigerbart: true });
    };

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2 w-full">
            <HStack gap={"2"}>
                <Heading level="2" size="small" id={elementId.seksjon_underholdskostnad_barnetilsyn}>
                    {text.title.stønadTilBarnetilsyn}
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
                                {text.label.stønadTilBarnetilsyn}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.omfang}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.kilde}
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {stønadTilBarnetilsyn.map((item, stønadIndex) => (
                            <Table.Row key={item?.id + stønadIndex} className="align-top">
                                <Table.DataCell textSize="small">
                                    <UnderholdskostnadPeriode
                                        index={stønadIndex}
                                        label={text.label.fraOgMed}
                                        fieldName={fieldName}
                                        field="datoFom"
                                        item={item}
                                    />
                                </Table.DataCell>
                                <Table.DataCell textSize="small">
                                    <UnderholdskostnadPeriode
                                        index={stønadIndex}
                                        label={text.label.tilOgMed}
                                        fieldName={fieldName}
                                        field="datoTom"
                                        item={item}
                                    />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <StønadTilBarnetilsyn
                                        fieldName={`${fieldName}.${stønadIndex}`}
                                        item={item}
                                        editableRow={item.erRedigerbart}
                                    />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Omfang
                                        fieldName={`${fieldName}.${stønadIndex}`}
                                        item={item}
                                        editableRow={item.erRedigerbart}
                                    />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <KildeIcon kilde={item.kilde} />
                                </Table.DataCell>
                                <Table.DataCell>
                                    <EditOrSaveButton
                                        index={stønadIndex}
                                        item={item}
                                        onEditRow={() => onEditRow(stønadIndex)}
                                        onSaveRow={() => onSaveRow(stønadIndex)}
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
