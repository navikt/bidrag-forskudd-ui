import { Delete } from "@navikt/ds-icons";
import { BodyShort, Button, Loader } from "@navikt/ds-react";
import React, { Suspense } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { useForskudd } from "../../../context/ForskuddContext";
import { RolleType } from "../../../enum/RolleType";
import { useApiData } from "../../../hooks/useApiData";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledDatePicker } from "../../formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";

const Beskrivelse = ({ item, index }) =>
    item.fraPostene ? (
        <BodyShort className="min-w-[215px]">{item.beskrivelse}</BodyShort>
    ) : (
        <FormControlledTextField
            key={`inntekteneSomLeggesTilGrunn[${index}].beskrivelse`}
            name={`inntekteneSomLeggesTilGrunn[${index}].beskrivelse`}
            label="Beskrivelse"
            hideLabel
        />
    );
const Totalt = ({ item, index }) =>
    item.fraPostene ? (
        <BodyShort className="min-w-[215px]">{item.totalt}</BodyShort>
    ) : (
        <FormControlledTextField
            key={`inntekteneSomLeggesTilGrunn[${index}].totalt`}
            name={`inntekteneSomLeggesTilGrunn[${index}].totalt`}
            label="Totalt"
            type="number"
            hideLabel
        />
    );

const DeleteButton = ({ item, index, handleOnDelete }) =>
    item.fraPostene ? (
        <div className="min-w-[40px]"></div>
    ) : (
        <Button
            key={`delete-button-${index}`}
            type="button"
            onClick={() => handleOnDelete(index)}
            icon={<Delete aria-hidden />}
            variant="tertiary"
            size="xsmall"
        />
    );

const Periode = ({ item, index, datepicker }) => {
    const { control } = useFormContext<InntektFormValues>();
    const value = useWatch({
        control,
        name: "inntekteneSomLeggesTilGrunn",
    });

    return value[index].selected || !item.fraPostene ? datepicker : <div className="min-w-[160px]"></div>;
};

