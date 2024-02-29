import { FloppydiskIcon, PencilIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Box, Button, Heading, Table } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    InntektDtoV2,
    Inntektsrapportering,
    Kilde,
    OppdatereManuellInntekt,
    OppdaterePeriodeInntekt,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetBehandling, useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYString, getYearFromDate, isAfterDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import AinntektLink from "./AinntektLink";

export const Beskrivelse = ({
    item,
    field,
    erRedigerbart,
}: {
    item: InntektDtoV2;
    field: string;
    erRedigerbart: boolean;
}) => {
    return erRedigerbart ? (
        <FormControlledSelectField
            name={`${field}.inntektstype`}
            label="Beskrivelse"
            options={[{ value: "", text: "Velg type inntekt" }].concat(
                [
                    Inntektsrapportering.LONNMANUELTBEREGNET,
                    Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                    Inntektsrapportering.PERSONINNTEKT_EGNE_OPPLYSNINGER,
                    Inntektsrapportering.SAKSBEHANDLER_BEREGNET_INNTEKT,
                    Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                    Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
                ].map((value) => ({
                    value,
                    text: hentVisningsnavn(value),
                }))
            )}
            hideLabel
        />
    ) : (
        <BodyShort className="min-w-[215px] capitalize">
            {hentVisningsnavn(item.rapporteringstype, getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};
export const Totalt = ({
    item,
    field,
    erRedigerbart,
}: {
    item: InntektDtoV2;
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

export const Periode = ({ index, value, editableRow, datepicker, erMed }) => {
    return editableRow === index ? (
        datepicker
    ) : (
        <BodyShort key={`årsinntekter.${index}.datoTom.placeholder`}>
            {erMed && value && DateToDDMMYYYYString(dateOrNull(value))}
        </BodyShort>
    );
};

const ExpandableContent = ({ item }: { item: InntektDtoV2 }) => {
    return (
        <>
            <BodyShort size="small">
                Periode: {item.datoFom && dateToDDMMYYYYString(new Date(item.datoFom))} -{" "}
                {item.datoTom && dateToDDMMYYYYString(new Date(item.datoTom))}
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
    const { setErrorMessage, setErrorModalOpen } = useForskudd();
    const [editableRow, setEditableRow] = useState(undefined);
    const saveInntekt = useOnSaveInntekt();
    const {
        virkningstidspunkt: { virkningstidspunkt: virkningsdato },
    } = useGetBehandling();
    const virkningstidspunkt = dateOrNull(virkningsdato);
    const [fom, tom] = getFomAndTomForMonthPicker(virkningstidspunkt);
    const fieldName = `årsinntekter.${ident}` as const;
    const {
        control,
        getFieldState,
        getValues,
        clearErrors,
        setError,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
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
                type: periode.rapporteringstype,
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

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const periodeValues = getValues(`${fieldName}`);
            fieldArray.append({
                datoFom: null,
                datoTom: null,
                ident: ident,
                beløp: 0,
                rapporteringstype: Inntektsrapportering.SKATTEGRUNNLAG_SKE,
                taMed: true,
                kilde: Kilde.MANUELL,
                inntektsposter: [],
                inntektstyper: [],
            });
            setEditableRow(periodeValues.length);
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
                message: "Dato må fylles ut",
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
                    type: periode.rapporteringstype,
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
                <div className="overflow-x-auto whitespace-nowrap">
                    <Table size="small">
                        <Table.Header>
                            <Table.Row className="align-baseline">
                                <Table.HeaderCell scope="col" className="w-[84px]">
                                    Ta med
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[145px]">
                                    Fra og med
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[145px]">
                                    Til og med
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col">Beskrivelse</Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[154px]">
                                    Beløp
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col"></Table.HeaderCell>
                                <Table.HeaderCell scope="col"></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {controlledFields.map((item, index) => (
                                <Table.ExpandableRow
                                    key={item.ident + index}
                                    content={<ExpandableContent item={item} />}
                                    togglePlacement="right"
                                    className="h-[41px] align-baseline"
                                >
                                    <Table.DataCell className="w-[84px]" align="center">
                                        <FormControlledCheckbox
                                            className="w-full flex justify-center"
                                            name={`${fieldName}.${index}.taMed`}
                                            onChange={(value) => handleOnSelect(value.target.checked, index)}
                                            legend=""
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Periode
                                            value={item.datoFom}
                                            erMed={item.taMed}
                                            editableRow={editableRow}
                                            index={index}
                                            datepicker={
                                                <FormControlledMonthPicker
                                                    name={`${fieldName}.${index}.datoFom`}
                                                    label="Fra og med"
                                                    placeholder="DD.MM.ÅÅÅÅ"
                                                    defaultValue={item.datoFom}
                                                    required={item.taMed}
                                                    fromDate={fom}
                                                    toDate={tom}
                                                    customValidation={() => validateFomOgTom(index)}
                                                    hideLabel
                                                />
                                            }
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Periode
                                            editableRow={editableRow}
                                            value={item.datoTom}
                                            erMed={item.taMed}
                                            index={index}
                                            datepicker={
                                                <FormControlledMonthPicker
                                                    name={`${fieldName}.${index}.datoTom`}
                                                    label="Til og med"
                                                    placeholder="DD.MM.ÅÅÅÅ"
                                                    defaultValue={item.datoTom}
                                                    fromDate={fom}
                                                    toDate={tom}
                                                    customValidation={() => validateFomOgTom(index)}
                                                    hideLabel
                                                    lastDayOfMonthPicker
                                                />
                                            }
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Beskrivelse
                                            item={item}
                                            field={`${fieldName}.${index}`}
                                            erRedigerbart={editableRow === index && item.kilde === Kilde.MANUELL}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Totalt
                                            item={item}
                                            field={`${fieldName}.${index}`}
                                            erRedigerbart={editableRow === index && item.kilde === Kilde.MANUELL}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <EditOrSaveButton
                                            index={index}
                                            erMed={item.taMed}
                                            editableRow={editableRow}
                                            onEditRow={onEditRow}
                                            onSaveRow={onSaveRow}
                                        />
                                    </Table.DataCell>
                                </Table.ExpandableRow>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            )}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                + Legg til periode
            </Button>
        </>
    );
};
