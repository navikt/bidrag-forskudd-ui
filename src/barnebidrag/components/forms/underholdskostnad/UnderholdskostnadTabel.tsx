import {
    BehandlingDtoV2,
    FaktiskTilsynsutgiftDto,
    OppdatereUnderholdResponse,
    SletteUnderholdselementTypeEnum,
    StonadTilBarnetilsynDto,
    TilleggsstonadDto,
} from "@api/BidragBehandlingApiV1";
import { OverlayLoader } from "@common/components/OverlayLoader";
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
        underholdskostnader,
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
        const editedPeriod = {
            ...periode,
            erRedigerbart: false,
        };
        setValue(`${fieldName}.${index}`, editedPeriod);

        const payload = createPayload(index);

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
                    rollbackFn: () => {
                        if (!periode.id) {
                            fieldArray.remove(index);
                        } else {
                            const cachedUnderhold = underholdskostnader.find((cU) => cU.id === underhold.id);
                            const cachedPeriode = cachedUnderhold[underholdskostnadType].find(
                                (p: StonadTilBarnetilsynDto | FaktiskTilsynsutgiftDto | TilleggsstonadDto) =>
                                    p.id === cachedPeriode.id
                            );
                            setValue(`${fieldName}.${index}`, cachedPeriode);
                        }
                    },
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
        } else {
            clearErrors(`${fieldName}.${index}`);
            fieldArray.remove(index);
        }
    };

    const addPeriod = (periode: StønadTilBarnetilsynPeriode | FaktiskTilsynsutgiftPeriode | TilleggsstonadPeriode) => {
        fieldArray.append({
            ...periode,
            datoFom: virkningstidspunkt ?? søktFomDato,
            erRedigerbart: true,
            kanRedigeres: true,
        });
    };

    const mutationIsPending = saveFn.mutation.isPending || deleteUnderhold.mutation.isPending;

    return (
        <div className={`${mutationIsPending ? "relative" : "inherit"} block overflow-x-auto whitespace-nowrap`}>
            <OverlayLoader loading={mutationIsPending} />
            {children({
                controlledFields,
                onEditRow,
                onSaveRow,
                addPeriod,
                onRemovePeriode,
            })}
        </div>
    );
};
