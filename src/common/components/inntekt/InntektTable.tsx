import {
    BehandlingDtoV2,
    InntektDtoV2,
    InntektValideringsfeil,
    Kilde,
    OppdatereInntektRequest,
    OppdatereInntektResponse,
} from "@api/BidragBehandlingApiV1";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { FormControlledCheckbox } from "@common/components/formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "@common/components/formFields/FormControlledTextField";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import {
    createPayload,
    inntektSorting,
    offentligPeriodeHasHigherOrder,
    periodeHasHigherPriorityOrder,
    transformInntekt,
} from "@common/helpers/inntektFormHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useOnSaveInntekt } from "@common/hooks/useOnSaveInntekt";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { InntektFormPeriode, InntektFormValues } from "@common/types/inntektFormValues";
import { Buldings2Icon, FloppydiskIcon, PencilIcon, PersonIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import { addMonthsIgnoreDay, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "@utils/date-utils";
import { formatterBeløp } from "@utils/number-utils";
import { removePlaceholder } from "@utils/string-utils";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { InntektTables } from "../../../forskudd/context/ForskuddBehandlingProviderWrapper";
import { getFomAndTomForMonthPicker } from "../../helpers/virkningstidspunktHelpers";
import { useInntektTableProvider } from "./InntektTableContext";

export const KildeIcon = ({ kilde }: { kilde: Kilde }) => {
    return (
        <div className="h-8 w-full flex items-center justify-center">
            {kilde === Kilde.OFFENTLIG ? (
                <Buldings2Icon title="Offentlig" fontSize="1.5rem" />
            ) : (
                <PersonIcon title="Manuelt" fontSize="1.5rem" />
            )}
        </div>
    );
};

export const TaMed = ({
    fieldName,
    handleOnSelect,
    index,
}: {
    fieldName: string;
    handleOnSelect: (checked: boolean, index: number) => void;
    index: number;
}) => {
    const { viewOnly } = useInntektTableProvider();

    if (viewOnly) return null;
    return (
        <div className="h-8 w-full flex items-center justify-center">
            <FormControlledCheckbox
                name={`${fieldName}.${index}.taMed`}
                onChange={(checked) => handleOnSelect(checked, index)}
                legend=""
            />
        </div>
    );
};

export const Totalt = ({ item, field }: { item: InntektFormPeriode; field: string }) => (
    <>
        {item.erRedigerbart && item.kilde === Kilde.MANUELL ? (
            <FormControlledTextField
                name={`${field}.beløp`}
                label="Totalt"
                type="number"
                min="1"
                inputMode="numeric"
                hideLabel
            />
        ) : (
            <div className="h-8 flex items-center justify-end">{formatterBeløp(item.beløp)}</div>
        )}
    </>
);

export const EditOrSaveButton = ({
    index,
    item,
    onEditRow,
    onSaveRow,
}: {
    item: InntektFormPeriode;
    index: number;
    onEditRow: (index: number) => void;
    onSaveRow: (index: number) => void;
}) => {
    const { lesemodus } = useBehandlingProvider();
    const { viewOnly } = useInntektTableProvider();

    if (item.kanRedigeres === false || viewOnly) return null;
    return (
        <div className="h-8 flex items-center justify-center">
            {!lesemodus && item.taMed && !item.erRedigerbart && (
                <Button
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
            {!lesemodus && item.erRedigerbart && (
                <Button
                    type="button"
                    onClick={() => onSaveRow(index)}
                    icon={<FloppydiskIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
        </div>
    );
};

export const Periode = ({
    index,
    fieldName,
    field,
    label,
    item,
}: {
    index: number;
    fieldName:
        | `småbarnstillegg.${string}`
        | `utvidetBarnetrygd.${string}`
        | `årsinntekter.${string}`
        | `barnetillegg.${string}.${string}`
        | `kontantstøtte.${string}.${string}`;
    label: string;
    field: "datoFom" | "datoTom";
    item: InntektFormPeriode;
}) => {
    const virkningsdato = useVirkningsdato();
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsdato);
    const { getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const fieldIsDatoTom = field === "datoTom";
    const { erVirkningstidspunktNåværendeMånedEllerFramITid } = useBehandlingProvider();

    const validateFomOgTom = () => {
        const periode = getValues(`${fieldName}.${index}`);
        const fomOgTomInvalid = !ObjectUtils.isEmpty(periode.datoTom) && isAfterDate(periode?.datoFom, periode.datoTom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.${index}.datoFom`);
        }
    };

    return item.erRedigerbart && !erVirkningstidspunktNåværendeMånedEllerFramITid && item.kanRedigeres ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${index}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            fromDate={fom}
            customValidation={validateFomOgTom}
            toDate={fieldIsDatoTom ? tom : addMonthsIgnoreDay(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={item.taMed && !fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">
            {item.taMed && item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}
        </div>
    );
};

export const InntektTabel = ({
    fieldName,
    customRowValidation,
    children,
}: {
    fieldName: InntektTables;
    customRowValidation?: (fieldName: string) => void;
    children: React.FunctionComponent;
}) => {
    const { setPageErrorsOrUnsavedState, lesemodus, setSaveErrorState } = useBehandlingProvider();
    const {
        inntekter,
        søktFomDato,
        virkningstidspunkt: { virkningstidspunkt },
    } = useGetBehandlingV2();
    const virkningsdato = useVirkningsdato();
    const saveInntekt = useOnSaveInntekt();
    const { control, getFieldState, getValues, clearErrors, setError, setValue, resetField, formState } =
        useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control,
        name: fieldName,
    });

    const { valideringsfeil } = inntekter;

    const watchFieldArray = useWatch({ control, name: fieldName });
    const controlledFields = fieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray?.[index],
        };
    });
    const [inntektType, ident, barnIdent] = fieldName.split(".");

    useEffect(() => {
        setPageErrorsOrUnsavedState((state) => ({
            ...state,
            inntekt: {
                error:
                    !ObjectUtils.isEmpty(formState.errors.årsinntekter) ||
                    !ObjectUtils.isEmpty(formState.errors.barnetillegg) ||
                    !ObjectUtils.isEmpty(formState.errors.småbarnstillegg) ||
                    !ObjectUtils.isEmpty(formState.errors.kontantstøtte) ||
                    !ObjectUtils.isEmpty(formState.errors.utvidetBarnetrygd),
                openFields: {
                    ...state.inntekt.openFields,
                    [fieldName]: controlledFields.some((period) => !!period.erRedigerbart),
                },
            },
        }));
    }, [formState.errors, JSON.stringify(controlledFields)]);

    const handleOnSelect = (taMed: boolean, index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const erOffentlig = periode.kilde === Kilde.OFFENTLIG;

        setValue(`${fieldName}.${index}`, {
            ...periode,
            erRedigerbart: periode.kanRedigeres && taMed,
        });

        if (!taMed && !erOffentlig) {
            handleDelete(index);
        } else {
            handleUpdate(index);
        }
    };

    const movePeriods = (index: number, updatedPeriode: InntektFormPeriode, perioder: InntektFormPeriode[]) => {
        if (updatedPeriode.taMed) {
            const indexOfFirstMatchingPeriod = perioder.findIndex(
                (periode) =>
                    periode.taMed &&
                    !periode.erRedigerbart &&
                    periode.id !== updatedPeriode.id &&
                    (isAfterDate(periode.datoFom, updatedPeriode.datoFom) ||
                        (periode.datoFom === updatedPeriode.datoFom &&
                            periodeHasHigherPriorityOrder(updatedPeriode, periode)))
            );
            const moveToIndex = indexOfFirstMatchingPeriod !== -1 ? indexOfFirstMatchingPeriod : perioder.length;
            const newIndex = index >= moveToIndex ? moveToIndex : moveToIndex - 1;
            fieldArray.move(index, newIndex);
        } else {
            const notSelectedOrEditedPeriods = perioder.filter(
                (periode) => !periode.taMed && !periode.erRedigerbart && periode.id !== updatedPeriode.id
            );
            const indexOfFirstMatchingPeriod = notSelectedOrEditedPeriods.findIndex((periode) =>
                offentligPeriodeHasHigherOrder(updatedPeriode, periode)
            );
            const moveToIndex =
                indexOfFirstMatchingPeriod !== -1 ? indexOfFirstMatchingPeriod : notSelectedOrEditedPeriods.length;
            fieldArray.move(index, moveToIndex);
        }
    };

    const handleUpdate = (index: number) => {
        const perioder = getValues(fieldName);
        const updatedPeriode = perioder[index];
        const payload = createPayload(updatedPeriode, virkningsdato);
        const transformFn = transformInntekt(virkningsdato);
        const onSaveSuccess = (response: OppdatereInntektResponse) => {
            resetField(`${fieldName}.${index}`, {
                defaultValue: { ...updatedPeriode, ...transformFn(response.inntekt) },
            });

            if (!updatedPeriode.erRedigerbart) {
                movePeriods(index, updatedPeriode, perioder);
            }

            saveInntekt.queryClientUpdater((currentData) => {
                const updatedInntektIndex = currentData.inntekter[inntektType].findIndex(
                    (inntekt: InntektDtoV2) => inntekt.id === response.inntekt.id
                );
                const updatedInntekter =
                    updatedInntektIndex === -1
                        ? currentData.inntekter[inntektType].concat(response.inntekt)
                        : currentData.inntekter[inntektType].toSpliced(updatedInntektIndex, 1, response.inntekt);
                const sortedUpdatedInntekter = updatedInntekter.toSorted(inntektSorting);

                return {
                    ...currentData,
                    inntekter: {
                        ...currentData.inntekter,
                        [inntektType]: sortedUpdatedInntekter,
                        beregnetInntekter: response.beregnetInntekter,
                        valideringsfeil: response.valideringsfeil,
                    },
                };
            });
        };
        updatedAndSave(payload, onSaveSuccess, index);
    };

    const handleDelete = async (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        if (periode.id !== null) {
            const onSaveSuccess = (response: OppdatereInntektResponse) =>
                saveInntekt.queryClientUpdater((currentData: BehandlingDtoV2) => {
                    return {
                        ...currentData,
                        inntekter: {
                            ...currentData.inntekter,
                            [inntektType]: currentData.inntekter[inntektType].filter(
                                (inntekt: InntektDtoV2) => inntekt.id !== response.inntekt.id
                            ),
                            beregnetInntekter: response.beregnetInntekter,
                            valideringsfeil: response.valideringsfeil,
                        },
                    };
                });

            updatedAndSave({ sletteInntekt: periode.id }, onSaveSuccess, index);
        }
        clearErrors(`${fieldName}.${index}`);
        fieldArray.remove(index);
    };

    const addPeriod = (periode: InntektFormPeriode) => {
        fieldArray.append({
            ...periode,
            datoFom: virkningstidspunkt ?? søktFomDato,
            erRedigerbart: true,
            kanRedigeres: true,
        });
    };
    const updatedAndSave = (
        updatedValues: OppdatereInntektRequest,
        onSaveSuccess?: (data: OppdatereInntektResponse) => void,
        index?: number
    ) => {
        saveInntekt.mutation.mutate(updatedValues, {
            onSuccess: (response) => onSaveSuccess?.(response),
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => updatedAndSave(updatedValues, onSaveSuccess, index),
                    rollbackFn: () => {
                        const value = getValues(`${fieldName}.${index}`);
                        if (updatedValues.sletteInntekt) {
                            const inntekt = inntekter[inntektType].find(
                                (val) => val.id === updatedValues.sletteInntekt
                            );
                            fieldArray.insert(index, { ...inntekt, erRedigerbart: false });
                        } else if (value.id == null) {
                            fieldArray.remove(index);
                        } else {
                            const valueIndex = getValues(fieldName).findIndex((val) => val.id === value.id);
                            const inntekt = inntekter[inntektType].find((val) => val.id === value.id);
                            setValue(`${fieldName}.${valueIndex}`, inntekt);
                        }
                    },
                });
            },
        });
    };
    const onSaveRow = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        if (periode.datoFom === null) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        customRowValidation?.(`${fieldName}.${index}`);

        const fieldState = getFieldState(`${fieldName}.${index}`);
        if (!fieldState.error) {
            setValue(`${fieldName}.${index}`, { ...periode, erRedigerbart: false });
            handleUpdate(index);
        }
    };

    const onEditRow = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        setValue(`${fieldName}.${index}`, { ...periode, erRedigerbart: true });
    };

    const tableValideringsfeil: InntektValideringsfeil | undefined = ["småbarnstillegg", "utvidetBarnetrygd"].includes(
        inntektType
    )
        ? valideringsfeil[inntektType]
        : valideringsfeil[inntektType]?.find((feil) => {
              if (["barnetillegg", "kontantstøtte"].includes(inntektType)) {
                  return feil.gjelderBarn === barnIdent && feil.ident === ident;
              }
              return feil.ident === ident;
          });

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
                                <BodyShort key={`${periode.fom}-${periode.til}-${index}`} size="small">
                                    {periode.til &&
                                        removePlaceholder(
                                            text.alert.overlappendePerioder,
                                            DateToDDMMYYYYString(dateOrNull(periode.fom)),
                                            DateToDDMMYYYYString(dateOrNull(periode.til))
                                        )}
                                    {!periode.til &&
                                        removePlaceholder(
                                            text.alert.overlappendeLøpendePerioder,
                                            DateToDDMMYYYYString(dateOrNull(periode.fom))
                                        )}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.alert.overlappendePerioderFiks}</BodyShort>
                        </>
                    )}
                    {tableValideringsfeil.hullIPerioder.length > 0 && (
                        <>
                            <BodyShort size="small">{text.error.hullIPerioderInntekt}:</BodyShort>
                            {tableValideringsfeil.hullIPerioder.map((gap, index) => (
                                <BodyShort key={`${gap.fom}-${gap.til}-${index}`} size="small">
                                    {DateToDDMMYYYYString(dateOrNull(gap.fom))} -{" "}
                                    {DateToDDMMYYYYString(dateOrNull(gap.til))}
                                </BodyShort>
                            ))}
                            <BodyShort size="small">{text.error.hullIPerioderFiks}</BodyShort>
                        </>
                    )}
                    {tableValideringsfeil.ingenLøpendePeriode && (
                        <BodyShort size="small">{text.error.ingenLoependeInntektPeriode}</BodyShort>
                    )}
                    {tableValideringsfeil.manglerPerioder && (
                        <BodyShort size="small">{text.error.manglerPerioder}</BodyShort>
                    )}
                    {tableValideringsfeil.fremtidigPeriode && (
                        <BodyShort size="small">{text.error.framoverPeriodisering}</BodyShort>
                    )}
                    {tableValideringsfeil.perioderFørVirkningstidspunkt && (
                        <BodyShort size="small">{text.error.periodeFørVirkningstidspunkt}</BodyShort>
                    )}
                </BehandlingAlert>
            )}
            {children({
                controlledFields,
                onEditRow,
                onSaveRow,
                addPeriod,
                handleOnSelect,
            })}
        </>
    );
};
