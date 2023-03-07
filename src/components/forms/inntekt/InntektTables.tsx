import { Delete } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React from "react";
import { FieldValues, useFieldArray, UseFieldArrayReturn, useFormContext } from "react-hook-form";

import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledDatePicker } from "../../formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";

export const InntekteneSomLeggesTilGrunnTabel = ({
    fieldArray,
}: {
    fieldArray: UseFieldArrayReturn<FieldValues, "inntekteneSomLeggesTilGrunn", string>;
}) => {
    const handleOnDelete = (index) => {
        fieldArray.remove(index);

        if (!index) {
            fieldArray.append({
                fraDato: null,
                tilDato: null,
                arbeidsgiver: "",
                totalt: "",
                beskrivelse: "",
            });
        }
    };

    return (
        <>
            <TableWrapper heading={["Periode", "Arbeidsgiver/NAV", "Totalt", "Beskrivelse", ""]}>
                {fieldArray.fields.map((item, index) => {
                    return (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <div className="flex gap-x-4">
                                    <FormControlledDatePicker
                                        key={`inntekteneSomLeggesTilGrunn[${index}].fraDato`}
                                        name={`inntekteneSomLeggesTilGrunn[${index}].fraDato`}
                                        label="Fra og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item?.fraDato ?? null}
                                        hideLabel
                                    />
                                    <FormControlledDatePicker
                                        key={`inntekteneSomLeggesTilGrunn[${index}].tilDato`}
                                        name={`inntekteneSomLeggesTilGrunn[${index}].tilDato`}
                                        label="Til og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item?.tilDato ?? null}
                                        hideLabel
                                    />
                                </div>,
                                <FormControlledTextField
                                    key={`inntekteneSomLeggesTilGrunn[${index}].arbeidsgiver`}
                                    name={`inntekteneSomLeggesTilGrunn[${index}].arbeidsgiver`}
                                    label="Arbeidsgiver/Nav"
                                    hideLabel
                                />,
                                <FormControlledTextField
                                    key={`inntekteneSomLeggesTilGrunn[${index}].totalt`}
                                    name={`inntekteneSomLeggesTilGrunn[${index}].totalt`}
                                    label="Totalt"
                                    type="number"
                                    hideLabel
                                />,
                                <FormControlledTextField
                                    key={`inntekteneSomLeggesTilGrunn[${index}].beskrivelse`}
                                    name={`inntekteneSomLeggesTilGrunn[${index}].beskrivelse`}
                                    label="Beskrivelse"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => handleOnDelete(index)}
                                    icon={<Delete aria-hidden />}
                                    variant="tertiary"
                                    size="xsmall"
                                />,
                            ]}
                        />
                    );
                })}
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
                        arbeidsgiver: "",
                        totalt: "",
                        beskrivelse: "",
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};

export const UtvidetBarnetrygdTabel = () => {
    const { control } = useFormContext();
    const fieldArray: UseFieldArrayReturn<FieldValues, "utvidetBarnetrygd", string> = useFieldArray({
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
    const { control } = useFormContext();
    const fieldArray: UseFieldArrayReturn<FieldValues, "barnetillegg", string> = useFieldArray({
        control: control,
        name: "barnetillegg",
    });

    return (
        <>
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
                                options={[
                                    { value: "", text: "" },
                                    { value: "barn_1", text: "Barn 1" },
                                    { value: "barn_2", text: "Barn 2" },
                                ]}
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
                        barn: "",
                        brutto: "",
                        skattesats: "",
                        netto: "",
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};
