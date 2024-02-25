import { Alert, BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { InntektDtoV2, Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandling } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { checkOverlappingPeriods, editPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { DeleteButton, EditOrSaveButton } from "./SkattepliktigeOgPensjonsgivendeInntekt";

export const Småbarnstillegg = () => (
    <Box padding="4" background="surface-subtle" className="grid gap-y-4">
        <Heading level="3" size="medium">
            Småbarnstillegg
        </Heading>
        <SmåbarnstilleggTabel />
    </Box>
);
export const SmåbarnstilleggTabel = () => {
    const { inntektFormValues, setInntektFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const { roller, søktFomDato } = useGetBehandling();
    const [editableRow, setEditableRow] = useState(undefined);
    const saveInntekt = useOnSaveInntekt();
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(søktFomDato));

    const {
        control,
        getValues,
        clearErrors,
        setError,
        setValue,
        getFieldState,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "småbarnstillegg",
    });
    const watchFieldArray = useWatch({ control, name: "småbarnstillegg" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const småbarnstilleggList = getValues("småbarnstillegg");

        if (!småbarnstilleggList.length) {
            clearErrors("småbarnstillegg");
            return;
        }
        const filtrertOgSorterListe = småbarnstilleggList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("småbarnstillegg", {
                ...errors.barnetillegg,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("småbarnstillegg.types.overlappingPerioder");
        }
    };

    const updatedAndSave = (inntekter: InntektDtoV2[]) => {
        const updatedValues = {
            ...inntektFormValues,
            småbarnstillegg: { ...inntektFormValues.småbarnstillegg },
        };
        setInntektFormValues(updatedValues);
        setValue("småbarnstillegg", inntekter);
        saveInntekt(updatedValues);
        setEditableRow(undefined);
    };

    const checkIfAnotherRowIsEdited = (index?: number) => {
        return editableRow !== undefined && Number(editableRow) !== index;
    };

    const showErrorModal = () => {
        setErrorMessage({
            title: "Fullfør redigering",
            text: "Det er en periode som er under redigering. Fullfør redigering eller slett periode.",
        });
        setErrorModalOpen(true);
    };

    const handleOnDelete = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            clearErrors(`småbarnstillegg.${index}`);
            fieldArray.remove(index);
            if (editableRow === index) {
                setEditableRow(undefined);
            }
        }
    };

    const onEditRow = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            setEditableRow(index);
        }
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues("småbarnstillegg");
        if (perioderValues[index].datoFom === null) {
            setError(`småbarnstillegg.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        const fieldState = getFieldState(`småbarnstillegg.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
        }
    };

    const handleOnSelect = (value: boolean, index: number) => {
        const periods = getValues("småbarnstillegg");
        const updatedValues = periods.toSpliced(index, 1, {
            ...periods[index],
            taMed: value,
        });
        updatedAndSave(updatedValues);
    };

    const controlledFields = fieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray?.[index],
        };
    });

    return (
        <>
            {errors?.småbarnstillegg?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.småbarnstillegg.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Ta med", "Fra og med", "Til og med", "Kilde", "Beløp", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledCheckbox
                                    key={`småbarnstillegg.${index}.taMed`}
                                    name={`småbarnstillegg.${index}.taMed`}
                                    onChange={(value) => handleOnSelect(value.target.checked, index)}
                                    legend=""
                                />,
                                <FormControlledMonthPicker
                                    key={`småbarnstillegg.${index}.datoFom`}
                                    name={`småbarnstillegg.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    fromDate={fom}
                                    toDate={tom}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`småbarnstillegg.${index}.datoTom`}
                                    name={`småbarnstillegg.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    lastDayOfMonthPicker
                                />,
                                <BodyShort key={`småbarnstillegg.${index}.kilde`}>{KildeTexts[item.kilde]}</BodyShort>,
                                <FormControlledTextField
                                    key={`småbarnstillegg.${index}.beløp`}
                                    name={`småbarnstillegg.${index}.beløp`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <EditOrSaveButton
                                    key={`edit-or-save-button-${index}`}
                                    index={index}
                                    editableRow={editableRow}
                                    onEditRow={onEditRow}
                                    onSaveRow={onSaveRow}
                                />,
                                <DeleteButton
                                    key={`delete-button-${index}`}
                                    item={item}
                                    index={index}
                                    handleOnDelete={handleOnDelete}
                                />,
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    fieldArray.append({
                        taMed: false,
                        ident: roller.find((rolle) => rolle.rolletype === Rolletype.BM).ident,
                        kilde: Kilde.MANUELL,
                        datoFom: null,
                        datoTom: null,
                        beløp: 0,
                        rapporteringstype: Inntektsrapportering.SMABARNSTILLEGG,
                        inntektsposter: [],
                        inntektstyper: [],
                    })
                }
            >
                + Legg til periode
            </Button>
        </>
    );
};
