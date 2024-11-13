import {
    BehandlingDtoV2,
    FaktiskTilsynsutgiftDto,
    OppdatereUnderholdResponse,
    SletteUnderholdselementTypeEnum,
    StonadTilBarnetilsynDto,
    TilleggsstonadDto,
} from "@api/BidragBehandlingApiV1";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { UseMutationResult } from "@tanstack/react-query";
import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { UnderholdskostnadTables } from "../../../context/BarnebidragProviderWrapper";
import { useOnDeleteUnderholdsObjekt } from "../../../hooks/useOnDeleteUnderholdsObjekt";
import {
    FaktiskTilsynsutgiftPeriode,
    StønadTilBarnetilsynPeriode,
    TilleggsstonadPeriode,
    UnderholdskostnadFormValues,
} from "../../../types/underholdskostnadFormValues";

const fieldNameToSletteUnderholdselementTypeEnum = {
    stønadTilBarnetilsyn: SletteUnderholdselementTypeEnum.STONADTILBARNETILSYN,
    faktiskTilsynsutgift: SletteUnderholdselementTypeEnum.FAKTISK_TILSYNSUTGIFT,
    tilleggsstønad: SletteUnderholdselementTypeEnum.TILLEGGSSTONAD,
};

export const UnderholdskostnadTabel = ({
    fieldName,
    customRowValidation,
    saveFn,
    createPayload,
    children,
}: {
    fieldName: UnderholdskostnadTables;
    customRowValidation?: (index: number) => void;
    saveFn: {
        mutation: UseMutationResult<
            OppdatereUnderholdResponse,
            Error,
            StonadTilBarnetilsynDto | FaktiskTilsynsutgiftDto | TilleggsstonadDto,
            unknown
        >;
        queryClientUpdater: (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) => BehandlingDtoV2;
    };
    createPayload: (index: number) => StonadTilBarnetilsynDto | FaktiskTilsynsutgiftDto | TilleggsstonadDto;
    children: React.FunctionComponent;
}) => {
    const {
        søktFomDato,
        virkningstidspunkt: { virkningstidspunkt },
    } = useGetBehandlingV2();
    const { setSaveErrorState } = useBehandlingProvider();
    const { control, clearErrors, getValues, getFieldState, setValue } = useFormContext<UnderholdskostnadFormValues>();
    const fieldArray = useFieldArray({
        control,
        name: fieldName,
    });
    const watchFieldArray = useWatch({ control, name: fieldName });
    const controlledFields = fieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray?.[index],
        };
    });

    const [underholdField, underholdIndexAsString, underholdskostnadType] = fieldName.split(".");
    const underholdIndex = Number(underholdIndexAsString);
    const underhold = getValues(
        `${underholdField as "underholdskostnaderMedIBehandling" | "underholdskostnaderAndreBarn"}.${underholdIndex}`
    );
    const deleteUnderhold = useOnDeleteUnderholdsObjekt();

    const saveRow = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const payload = createPayload(index);

        const editedPeriod = {
            ...periode,
            erRedigerbart: false,
        };

        setValue(`${fieldName}.${index}`, editedPeriod);

        saveFn.mutation.mutate(payload, {
            onSuccess: (response) => {
                const updatedPeriod = response[underholdskostnadType];
                setValue(`${fieldName}.${index}`, {
                    ...editedPeriod,
                    id: updatedPeriod.id,
                });

                saveFn.queryClientUpdater((currentData) => {
                    const updatedPeriodeIndex = currentData.underholdskostnader[underholdIndex][
                        underholdskostnadType
                    ].findIndex((currentPeriode) => currentPeriode?.id === updatedPeriod.id);

                    const updatedListe =
                        updatedPeriodeIndex === -1
                            ? currentData.underholdskostnader[underholdIndex][underholdskostnadType].concat(
                                  updatedPeriod
                              )
                            : currentData.underholdskostnader[underholdIndex][underholdskostnadType].toSpliced(
                                  updatedPeriodeIndex,
                                  1,
                                  updatedPeriod
                              );

                    return {
                        ...currentData,
                        underholdskostnader: currentData.underholdskostnader.toSpliced(Number(underholdIndex), 1, {
                            ...currentData.underholdskostnader[underholdIndex],
                            [underholdskostnadType]: updatedListe,
                            underholdskostnad: response.underholdskostnad,
                        }),
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => saveRow(index),
                });
            },
        });
    };

    const onSaveRow = (index: number) => {
        customRowValidation?.(index);
        const fieldState = getFieldState(`${fieldName}.${index}`);
        if (fieldState.error) return;

        saveRow(index);
    };

    const onEditRow = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        setValue(`${fieldName}.${index}`, { ...periode, erRedigerbart: true });
    };

    const onRemovePeriode = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);

        if (periode.id) {
            const payload = {
                idUnderhold: underhold.id,
                idElement: periode.id,
                type: fieldNameToSletteUnderholdselementTypeEnum[underholdskostnadType],
            };

            deleteUnderhold.mutation.mutate(payload, {
                onSuccess: (response) => {
                    clearErrors(`${fieldName}.${index}`);
                    fieldArray.remove(index);

                    deleteUnderhold.queryClientUpdater((currentData) => {
                        const updatedList = currentData.underholdskostnader[underholdIndex][
                            underholdskostnadType
                        ].filter((currentPeriod) => currentPeriod.id !== periode.id);

                        return {
                            ...currentData,
                            underholdskostnader: currentData.underholdskostnader.toSpliced(underholdIndex, 1, {
                                ...currentData.underholdskostnader[underholdIndex],
                                [underholdskostnadType]: updatedList,
                                underholdskostnad: response.underholdskostnad,
                            }),
                        };
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onRemovePeriode(index),
                    });
                },
            });
        }

        clearErrors(`${fieldName}.${index}`);
        fieldArray.remove(index);
    };

    const addPeriod = (periode: StønadTilBarnetilsynPeriode | FaktiskTilsynsutgiftPeriode | TilleggsstonadPeriode) => {
        fieldArray.append({
            ...periode,
            datoFom: virkningstidspunkt ?? søktFomDato,
            erRedigerbart: true,
            kanRedigeres: true,
        });
    };

    return children({
        controlledFields,
        onEditRow,
        onSaveRow,
        addPeriod,
        onRemovePeriode,
    });
};
