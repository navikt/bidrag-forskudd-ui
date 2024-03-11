import { Buldings2Icon, FloppydiskIcon, PencilIcon, PersonIcon } from "@navikt/aksel-icons";
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
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
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
            onChange={(value) => handleOnSelect(value.target.checked, index)}
            legend=""
        />
    </div>
);

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
            <FormControlledTextField name={`${field}.beløp`} label="Totalt" type="number" min="1" hideLabel />
        ) : (
            <div className="h-8 flex items-center justify-end">
                <BodyShort>{item.beløp}</BodyShort>
            </div>
        )}
    </>
);

export const EditOrSaveButton = ({ erMed, index, editableRow, onEditRow, onSaveRow }) => {
    const { lesemodus } = useForskudd();

    return (
        <div className="h-8 flex items-center justify-center">
            {!lesemodus && erMed && editableRow !== index && (
                <Button
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
            {!lesemodus && editableRow === index && (
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
        <div className="h-8 flex items-center">
            <BodyShort>{item.taMed && item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</BodyShort>
        </div>
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

        if (!value && !erOffentlig) {
            handleDelete(index);
        } else {
            if (erOffentlig) {
                updatedAndSave({
                    oppdatereInntektsperioder: [
                        {
                            id: periode.id,
                            taMedIBeregning: value,
                            angittPeriode: {
                                fom: periode.datoFom,
                                til: periode.datoTom,
                            },
                        } as OppdaterePeriodeInntekt,
                    ],
                });
            } else {
                updatedAndSave({
                    oppdatereManuelleInntekter: [
                        {
                            id: periode.id,
                            taMed: value,
                            type: periode.rapporteringstype as Inntektsrapportering,
                            beløp: periode.beløp,
                            datoFom: periode.datoFom,
                            datoTom: periode.datoTom,
                            ident: periode.ident,
                        } as OppdatereManuellInntekt,
                    ],
                });
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
                    gjelderBarn: periode.gjelderBarn,
                };
                updatedAndSave({ oppdatereManuelleInntekter: [updatedPeriod] });
            }
            unsetEditedRow(index);
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
                            <BodyShort>{text.alert.overlappendePerioder}:</BodyShort>
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
                onSaveRow,
                addPeriod,
                handleOnSelect,
            })}
        </>
    );
};
