import { Buldings2Icon, FloppydiskIcon, PencilIcon, PersonIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    BehandlingDtoV2,
    InntektDtoV2,
    InntektValideringsfeil,
    Kilde,
    OppdatereInntektRequest,
    OppdatereInntektResponse,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { InntektTables, useForskudd } from "../../../context/ForskuddContext";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { addMonths, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "../../../utils/date-utils";
import { formatterBeløp } from "../../../utils/number-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { ForskuddAlert } from "../../ForskuddAlert";
import { createPayload, transformInntekt } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const KildeIcon = ({ kilde }: { kilde: Kilde }) => {
    return (
        <div className="h-8 w-full flex items-center justify-center">
            {kilde === Kilde.OFFENTLIG ? (
                <Buldings2Icon title="a11y-title" fontSize="1.5rem" />
            ) : (
                <PersonIcon title="a11y-title" fontSize="1.5rem" />
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
}) => (
    <div className="h-8 w-full flex items-center justify-center">
        <FormControlledCheckbox
            name={`${fieldName}.${index}.taMed`}
            onChange={(checked) => handleOnSelect(checked, index)}
            legend=""
        />
    </div>
);

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
    const { lesemodus } = useForskudd();

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
        | "småbarnstillegg"
        | "utvidetBarnetrygd"
        | `årsinntekter.${string}`
        | `barnetillegg.${string}`
        | `kontantstøtte.${string}`;
    label: string;
    field: "datoFom" | "datoTom";
    item: InntektFormPeriode;
}) => {
    const virkningsdato = useVirkningsdato();
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsdato);
    const { getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const fieldIsDatoTom = field === "datoTom";

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

    return item.erRedigerbart ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${index}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            fromDate={fom}
            customValidation={validateFomOgTom}
            toDate={fieldIsDatoTom ? tom : addMonths(tom, 1)}
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
    const { setPageErrorsOrUnsavedState, pageErrorsOrUnsavedState, lesemodus } = useForskudd();
    const {
        inntekter: { valideringsfeil },
        søktFomDato,
        virkningstidspunkt: { virkningstidspunkt },
    } = useGetBehandlingV2();
    const virkningsdato = useVirkningsdato();
    const saveInntekt = useOnSaveInntekt();
    const { control, getFieldState, getValues, clearErrors, setError, setValue, formState } =
        useFormContext<InntektFormValues>();
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
    const [inntektType, ident] = fieldName.split(".");

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            inntekt: {
                error: !ObjectUtils.isEmpty(formState.errors),
                openFields: {
                    ...pageErrorsOrUnsavedState.inntekt.openFields,
                    [fieldName]: getValues(fieldName).some((period) => period.erRedigerbart),
                },
            },
        });
    }, [formState.errors, controlledFields]);

    const handleOnSelect = (taMed: boolean, index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const erOffentlig = periode.kilde === Kilde.OFFENTLIG;

        setValue(`${fieldName}.${index}`, { ...periode, erRedigerbart: taMed });

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
                    isAfterDate(periode.datoFom, updatedPeriode.datoFom)
            );
            const moveToIndex = indexOfFirstMatchingPeriod !== -1 ? indexOfFirstMatchingPeriod : perioder.length;
            const newIndex = index > moveToIndex ? moveToIndex : moveToIndex - 1;
            fieldArray.move(index, newIndex);
        } else {
            const indexOfFirstMatchingPeriod = perioder.findIndex(
                (periode) =>
                    !periode.taMed &&
                    !periode.erRedigerbart &&
                    periode.id !== updatedPeriode.id &&
                    isAfterDate(periode.opprinneligFom, updatedPeriode.opprinneligFom)
            );
            const moveToIndex = indexOfFirstMatchingPeriod !== -1 ? indexOfFirstMatchingPeriod : 0;
            fieldArray.move(index, moveToIndex);
        }
    };

    const handleUpdate = (index: number) => {
        const perioder = getValues(fieldName);
        const updatedPeriode = perioder[index];
        const payload = createPayload(updatedPeriode, virkningsdato);
        const transformFn = transformInntekt(virkningsdato);
        const onSaveSuccess = (response: OppdatereInntektResponse) => {
            setValue(`${fieldName}.${index}`, { ...updatedPeriode, ...transformFn(response.inntekt) });

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
                return {
                    ...currentData,
                    inntekter: {
                        ...currentData.inntekter,
                        [inntektType]: updatedInntekter,
                        beregnetInntekter: response.beregnetInntekter,
                        valideringsfeil: response.valideringsfeil,
                    },
                };
            });
        };
        updatedAndSave(payload, onSaveSuccess);
    };

    const handleDelete = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        clearErrors(`${fieldName}.${index}`);
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

        updatedAndSave({ sletteInntekt: periode.id }, onSaveSuccess);
        fieldArray.remove(index);
    };

    const addPeriod = (periode: InntektFormPeriode) => {
        fieldArray.append({ ...periode, datoFom: virkningstidspunkt ?? søktFomDato, erRedigerbart: true });
    };
    const updatedAndSave = (
        updatedValues: OppdatereInntektRequest,
        onSaveSuccess?: (data: OppdatereInntektResponse) => void
    ) => {
        saveInntekt.mutation.mutate(updatedValues, {
            onSuccess: (response) => onSaveSuccess?.(response),
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
                  return feil.gjelderBarn === ident;
              }
              return feil.ident === ident;
          });

    return (
        <>
            {!lesemodus && tableValideringsfeil && (
                <ForskuddAlert variant="warning" className="mb-4">
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
                </ForskuddAlert>
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
