import { FloppydiskIcon, PencilIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button } from "@navikt/ds-react";
import React, { useState } from "react";
import { FieldError, FieldErrorsImpl, Merge, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    Inntektsrapportering,
    Kilde,
    OppdatereManuellInntekt,
    OppdaterePeriodeInntekt,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYString, isAfterDate } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Totalt = ({
    item,
    field,
    erRedigerbart,
}: {
    item: InntektFormPeriode;
    field: string;
    erRedigerbart: boolean;
}) => (
    <>
        {erRedigerbart ? (
            <div className="w-[120px]">
                <FormControlledTextField name={`${field}.beløp`} label="Totalt" type="number" min="1" hideLabel />
            </div>
        ) : (
            <div className="flex items-center gap-x-4">
                <BodyShort className="min-w-[80px] flex justify-end">{item.beløp}</BodyShort>
            </div>
        )}
    </>
);

export const EditOrSaveButton = ({ erMed, index, editableRow, onEditRow, onSaveRow }) => {
    return (
        <>
            {editableRow !== index && !erMed && <div className="min-w-[40px]"></div>}
            {erMed && editableRow !== index && (
                <Button
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
            {editableRow === index && (
                <Button
                    type="button"
                    onClick={() => onSaveRow(index)}
                    icon={<FloppydiskIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
        </>
    );
};

export const Periode = ({
    index,
    editableRow,
    fieldName,
    field,
    label,
    item,
}: {
    index: number;
    editableRow: number;
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
    const {
        søktFomDato,
        virkningstidspunkt: { virkningstidspunkt: virkningsdato },
    } = useGetBehandlingV2();
    const datoFom = dateOrNull(virkningsdato) ?? dateOrNull(søktFomDato);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFom);
    const { getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const validateFomOgTom = () => {
        const periode = getValues(`${fieldName}.${index}`);
        const fomOgTomInvalid = periode.datoTom !== null && isAfterDate(periode?.datoFom, periode.datoTom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.${index}.datoFom`);
        }
    };

    return editableRow === index ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${index}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            required={item.taMed}
            fromDate={fom}
            toDate={tom}
            customValidation={validateFomOgTom}
            hideLabel
        />
    ) : (
        <BodyShort>{item.taMed && item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</BodyShort>
    );
};

export const InntektTabel = ({
    fieldName,
    fieldErrors,
    children,
}: {
    fieldName:
        | "småbarnstillegg"
        | "utvidetBarnetrygd"
        | `årsinntekter.${string}`
        | `barnetillegg.${string}`
        | `kontantstøtte.${string}`;
    fieldErrors: Merge<FieldError, FieldErrorsImpl<InntektFormPeriode>>;
    children: React.FunctionComponent;
}) => {
    const { setErrorMessage, setErrorModalOpen } = useForskudd();
    const [editableRow, setEditableRow] = useState(undefined);
    const saveInntekt = useOnSaveInntekt();
    const { control, getFieldState, getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control,
        name: fieldName,
    });
    const watchFieldArray = useWatch({ control, name: fieldName });

    const unsetEditedRow = (index) => {
        if (editableRow === index) {
            setEditableRow(undefined);
        }
    };

    const handleOnSelect = (value: boolean, index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const erOffentlig = periode.kilde === Kilde.OFFENTLIG;
        let updatedPeriod: OppdaterePeriodeInntekt | OppdatereManuellInntekt;
        if (erOffentlig) {
            updatedPeriod = {
                id: periode.id,
                taMedIBeregning: value,
                angittPeriode: {
                    fom: periode.datoFom,
                    til: periode.datoTom,
                },
            };
        } else {
            updatedPeriod = {
                id: periode.id,
                taMed: value,
                type: periode.rapporteringstype as Inntektsrapportering,
                beløp: periode.beløp,
                datoFom: periode.datoFom,
                datoTom: periode.datoTom,
                ident: periode.ident,
            };
        }

        if (!value && !erOffentlig) {
            handleDelete(index);
        } else {
            if (erOffentlig) {
                updatedAndSave({ oppdatereInntektsperioder: [updatedPeriod as OppdaterePeriodeInntekt] });
            } else {
                updatedAndSave({ oppdatereManuelleInntekter: [updatedPeriod as OppdatereManuellInntekt] });
            }
        }
        unsetEditedRow(index);
    };

    const handleDelete = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        clearErrors(`${fieldName}.${index}`);
        fieldArray.remove(index);
        updatedAndSave({ sletteInntekter: [periode.id] });
    };

    const addPeriod = (periode: InntektFormPeriode) => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const perioder = getValues(fieldName);
            fieldArray.append(periode);
            setEditableRow(perioder.length);
        }
    };
    const updatedAndSave = (updatedValues: {
        oppdatereInntektsperioder?: OppdaterePeriodeInntekt[];
        oppdatereManuelleInntekter?: OppdatereManuellInntekt[];
        sletteInntekter?: number[];
    }) => {
        saveInntekt(updatedValues);
    };
    const onSaveRow = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        if (periode.datoFom === null) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        const fieldState = getFieldState(`${fieldName}.${index}`);
        if (!fieldState.error) {
            if (periode.kilde === Kilde.OFFENTLIG) {
                const updatedPeriod = {
                    id: periode.id,
                    taMedIBeregning: periode.taMed,
                    angittPeriode: {
                        fom: periode.datoFom,
                        til: periode.datoTom,
                    },
                };
                updatedAndSave({ oppdatereInntektsperioder: [updatedPeriod] });
            } else {
                const updatedPeriod = {
                    id: periode.id ?? null,
                    taMed: periode.taMed,
                    type: periode.rapporteringstype as Inntektsrapportering,
                    beløp: periode.beløp,
                    datoFom: periode.datoFom,
                    datoTom: periode.datoTom,
                    ident: periode.ident,
                };
                updatedAndSave({ oppdatereManuelleInntekter: [updatedPeriod] });
            }
            unsetEditedRow(index);
        }
    };
    const validateFomOgTom = (index: number) => {
        const periode = getValues(`${fieldName}.${index}`);
        const fomOgTomInvalid = periode.datoTom !== null && isAfterDate(periode?.datoFom, periode.datoTom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.${index}.datoFom`);
        }
    };
    const checkIfAnotherRowIsEdited = (index?: number) => {
        return editableRow !== undefined && Number(editableRow) !== index;
    };
    const showErrorModal = () => {
        setErrorMessage({
            title: text.alert.fullførRedigering,
            text: text.alert.periodeUnderRedigering,
        });
        setErrorModalOpen(true);
    };
    const onEditRow = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            setEditableRow(index);
        }
    };

    const controlledFields = fieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray?.[index],
        };
    });

    return (
        <>
            {fieldErrors?.types && (
                <Alert variant="warning" className="mb-4">
                    {fieldErrors.types?.periodGaps && <BodyShort>{fieldErrors.types.periodGaps}</BodyShort>}
                    {fieldErrors.types?.overlappingPerioder && (
                        <>
                            <BodyShort>Du har overlappende perioder:</BodyShort>
                            {JSON.parse(fieldErrors.types.overlappingPerioder as string).map((perioder) => (
                                <BodyShort key={perioder}>
                                    <span className="capitalize">{perioder[0]}</span> og{" "}
                                    <span className="capitalize">{perioder[1]}</span>
                                </BodyShort>
                            ))}
                        </>
                    )}
                </Alert>
            )}
            {children({
                controlledFields,
                editableRow,
                onEditRow,
                validateFomOgTom,
                onSaveRow,
                addPeriod,
                handleOnSelect,
            })}
        </>
    );
};
