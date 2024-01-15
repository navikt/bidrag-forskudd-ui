import { FloppydiskIcon, InformationSquareIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Box, Button, Heading, Popover } from "@navikt/ds-react";
import React, { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { RolleDto } from "../../../api/BidragBehandlingApiV1";
import { SummertManedsinntekt } from "../../../api/BidragInntektApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { GrunnlagInntektType } from "../../../enum/InntektBeskrivelse";
import { useGetBehandling } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import { Inntekt, InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYString, getYearFromDate, isValidDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableExpandableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { editPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import AinntektLink from "./AinntektLink";

const Beskrivelse = ({ item, index, ident }: { item: Inntekt; index: number; ident: string }) => {
    const toVisningsnavn = useVisningsnavn();
    return item.fraGrunnlag ? (
        <BodyShort className="min-w-[215px] capitalize">
            {toVisningsnavn(item.inntektstype, getYearFromDate(item.datoFom))}
        </BodyShort>
    ) : (
        <FormControlledSelectField
            name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.inntektstype`}
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
const Totalt = ({ item, index, ident }: { item: Inntekt; index: number; ident: string }) =>
    item.fraGrunnlag ? (
        <div className="flex items-center gap-x-4">
            <BodyShort className="min-w-[80px] flex justify-end">{item.beløp}</BodyShort>
            <Detaljer totalt={item.beløp} />
        </div>
    ) : (
        <div className="w-[120px]">
            <FormControlledTextField
                name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.belop`}
                label="Totalt"
                type="number"
                min="1"
                hideLabel
            />
        </div>
    );

const DeleteButton = ({ item, index, handleOnDelete }) =>
    item.fraGrunnlag ? (
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

const EditOrSaveButton = ({ index, editableRow, onEditRow, onSaveRow }) =>
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
        <BodyShort key={`sivilstand.${index}.datoTom.placeholder`}>
            {value && DateToDDMMYYYYString(dateOrNull(value))}
        </BodyShort>
    );
};

const ExpandableContent = ({ item }: { item: Inntekt }) => {
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

export const InntekteneSomLeggesTilGrunn = ({
    inntekt,
    rolle,
}: {
    inntekt: SummertManedsinntekt[];
    rolle: RolleDto;
}) => (
    <Box padding="4" background="surface-subtle" className="grid gap-y-4 overflow-hidden">
        <div className="flex gap-x-4">
            <Heading level="3" size="medium">
                Skattepliktige og pensjonsgivende inntekt
            </Heading>
            {inntekt.length > 0 && <AinntektLink ident={rolle.ident} />}
        </div>
        <InntekteneSomLeggesTilGrunnTabel ident={rolle.ident} />
    </Box>
);

export const InntekteneSomLeggesTilGrunnTabel = ({ ident }: { ident: string }) => {
    const { inntektFormValues, setErrorMessage, setErrorModalOpen, setInntektFormValues } = useForskudd();
    const [editableRow, setEditableRow] = useState(undefined);
    const saveInntekt = useOnSaveInntekt();
    const {
        virkningstidspunkt: { virkningsdato },
    } = useGetBehandling();
    const {
        control,
        getFieldState,
        getValues,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const inntekteneSomLeggesTilGrunnField = useFieldArray({
        control,
        name: `inntekteneSomLeggesTilGrunn.${ident}`,
    });
    const virkningstidspunkt = dateOrNull(virkningsdato);
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(virkningsdato));

    const watchFieldArray = useWatch({ control, name: `inntekteneSomLeggesTilGrunn.${ident}` });

    const handleOnSelect = (value: boolean, index: number) => {
        const periodeValues = getValues(`inntekteneSomLeggesTilGrunn.${ident}`);
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
            const perioderValues = getValues(`inntekteneSomLeggesTilGrunn.${ident}`);
            // const updatedPeriods = removeAndEditPeriods(perioderValues, index);
            updatedAndSave(perioderValues);
        }
    };

    const controlledFields = inntekteneSomLeggesTilGrunnField.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const periodeValues = getValues(`inntekteneSomLeggesTilGrunn.${ident}`);
            inntekteneSomLeggesTilGrunnField.append({
                datoFom: null,
                datoTom: null,
                beløp: 0,
                inntektstype: "",
                taMed: false,
                fraGrunnlag: false,
                inntektsposter: [],
            });
            setEditableRow(periodeValues.length);
        }
    };
    const updatedAndSave = (inntekter: Inntekt[]) => {
        const updatedValues = {
            ...inntektFormValues,
            inntekteneSomLeggesTilGrunn: { ...inntektFormValues.inntekteneSomLeggesTilGrunn, [ident]: inntekter },
        };
        setInntektFormValues(updatedValues);
        setValue(`inntekteneSomLeggesTilGrunn.${ident}`, inntekter);
        saveInntekt(updatedValues);
        setEditableRow(undefined);
    };
    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`inntekteneSomLeggesTilGrunn.${ident}`);
        if (perioderValues[index].datoFom === null) {
            setError(`inntekteneSomLeggesTilGrunn.${ident}.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        const fieldState = getFieldState(`inntekteneSomLeggesTilGrunn.${ident}.${index}`);
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

    return (
        <>
            {(errors?.inntekteneSomLeggesTilGrunn?.[ident]?.types || !isValidDate(virkningstidspunkt)) && (
                <Alert variant="warning" className="mb-4">
                    {!isValidDate(virkningstidspunkt) && <BodyShort>Mangler virkningstidspunkt</BodyShort>}
                    {errors.inntekteneSomLeggesTilGrunn?.[ident].types?.periodGaps && (
                        <BodyShort>{errors.inntekteneSomLeggesTilGrunn[ident].types.periodGaps}</BodyShort>
                    )}
                    {errors.inntekteneSomLeggesTilGrunn?.[ident].types?.overlappingPerioder && (
                        <>
                            <BodyShort>Du har overlappende perioder:</BodyShort>
                            {JSON.parse(
                                errors.inntekteneSomLeggesTilGrunn[ident].types.overlappingPerioder as string
                            ).map((perioder) => (
                                <BodyShort key={perioder}>
                                    <span className="capitalize">{perioder[0]}</span> og{" "}
                                    <span className="capitalize">{perioder[1]}</span>
                                </BodyShort>
                            ))}
                        </>
                    )}
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["", "Ta med", "Beskrivelse", "Beløp", "Fra og med", "Til og med", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableExpandableRowWrapper
                            content={<ExpandableContent item={item} />}
                            key={item.id}
                            cells={[
                                <FormControlledCheckbox
                                    key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.taMed`}
                                    name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.taMed`}
                                    onChange={(value) => handleOnSelect(value.target.checked, index)}
                                    legend=""
                                />,
                                <Beskrivelse
                                    key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.inntektBeskrivelse`}
                                    item={item}
                                    index={index}
                                    ident={ident}
                                />,
                                <Totalt
                                    key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.belop`}
                                    item={item}
                                    index={index}
                                    ident={ident}
                                />,
                                <Periode
                                    key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.datoFom`}
                                    value={item.datoFom}
                                    editableRow={editableRow}
                                    index={index}
                                    datepicker={
                                        <FormControlledMonthPicker
                                            name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.datoFom`}
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
                                    key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.datoTom`}
                                    editableRow={editableRow}
                                    value={item.datoTom}
                                    index={index}
                                    datepicker={
                                        <FormControlledMonthPicker
                                            name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.datoTom`}
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