export const InntekteneSomLeggesTilGrunnTabel = () => {
    const { control } = useFormContext<InntektFormValues>();
    const inntekteneSomLeggesTilGrunnField = useFieldArray({
        control,
        name: "inntekteneSomLeggesTilGrunn",
    });

    const handleOnDelete = (index) => {
        inntekteneSomLeggesTilGrunnField.remove(index);
        if (!index) {
            inntekteneSomLeggesTilGrunnField.append({
                fraDato: null,
                tilDato: null,
                totalt: "",
                beskrivelse: "",
                selected: false,
                fraPostene: false,
            });
        }
    };

    return (
        <>
            <TableWrapper heading={["Ta med", "Beskrivelse", "Beløp", "Fra og med", "Til og med", ""]}>
                {inntekteneSomLeggesTilGrunnField.fields.map((item, index) => (
                    <TableRowWrapper
                        key={item.id}
                        cells={[
                            <FormControlledCheckbox
                                key={`inntekteneSomLeggesTilGrunn[${index}].selected`}
                                name={`inntekteneSomLeggesTilGrunn[${index}].selected`}
                                legend=""
                            />,
                            <Beskrivelse item={item} index={index} />,
                            <Totalt item={item} index={index} />,
                            <Periode
                                item={item}
                                index={index}
                                datepicker={
                                    <FormControlledDatePicker
                                        key={`inntekteneSomLeggesTilGrunn[${index}].fraDato`}
                                        name={`inntekteneSomLeggesTilGrunn[${index}].fraDato`}
                                        label="Fra og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item?.fraDato ?? null}
                                        hideLabel
                                    />
                                }
                            />,
                            <Periode
                                item={item}
                                index={index}
                                datepicker={
                                    <FormControlledDatePicker
                                        key={`inntekteneSomLeggesTilGrunn[${index}].tilDato`}
                                        name={`inntekteneSomLeggesTilGrunn[${index}].tilDato`}
                                        label="Til og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item?.tilDato ?? null}
                                        hideLabel
                                    />
                                }
                            />,
                            <DeleteButton item={item} index={index} handleOnDelete={handleOnDelete} />,
                        ]}
                    />
                ))}
            </TableWrapper>
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    inntekteneSomLeggesTilGrunnField.append({
                        fraDato: null,
                        tilDato: null,
                        totalt: "",
                        beskrivelse: "",
                        selected: false,
                        fraPostene: false,
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};

export const UtvidetBarnetrygdTabel = () => {
    const { control } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "utvidetBarnetrygd",
    });

    return (
        <>
            <TableWrapper heading={["Periode", "Delt bosted", "Beløp", ""]}>
                {fieldArray.fields.map((item, index) => (
                    <TableRowWrapper
                        key={item.id}
                        cells={[
                            <div className="flex gap-x-4">
                                <FormControlledDatePicker
                                    key={`utvidetBarnetrygd[${index}].fraDato`}
                                    name={`utvidetBarnetrygd[${index}].fraDato`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item?.fraDato ?? null}
                                    hideLabel
                                />
                                <FormControlledDatePicker
                                    key={`utvidetBarnetrygd[${index}].tilDato`}
                                    name={`utvidetBarnetrygd[${index}].tilDato`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item?.tilDato ?? null}
                                    hideLabel
                                />
                            </div>,
                            <FormControlledCheckbox
                                key={`utvidetBarnetrygd[${index}].deltBosted`}
                                name={`utvidetBarnetrygd[${index}].deltBosted`}
                                legend=""
                            />,
                            <FormControlledTextField
                                key={`utvidetBarnetrygd[${index}].beloep`}
                                name={`utvidetBarnetrygd[${index}].beloep`}
                                label="Beskrivelse"
                                type="number"
                                hideLabel
                            />,
                            <Button
                                key={`delete-button-${index}`}
                                type="button"
                                onClick={() => fieldArray.remove(index)}
                                icon={<Delete aria-hidden />}
                                variant="tertiary"
                                size="xsmall"
                            />,
                        ]}
                    />
                ))}
            </TableWrapper>
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    fieldArray.append({
                        fraDato: null,
                        tilDato: null,
                        deltBosted: false,
                        beloep: "",
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};

export const BarnetilleggTabel = () => {
    const { saksnummer } = useForskudd();
    const { api } = useApiData();
    const { roller } = api.getSakAndRoller(saksnummer);
    const barnene = roller.filter((rolle) => rolle.rolleType === RolleType.BA);
    const { control } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "barnetillegg",
    });

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <TableWrapper
                heading={[
                    "Fra og med",
                    "Til og med",
                    "Barn",
                    "Barnetillegg (brutto)",
                    "Skattesats",
                    "Barnetillegg (netto)",
                    "",
                ]}
            >
                {fieldArray.fields.map((item, index) => (
                    <TableRowWrapper
                        key={item.id}
                        cells={[
                            <FormControlledDatePicker
                                key={`barnetillegg[${index}].fraDato`}
                                name={`barnetillegg[${index}].fraDato`}
                                label="Fra og med"
                                placeholder="DD.MM.ÅÅÅÅ"
                                defaultValue={item?.fraDato ?? null}
                                hideLabel
                            />,
                            <FormControlledDatePicker
                                key={`barnetillegg[${index}].tilDato`}
                                name={`barnetillegg[${index}].tilDato`}
                                label="Til og med"
                                placeholder="DD.MM.ÅÅÅÅ"
                                defaultValue={item?.tilDato ?? null}
                                hideLabel
                            />,
                            <FormControlledSelectField
                                key={`barnetillegg[${index}].barn`}
                                name={`barnetillegg[${index}].barn`}
                                label="Barn"
                                options={[{ value: "", text: "Velg barn" }].concat(
                                    barnene.map((barn) => ({ value: barn.ident, text: barn.navn }))
                                )}
                                hideLabel
                            />,
                            <FormControlledSelectField
                                key={`barnetillegg[${index}].brutto`}
                                name={`barnetillegg[${index}].brutto`}
                                label="Barnetillegg (brutto)"
                                options={[
                                    { value: "", text: "" },
                                    { value: "avslag_1", text: "Avslag 1" },
                                    { value: "avslag_2", text: "Avslag 2" },
                                ]}
                                hideLabel
                            />,
                            <FormControlledTextField
                                key={`barnetillegg[${index}].skattesats`}
                                name={`barnetillegg[${index}].skattesats`}
                                label="Skattesats"
                                type="number"
                                hideLabel
                            />,
                            <FormControlledTextField
                                key={`barnetillegg[${index}].netto`}
                                name={`barnetillegg[${index}].netto`}
                                label="Netto"
                                type="number"
                                hideLabel
                            />,
                            <Button
                                key={`delete-button-${index}`}
                                type="button"
                                onClick={() => fieldArray.remove(index)}
                                icon={<Delete aria-hidden />}
                                variant="tertiary"
                                size="xsmall"
                            />,
                        ]}
                    />
                ))}
            </TableWrapper>
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    fieldArray.append({
                        fraDato: null,
                        tilDato: null,
                        barn: { navn: "", foedselnummer: "" },
                        brutto: "",
                        skattesats: "",
                        netto: "",
                    })
                }
            >
                + legg til periode
            </Button>
        </Suspense>
    );
};
