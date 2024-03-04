import { Alert, BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    InntektDtoV2,
    Inntektsrapportering,
    Inntektstype,
    Kilde,
    OppdatereManuellInntekt,
    OppdaterePeriodeInntekt,
    RolleDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandling } from "../../../hooks/useApiData";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { getYearFromDate, isAfterDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";

import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { EditOrSaveButton, Periode, Totalt } from "./SkattepliktigeOgPensjonsgivendeInntekt";

const Beskrivelse = ({ item, field, erRedigerbart }: { item: InntektDtoV2; field: string; erRedigerbart: boolean }) => {
    return erRedigerbart ? (
        <FormControlledSelectField
            name={`${field}.inntektstype`}
            label="Beskrivelse"
            options={[{ value: "", text: "Velg type inntekt" }].concat(
                Object.entries(Inntektstype)
                    .filter(([, text]) => text.includes("BARNETILLEGG"))
                    .map(([value, text]) => ({
                        value,
                        text: hentVisningsnavn(text),
                    }))
            )}
            hideLabel
        />
    ) : (
        <BodyShort className="min-w-[215px] capitalize">
            {hentVisningsnavn(item.inntektstyper[0], getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};

export const Barnetillegg = () => {
    const { roller } = useGetBehandling();
    const barna = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                Barnetillegg
            </Heading>
            {barna.map((barn) => (
                <React.Fragment key={barn.ident}>
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
                </React.Fragment>
            ))}
        </Box>
    );
};
export const BarnetilleggTabel = ({ barn }: { barn: RolleDto }) => {
    const { setErrorMessage, setErrorModalOpen } = useForskudd();
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
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
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
                type: periode.inntektstype,
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
                ident: roller.find((rolle) => rolle.rolletype === Rolletype.BM).ident,
                gjelderBarn: barn.ident,
                beløp: 0,
                rapporteringstype: Inntektsrapportering.SKATTEGRUNNLAG_SKE,
                taMed: true,
                kilde: Kilde.MANUELL,
                inntektsposter: [],
                inntektstyper: [],
                inntektstype: "",
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
            {errors?.barnetillegg?.[barn.ident]?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.barnetillegg?.[barn.ident].types.overlappingPerioder}</BodyShort>
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
                                <Table.HeaderCell scope="col">Kilde</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Type</Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[154px]">
                                    Beløp (mnd)
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[154px]">
                                    Beløp (12 mnd)
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col"></Table.HeaderCell>
                                <Table.HeaderCell scope="col"></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {controlledFields.map((item, index) => (
                                <Table.Row key={item.ident + index} className="h-[41px] align-baseline">
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
                                        <BodyShort className="min-w-[215px] capitalize">
                                            {KildeTexts[item.kilde]}
                                        </BodyShort>
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
                                        <BodyShort className="min-w-[80px]">{item.beløp * 12}</BodyShort>
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
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            )}
            <LeggTilPeriodeButton addPeriode={addPeriode} />
        </>
    );
};
