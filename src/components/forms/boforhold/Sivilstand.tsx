import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Kilde, SivilstandDto, SivilstandType } from "../../../api/BidragBehandlingApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { SivilstandTypeTexts } from "../../../enum/SivilstandTypeTexts";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { dateOrNull, DateToDDMMYYYYString } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { calculateFraDato, editPeriods } from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Sivilstand = ({ datoFom }) => (
    <>
        <Heading level="3" size="medium">
            Sivilstand
        </Heading>
        <SivilistandPerioder datoFom={datoFom} />
    </>
);

const SivilistandPerioder = ({ datoFom }: { datoFom: Date | null }) => {
    const { boforholdFormValues, setBoforholdFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [editableRow, setEditableRow] = useState(null);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFom);
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

    const validateFomOgTom = (date, index, field) => {
        const sivilstandPerioder = getValues("sivilstand");
        const fomOgTomInvalid =
            field === "datoFom"
                ? sivilstandPerioder[index].datoTom && date > sivilstandPerioder[index].datoTom
                : sivilstandPerioder[index].datoFom && date < sivilstandPerioder[index].datoFom;

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
        const sivilstandPerioderValues = getValues("sivilstand");
        sivilstandPerioder.append({
            datoFom: calculateFraDato(sivilstandPerioderValues, datoFom),
            datoTom: null,
            sivilstandType: SivilstandType.BOR_ALENE_MED_BARN,
            kilde: Kilde.MANUELT,
        });
        setEditableRow(sivilstandPerioderValues.length);
    };

    const updatedAndSave = (sivilstand: SivilstandDto[]) => {
        const updatedValues = {
            ...boforholdFormValues,
            sivilstand,
        };
        setBoforholdFormValues(updatedValues);
        setValue(`sivilstand`, sivilstand);
        saveBoforhold(updatedValues);
        setEditableRow(null);
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`sivilstand`);
        if (perioderValues[index].datoFom === null) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }
        const fieldState = getFieldState(`sivilstand.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
        }
    };

    const onEditRow = (index: number) => {
        if (editableRow && Number(editableRow) !== index) {
            setErrorMessage({
                title: "Fullfør redigering",
                text: "Det er en periode som er under redigering. Fullfør redigering eller slett periode.",
            });
            setErrorModalOpen(true);
        }

        if (!editableRow) {
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
                                        customValidation={(date) => validateFomOgTom(date, index, "datoFom")}
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
                                        customValidation={(date) => validateFomOgTom(date, index, "datoTom")}
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
                                        key={`sivilstand.${index}.sivilstandType`}
                                        name={`sivilstand.${index}.sivilstandType`}
                                        label="Sivilstand"
                                        className="w-52"
                                        options={Object.entries(SivilstandType).map((entry) => ({
                                            value: entry[0],
                                            text: SivilstandTypeTexts[entry[0]],
                                        }))}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.sivilstandType.placeholder`}>
                                        {SivilstandTypeTexts[item.sivilstandType]}
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
                                        onClick={() => {
                                            sivilstandPerioder.remove(index);
                                        }}
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
