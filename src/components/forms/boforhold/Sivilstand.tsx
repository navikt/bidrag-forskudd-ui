import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { firstDayOfMonth } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Kilde, SivilstandDto, Sivilstandskode } from "../../../api/BidragBehandlingApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { dateOrNull, DateToDDMMYYYYString, isAfterDate, toDateString } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import {
    calculateFraDato,
    editPeriods,
    removeAndEditPeriods,
    sivilstandForskuddOptions,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Sivilstand = ({ datoFom }: { datoFom: Date }) => (
    <>
        <Heading level="3" size="medium">
            Sivilstand
        </Heading>
        <SivilistandPerioder virkningstidspunkt={datoFom} />
    </>
);

const SivilistandPerioder = ({ virkningstidspunkt }: { virkningstidspunkt: Date }) => {
    const { boforholdFormValues, setBoforholdFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const toVisningsnavn = useVisningsnavn();
    const [editableRow, setEditableRow] = useState(undefined);
    const [fom, tom] = getFomAndTomForMonthPicker(virkningstidspunkt);
    const {
        control,
        getValues,
        getFieldState,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const sivilstandPerioder = useFieldArray({
        control,
        name: `sivilstand`,
    });

    const watchFieldArray = useWatch({ control, name: `sivilstand` });
    const controlledFields = sivilstandPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`sivilstand`);
        if (perioderValues[index].datoFom === null) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        if (perioderValues[index].datoTom !== undefined && perioderValues[index].datoTom !== null) {
            const laterPeriodExists = perioderValues
                .filter((_periode, i) => i !== index)
                .some(
                    (periode) =>
                        periode.datoTom === null ||
                        new Date(periode.datoTom).getTime() >= new Date(perioderValues[index].datoTom).getTime()
                );

            if (!laterPeriodExists) {
                setError(`sivilstand.${index}.datoTom`, {
                    type: "notValid",
                    message: "Det er ingen løpende status i beregningen",
                });
            }

            if (laterPeriodExists) {
                const fieldState = getFieldState(`sivilstand.${index}.datoTom`);
                if (fieldState.error && fieldState.error.message === "Det må være minst en løpende periode") {
                    clearErrors(`sivilstand.${index}.datoTom`);
                }
            }
        }

        const periods = editPeriods(perioderValues, index);
        const firstDayOfCurrentMonth = firstDayOfMonth(new Date());
        const virkningsDatoIsInFuture = isAfterDate(virkningstidspunkt, firstDayOfCurrentMonth);
        const futurePeriodExists = periods.some((periode) =>
            virkningsDatoIsInFuture
                ? isAfterDate(periode.datoFom, virkningstidspunkt)
                : isAfterDate(periode.datoFom, firstDayOfCurrentMonth)
        );

        if (futurePeriodExists) {
            setErrorMessage({ title: "Feil i periodisering", text: "Det kan ikke periodiseres fremover i tid." });
            setErrorModalOpen(true);
            return;
        }

        const firstPeriodIsNotFromVirkningsTidspunkt = isAfterDate(periods[0].datoFom, virkningstidspunkt);

        if (firstPeriodIsNotFromVirkningsTidspunkt) {
            setErrorMessage({
                title: "Feil i periodisering",
                text: `Det er perioder i beregningen uten status. Legg til en eller flere perioder som dekker periode fra ${toDateString(
                    virkningstidspunkt
                )} til ${toDateString(new Date(periods[0].datoFom))}`,
            });
            setErrorModalOpen(true);
            return;
        }

        const fieldState = getFieldState(`sivilstand.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
        }
    };

    const updatedAndSave = (sivilstand: SivilstandDto[]) => {
        const updatedValues = {
            ...boforholdFormValues,
            sivilstand,
        };
        setBoforholdFormValues(updatedValues);
        setValue(`sivilstand`, sivilstand);
        saveBoforhold(updatedValues);
        setEditableRow(undefined);
    };

    const validateFomOgTom = (index) => {
        const sivilstandPerioder = getValues("sivilstand");
        const fomOgTomInvalid =
            sivilstandPerioder[index].datoTom !== null &&
            isAfterDate(sivilstandPerioder[index].datoFom, sivilstandPerioder[index].datoTom);

        if (fomOgTomInvalid) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`sivilstand.${index}.datoFom`);
        }
    };

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const sivilstandPerioderValues = getValues("sivilstand");
            sivilstandPerioder.append({
                datoFom: calculateFraDato(sivilstandPerioderValues, virkningstidspunkt),
                datoTom: null,
                sivilstand: Sivilstandskode.BOR_ALENE_MED_BARN,
                kilde: Kilde.MANUELL,
            });
            setEditableRow(sivilstandPerioderValues.length);
        }
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`sivilstand`) as SivilstandDto[];
            const updatedPeriods = removeAndEditPeriods(perioderValues, index);
            updatedAndSave(updatedPeriods);
        }
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

    const onEditRow = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            setEditableRow(index);
        }
    };

    return (
        <>
            {errors?.root?.sivilstand && (
                <Alert variant="warning">
                    <BodyShort>{errors.root.sivilstand.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Sivilstand", "Kilde", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                editableRow === index ? (
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.datoFom`}
                                        name={`sivilstand.${index}.datoFom`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoFom}
                                        customValidation={() => validateFomOgTom(index)}
                                        fromDate={fom}
                                        toDate={tom}
                                        hideLabel
                                        required
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.datoFom.placeholder`}>
                                        {item.datoFom && DateToDDMMYYYYString(dateOrNull(item.datoFom))}
                                    </BodyShort>
                                ),
                                editableRow === index ? (
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.datoTom`}
                                        name={`sivilstand.${index}.datoTom`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        customValidation={() => validateFomOgTom(index)}
                                        fromDate={fom}
                                        toDate={tom}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.datoTom.placeholder`}>
                                        {item.datoTom && DateToDDMMYYYYString(dateOrNull(item.datoTom))}
                                    </BodyShort>
                                ),
                                editableRow === index ? (
                                    <FormControlledSelectField
                                        key={`sivilstand.${index}.sivilstand`}
                                        name={`sivilstand.${index}.sivilstand`}
                                        label="Sivilstand"
                                        className="w-52"
                                        options={sivilstandForskuddOptions.map((value) => ({
                                            value,
                                            text: toVisningsnavn(value.toString()),
                                        }))}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.sivilstand.placeholder`}>
                                        {toVisningsnavn(item.sivilstand)}
                                    </BodyShort>
                                ),
                                <BodyShort key={`sivilstand.${index}.kilde.placeholder`} className="capitalize">
                                    {KildeTexts[item.kilde]}
                                </BodyShort>,
                                editableRow === index ? (
                                    <Button
                                        key={`save-button-${index}`}
                                        type="button"
                                        onClick={() => onSaveRow(index)}
                                        icon={<FloppydiskIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <Button
                                        key={`edit-button-${index}`}
                                        type="button"
                                        onClick={() => onEditRow(index)}
                                        icon={<PencilIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ),
                                index ? (
                                    <Button
                                        key={`delete-button-${index}`}
                                        type="button"
                                        onClick={() => onRemovePeriode(index)}
                                        icon={<TrashIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <div key={`delete-button-${index}.placeholder`} className="min-w-[40px]"></div>
                                ),
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                + Legg til periode
            </Button>
        </>
    );
};
