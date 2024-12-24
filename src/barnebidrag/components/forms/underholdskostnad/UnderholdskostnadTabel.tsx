import {
    BehandlingDtoV2,
    FaktiskTilsynsutgiftDto,
    OppdatereUnderholdResponse,
    SletteUnderholdselementTypeEnum,
    StonadTilBarnetilsynDto,
    TilleggsstonadDto,
    UnderholdskostnadValideringsfeilTabell,
} from "@api/BidragBehandlingApiV1";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { OverlayLoader } from "@common/components/OverlayLoader";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { BodyShort, Heading } from "@navikt/ds-react";
import { UseMutationResult } from "@tanstack/react-query";
import { dateOrNull, DateToDDMMYYYYString } from "@utils/date-utils";
import { removePlaceholder } from "@utils/string-utils";
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
import { transformUnderholdskostnadPeriode } from "../helpers/UnderholdskostnadFormHelpers";

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
    const { lesemodus, setSaveErrorState } = useBehandlingProvider();
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

    const getPerioderFromResponse = (response: OppdatereUnderholdResponse) => {
        const updatedPerioder = response[underholdskostnadType] as
            | StonadTilBarnetilsynDto[]
            | FaktiskTilsynsutgiftDto[]
            | TilleggsstonadDto[];

        return updatedPerioder;
    };
    const updateTable = (
        updatedPerioder: StonadTilBarnetilsynDto[] | FaktiskTilsynsutgiftDto[] | TilleggsstonadDto[]
    ) => {
        const transformedUpdatedPerioder = updatedPerioder.map(transformUnderholdskostnadPeriode) as
            | StønadTilBarnetilsynPeriode[]
            | FaktiskTilsynsutgiftPeriode[]
            | TilleggsstonadPeriode[];
        setValue(fieldName, transformedUpdatedPerioder);
    };

    const queryUpdater = (response: OppdatereUnderholdResponse) => (currentData: BehandlingDtoV2) => {
        const updatedPerioder = getPerioderFromResponse(response);
        const cachedUnderholdIndex = currentData.underholdskostnader.findIndex((u) => u.id === underhold.id);

        return {
            ...currentData,
            underholdskostnader: currentData.underholdskostnader.map((cachedUnderhold, index) => {
                let updatedUnderhold = { ...cachedUnderhold };
                const updatedBeregnetUnderholdskostnad = response.beregnetUnderholdskostnader.find(
                    (bU) => bU.gjelderBarn.ident === cachedUnderhold.gjelderBarn.ident
                );
                const updatedUnderholdskostnadValideringsfeiler = response.valideringsfeil.find(
                    (uV) => uV.id === cachedUnderhold.id
                );

                updatedUnderhold = {
                    ...updatedUnderhold,
                    beregnetUnderholdskostnad: updatedBeregnetUnderholdskostnad
                        ? updatedBeregnetUnderholdskostnad.perioder
                        : cachedUnderhold.beregnetUnderholdskostnad,
                    valideringsfeil: updatedUnderholdskostnadValideringsfeiler
                        ? updatedUnderholdskostnadValideringsfeiler
                        : cachedUnderhold.valideringsfeil,
                };

                if (index === cachedUnderholdIndex) {
                    updatedUnderhold = {
                        ...updatedUnderhold,
                        [underholdskostnadType]: updatedPerioder,
                    };
                }

                return updatedUnderhold;
            }),
        };
    };

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
                updateTable(getPerioderFromResponse(response));
                saveFn.queryClientUpdater(queryUpdater(response));
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
                            const cachedPeriode = cachedUnderhold[underholdskostnadType]?.find(
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
                    updateTable(getPerioderFromResponse(response));
                    deleteUnderhold.queryClientUpdater(queryUpdater(response));
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

    const tableValideringsfeil: UnderholdskostnadValideringsfeilTabell | undefined = underholdskostnader.find(
        (u) => u.gjelderBarn.id === underhold.gjelderBarn.id
    )?.valideringsfeil?.[underholdskostnadType];

    return (
        <>
            {!lesemodus && tableValideringsfeil && (
                <BehandlingAlert variant="warning" className="mb-4">
                    <Heading size="xsmall" level="6">
                        {text.alert.feilIPeriodisering}.
                    </Heading>
                    {tableValideringsfeil.overlappendePerioder.length > 0 && (
                        <>
                            {tableValideringsfeil.overlappendePerioder.map(({ periode }, index) => (
                                <BodyShort key={`${periode.fom}-${periode.tom}-${index}`} size="small">
                                    {periode.tom &&
                                        removePlaceholder(
                                            text.alert.overlappendePerioderUnderhold,
                                            DateToDDMMYYYYString(dateOrNull(periode.fom)),
                                            DateToDDMMYYYYString(dateOrNull(periode.tom))
                                        )}
                                    {!periode.tom &&
                                        removePlaceholder(
                                            text.alert.overlappendeLøpendePerioderUnderhold,
                                            DateToDDMMYYYYString(dateOrNull(periode.fom))
                                        )}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.alert.overlappendePerioderFiks}</BodyShort>
                        </>
                    )}
                    {tableValideringsfeil.fremtidigePerioder.length > 0 && (
                        <BodyShort size="small">{text.error.framoverPeriodisering}</BodyShort>
                    )}
                    {tableValideringsfeil.harIngenPerioder && (
                        <BodyShort size="small">{text.error.manglerPerioderUnderhold}</BodyShort>
                    )}
                </BehandlingAlert>
            )}
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
        </>
    );
};
