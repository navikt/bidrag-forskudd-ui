import { FloppydiskIcon, InformationSquareIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Box, Button, Heading, Popover } from "@navikt/ds-react";
import React, { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { InntektDtoV2, Inntektsrapportering, Kilde } from "../../../api/BidragBehandlingApiV1";
import { useForskudd } from "../../../context/ForskuddContext";
import { GrunnlagInntektType } from "../../../enum/InntektBeskrivelse";
import { useGetBehandling, useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYString, getYearFromDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableExpandableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { editPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import AinntektLink from "./AinntektLink";

const Beskrivelse = ({ item, index, ident }: { item: InntektDtoV2; index: number; ident: string }) => {
    const toVisningsnavn = useVisningsnavn();
    return item.kilde === Kilde.OFFENTLIG ? (
        <BodyShort className="min-w-[215px] capitalize">
            {toVisningsnavn(item.rapporteringstype, getYearFromDate(item.datoFom))}
        </BodyShort>
    ) : (
        <FormControlledSelectField
            name={`årsinntekter.${ident}.${index}.inntektstype`}
            label="Beskrivelse"
            options={[{ value: "", text: "Velg type inntekt" }].concat(
                Object.entries(GrunnlagInntektType).map(([value, text]) => ({
                    value,
                    text,
                }))
            )}
            hideLabel
        />
    );
};

const Detaljer = ({ totalt }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [openState, setOpenState] = useState(false);

    return (
        <>
            <Button
                type="button"
                size="small"
                variant="tertiary"
                ref={buttonRef}
                icon={<InformationSquareIcon aria-hidden />}
                onClick={() => setOpenState(true)}
            />
            <Popover open={openState} onClose={() => setOpenState(false)} anchorEl={buttonRef.current}>
                <Popover.Content className="grid gap-y-4">
                    <Heading level="4" size="small">
                        Detaljer
                    </Heading>
                    <BodyShort size="small">Lønnsinntekt med trygdeavgiftsplikt og med trekkplikt: {totalt}</BodyShort>
                    <BodyShort size="small">Sum: {totalt}</BodyShort>
                    <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        className="w-max"
                        onClick={() => setOpenState(false)}
                    >
                        Lukk
                    </Button>
                </Popover.Content>
            </Popover>
        </>
    );
};
const Totalt = ({ item, index, ident }: { item: InntektDtoV2; index: number; ident: string }) =>
    item.kilde === Kilde.OFFENTLIG ? (
        <div className="flex items-center gap-x-4">
            <BodyShort className="min-w-[80px] flex justify-end">{item.beløp}</BodyShort>
            <Detaljer totalt={item.beløp} />
        </div>
    ) : (
        <div className="w-[120px]">
            <FormControlledTextField
                name={`årsinntekter.${ident}.${index}.beløp`}
                label="Totalt"
                type="number"
                min="1"
                hideLabel
            />
        </div>
    );

export const DeleteButton = ({ item, index, handleOnDelete }) =>
    item.kilde === Kilde.OFFENTLIG ? (
        <div className="min-w-[40px]"></div>
    ) : (
        <Button
            type="button"
            onClick={() => handleOnDelete(index)}
            icon={<TrashIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    );

export const EditOrSaveButton = ({ index, editableRow, onEditRow, onSaveRow }) =>
    editableRow === index ? (
        <Button
            type="button"
            onClick={() => onSaveRow(index)}
            icon={<FloppydiskIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    ) : (
        <Button
            type="button"
            onClick={() => onEditRow(index)}
            icon={<PencilIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    );

const Periode = ({ index, value, editableRow, datepicker }) => {
    return editableRow === index ? (
        <div className="min-w-[160px]">{datepicker}</div>
    ) : (
        <BodyShort key={`årsinntekter.${index}.datoTom.placeholder`}>
            {value && DateToDDMMYYYYString(dateOrNull(value))}
        </BodyShort>
    );
};

const ExpandableContent = ({ item }: { item: InntektDtoV2 }) => {
    return (
        <>
            <BodyShort size="small">
                Periode: {dateToDDMMYYYYString(new Date(item.datoFom))} - {dateToDDMMYYYYString(new Date(item.datoTom))}
            </BodyShort>
            {item.inntektsposter.map((inntektpost) => (
                <BodyShort size="small" key={inntektpost.kode}>
                    {inntektpost.visningsnavn}: {inntektpost.beløp}
                </BodyShort>
            ))}
        </>
    );
};

export const SkattepliktigeOgPensjonsgivendeInntekt = ({ ident }: { ident: string }) => {
    const { inntekter } = useGetBehandlingV2();
    const årsinntekter = inntekter.årsinntekter?.filter((inntekt) => inntekt.ident === ident);
    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <div className="flex gap-x-4">
                <Heading level="3" size="medium">
                    Skattepliktige og pensjonsgivende inntekt
                </Heading>
                {årsinntekter?.length > 0 && <AinntektLink ident={ident} />}
            </div>
            <SkattepliktigeOgPensjonsgivendeInntektTabel ident={ident} />
        </Box>
    );
};

export const SkattepliktigeOgPensjonsgivendeInntektTabel = ({ ident }: { ident: string }) => {
    const { inntektFormValues, setErrorMessage, setErrorModalOpen, setInntektFormValues } = useForskudd();
    const [editableRow, setEditableRow] = useState(undefined);
    const saveInntekt = useOnSaveInntekt();
    const {
        virkningstidspunkt: { virkningstidspunkt: virkningsdato },
    } = useGetBehandling();
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
        control,
        name: `årsinntekter.${ident}`,
    });
    const watchFieldArray = useWatch({ control, name: `årsinntekter.${ident}` });
    const virkningstidspunkt = dateOrNull(virkningsdato);
    const [fom, tom] = getFomAndTomForMonthPicker(virkningstidspunkt);

    const handleOnSelect = (value: boolean, index: number) => {
        const periodeValues = getValues(`årsinntekter.${ident}`);
        const updatedValues = periodeValues.toSpliced(index, 1, {
            ...periodeValues[index],
            taMed: value,
        });
        updatedAndSave(updatedValues);
    };

    const handleOnDelete = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            clearErrors(`årsinntekter.${index}`);
            fieldArray.remove(index);
            if (editableRow === index) {
                setEditableRow(undefined);
            }
        }
    };

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const periodeValues = getValues(`årsinntekter.${ident}`);
            fieldArray.append({
                datoFom: null,
                datoTom: null,
                ident: ident,
                beløp: 0,
                rapporteringstype: Inntektsrapportering.SKATTEGRUNNLAG_SKE,
                taMed: false,
                kilde: Kilde.MANUELL,
                inntektsposter: [],
                inntektstyper: [],
            });
            setEditableRow(periodeValues.length);
        }
    };
    const updatedAndSave = (inntekter: InntektDtoV2[]) => {
        const updatedValues = {
            ...inntektFormValues,
            årsinntekter: { ...inntektFormValues.årsinntekter, [ident]: inntekter },
        };
        setInntektFormValues(updatedValues);
        setValue(`årsinntekter.${ident}`, inntekter);
        saveInntekt(updatedValues);
        setEditableRow(undefined);
    };
    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`årsinntekter.${ident}`);
        if (perioderValues[index].datoFom === null) {
            setError(`årsinntekter.${ident}.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        const fieldState = getFieldState(`årsinntekter.${ident}.${index}`);
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
            {errors?.årsinntekter?.[ident]?.types && (
                <Alert variant="warning" className="mb-4">
                    {errors.årsinntekter?.[ident].types?.periodGaps && (
                        <BodyShort>{errors.årsinntekter[ident].types.periodGaps}</BodyShort>
                    )}
                    {errors.årsinntekter?.[ident].types?.overlappingPerioder && (
                        <>
                            <BodyShort>Du har overlappende perioder:</BodyShort>
                            {JSON.parse(errors.årsinntekter[ident].types.overlappingPerioder as string).map(
                                (perioder) => (
                                    <BodyShort key={perioder}>
                                        <span className="capitalize">{perioder[0]}</span> og{" "}
                                        <span className="capitalize">{perioder[1]}</span>
                                    </BodyShort>
                                )
                            )}
                        </>
                    )}
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Ta med", "Fra og med", "Til og med", "Beskrivelse", "Beløp", "", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableExpandableRowWrapper
                            content={<ExpandableContent item={item} />}
                            key={item.id}
                            cells={[
                                <FormControlledCheckbox
                                    key={`årsinntekter.${ident}.${index}.taMed`}
                                    name={`årsinntekter.${ident}.${index}.taMed`}
                                    onChange={(value) => handleOnSelect(value.target.checked, index)}
                                    legend=""
                                />,
                                <Periode
                                    key={`årsinntekter.${ident}.${index}.datoFom`}
                                    value={item.datoFom}
                                    editableRow={editableRow}
                                    index={index}
                                    datepicker={
                                        <FormControlledMonthPicker
                                            name={`årsinntekter.${ident}.${index}.datoFom`}
                                            label="Fra og med"
                                            placeholder="DD.MM.ÅÅÅÅ"
                                            defaultValue={item.datoFom}
                                            required={item.taMed}
                                            fromDate={fom}
                                            toDate={tom}
                                            hideLabel
                                        />
                                    }
                                />,
                                <Periode
                                    key={`årsinntekter.${ident}.${index}.datoTom`}
                                    editableRow={editableRow}
                                    value={item.datoTom}
                                    index={index}
                                    datepicker={
                                        <FormControlledMonthPicker
                                            name={`årsinntekter.${ident}.${index}.datoTom`}
                                            label="Til og med"
                                            placeholder="DD.MM.ÅÅÅÅ"
                                            defaultValue={item.datoTom}
                                            fromDate={fom}
                                            toDate={tom}
                                            hideLabel
                                            lastDayOfMonthPicker
                                        />
                                    }
                                />,
                                <Beskrivelse
                                    key={`årsinntekter.${ident}.${index}.inntektBeskrivelse`}
                                    item={item}
                                    index={index}
                                    ident={ident}
                                />,
                                <Totalt
                                    key={`årsinntekter.${ident}.${index}.belop`}
                                    item={item}
                                    index={index}
                                    ident={ident}
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
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                + Legg til periode
            </Button>
        </>
    );
};
