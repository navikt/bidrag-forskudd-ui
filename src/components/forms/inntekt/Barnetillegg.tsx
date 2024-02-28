import { Alert, BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    InntektDtoV2,
    Inntektsrapportering,
    Inntektstype,
    Kilde,
    RolleDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandling } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { checkOverlappingPeriods, editPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { DeleteButton, EditOrSaveButton } from "./SkattepliktigeOgPensjonsgivendeInntekt";

export const Barnetillegg = () => {
    const { roller } = useGetBehandling();
    const barna = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                Barnetillegg
            </Heading>
            {barna.map((barn) => (
                <>
                    <div className="grid grid-cols-[max-content,max-content,auto] mb-2 p-2 bg-[#EFECF4]">
                        <div className="w-8 mr-2 h-max">
                            <RolleTag rolleType={Rolletype.BA} />
                        </div>
                        <div className="flex items-center gap-4">
                            <BodyShort size="small" className="font-bold">
                                <PersonNavn ident={barn.ident}></PersonNavn>
                            </BodyShort>
                            <BodyShort size="small">{barn.ident}</BodyShort>
                        </div>
                    </div>
                    <BarnetilleggTabel barn={barn} />
                </>
            ))}
        </Box>
    );
};
export const BarnetilleggTabel = ({ barn }: { barn: RolleDto }) => {
    const { inntektFormValues, setInntektFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const { roller, søktFomDato } = useGetBehandling();
    const [editableRow, setEditableRow] = useState(undefined);
    const saveInntekt = useOnSaveInntekt();
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(søktFomDato));
    const fieldName = `barnetillegg.${barn.ident}` as const;

    const {
        control,
        getFieldState,
        getValues,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: fieldName,
    });
    const watchFieldArray = useWatch({ control, name: fieldName });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const barnetilleggList = getValues(fieldName);

        if (!barnetilleggList.length) {
            clearErrors(fieldName);
            return;
        }
        const filtrertOgSorterListe = barnetilleggList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError(fieldName, {
                ...errors.barnetillegg,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("barnetillegg.types.overlappingPerioder");
        }
    };

    const updatedAndSave = (inntekter: InntektDtoV2[]) => {
        const updatedValues = {
            ...inntektFormValues,
            barnetillegg: { ...inntektFormValues.barnetillegg },
        };
        setInntektFormValues(updatedValues);
        setValue(fieldName, inntekter);
        saveInntekt(updatedValues);
        setEditableRow(undefined);
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(fieldName);
        if (perioderValues[index].datoFom === null) {
            setError(`${fieldName}.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        const fieldState = getFieldState(`${fieldName}.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
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

    const handleOnDelete = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            clearErrors(fieldName);
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

    const handleOnSelect = (value: boolean, index: number) => {
        const periodeValues = getValues(fieldName);
        const updatedValues = periodeValues.toSpliced(index, 1, {
            ...periodeValues[index],
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
            {errors?.barnetillegg?.[barn.ident].types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.barnetillegg?.[barn.ident].types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper
                    heading={[
                        "Ta med",
                        "Fra og med",
                        "Til og med",
                        "Kilde",
                        "Type",
                        "Beløp (mnd)",
                        "Beløp (12 mnd)",
                        "",
                        "",
                    ]}
                >
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledCheckbox
                                    key={`barnetillegg.${index}.taMed`}
                                    name={`barnetillegg.${index}.taMed`}
                                    onChange={(value) => handleOnSelect(value.target.checked, index)}
                                    legend=""
                                />,
                                <FormControlledMonthPicker
                                    key={`barnetillegg.${index}.datoFom`}
                                    name={`barnetillegg.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    fromDate={fom}
                                    toDate={tom}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`barnetillegg.${index}.datoTom`}
                                    name={`barnetillegg.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    lastDayOfMonthPicker
                                />,
                                <BodyShort key={`barnetillegg.${index}.kilde`}>{KildeTexts[item.kilde]}</BodyShort>,
                                item.kilde === Kilde.OFFENTLIG ? (
                                    <BodyShort key={`barnetillegg.${index}.rapporteringstype`}>
                                        {hentVisningsnavn(item.rapporteringstype)}
                                    </BodyShort>
                                ) : (
                                    <FormControlledSelectField
                                        name={`barnetillegg.${index}.${index}.rapporteringstype`}
                                        label="Type"
                                        options={[{ value: "", text: "Velg type" }].concat(
                                            Object.entries(Inntektstype)
                                                .filter(([, text]) => text.includes("BARNETILLEGG"))
                                                .map(([value, text]) => ({
                                                    value,
                                                    text: hentVisningsnavn(text),
                                                }))
                                        )}
                                        hideLabel
                                    />
                                ),
                                item.kilde === Kilde.OFFENTLIG ? (
                                    <BodyShort key={`barnetillegg.${index}.beløp`}>{item.beløp}</BodyShort>
                                ) : (
                                    <FormControlledTextField
                                        key={`barnetillegg.${index}.beløp`}
                                        name={`barnetillegg.${index}.beløp`}
                                        label="Beløp"
                                        type="number"
                                        min="0"
                                        hideLabel
                                    />
                                ),
                                <BodyShort key={`barnetillegg.${index}.beløp12mnd`}>{item.beløp * 12}</BodyShort>,
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
                        rapporteringstype: Inntektsrapportering.BARNETILLEGG,
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
