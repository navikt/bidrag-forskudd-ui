import { Delete, ExternalLink } from "@navikt/ds-icons";
import { Alert, BodyShort, Button, Heading, Loader, Popover } from "@navikt/ds-react";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { useMockApi } from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { RolleType } from "../../../api/BidragBehandlingApi";
import { BEHANDLING_API } from "../../../constants/api";
import { useForskudd } from "../../../context/ForskuddContext";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledDatePicker } from "../../formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { findDateGaps, syncDates } from "./inntektFormHelpers";

const Beskrivelse = ({ item, index }) =>
    item.fraPostene ? (
        <BodyShort className="min-w-[215px] capitalize">{item.beskrivelse}</BodyShort>
    ) : (
        <FormControlledTextField
            key={`inntekteneSomLeggesTilGrunn.${index}.beskrivelse`}
            name={`inntekteneSomLeggesTilGrunn.${index}.beskrivelse`}
            label="Beskrivelse"
            hideLabel
        />
    );

const Detaljer = ({ totalt }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [openState, setOpenState] = useState(false);

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                ref={buttonRef}
                icon={<ExternalLink aria-hidden />}
                onClick={() => setOpenState(true)}
            />
            <Popover open={openState} onClose={() => setOpenState(false)} anchorEl={buttonRef.current}>
                <Popover.Content className="grid gap-y-4">
                    <Heading level="4" size="small">
                        Detaljer
                    </Heading>
                    <BodyShort size="small">Lønnsinntekt med trygdeavgiftsplikt og med trekkplikt: {totalt}</BodyShort>
                    <BodyShort size="small">Sum: {totalt}</BodyShort>
                    <Button size="small" className="w-max" onClick={() => setOpenState(false)}>
                        Lukk
                    </Button>
                </Popover.Content>
            </Popover>
        </>
    );
};
const Totalt = ({ item, index }) =>
    item.fraPostene ? (
        <div className="flex items-center gap-x-4">
            <BodyShort className="min-w-[80px] flex justify-end">{item.totalt}</BodyShort>
            <Detaljer totalt={item.totalt} />
        </div>
    ) : (
        <div className="w-[120px]">
            <FormControlledTextField
                key={`inntekteneSomLeggesTilGrunn.${index}.totalt`}
                name={`inntekteneSomLeggesTilGrunn.${index}.totalt`}
                label="Totalt"
                type="number"
                hideLabel
            />
        </div>
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
        name: `inntekteneSomLeggesTilGrunn.${index}.selected`,
    });

    return <div className={`${value || !item.fraPostene ? "" : "hidden"} min-w-[160px]`}>{datepicker}</div>;
};

export const InntekteneSomLeggesTilGrunnTabel = () => {
    const { saksnummer, virkningstidspunktFormValues } = useForskudd();
    const { api } = useMockApi();
    const { data: behandling } = api.getBehandling(saksnummer);
    const {
        control,
        getValues,
        setValue,
        setError,
        clearErrors,
        trigger,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const inntekteneSomLeggesTilGrunnField = useFieldArray({
        control,
        name: "inntekteneSomLeggesTilGrunn",
    });
    const virkningstidspunkt = virkningstidspunktFormValues?.virkningstidspunkt
        ? virkningstidspunktFormValues.virkningstidspunkt
        : new Date(behandling.virkningstidspunkt);

    useEffect(() => {
        trigger();
    }, [trigger]);

    const handleOnSelect = (value: boolean, index: number) => {
        if (isValidDate(virkningstidspunkt)) {
            const inntekteneSomLeggesTilGrunn = getValues("inntekteneSomLeggesTilGrunn");
            syncDates(value, inntekteneSomLeggesTilGrunn, index, setValue, virkningstidspunkt, setError, clearErrors);
        }
    };

    const validatePeriods = () => {
        if (isValidDate(virkningstidspunkt)) {
            const inntekteneSomLeggesTilGrunn = getValues("inntekteneSomLeggesTilGrunn");
            const dateGaps = findDateGaps(inntekteneSomLeggesTilGrunn, virkningstidspunkt);
            if (dateGaps?.length) {
                const message = `Mangler inntekter for ${dateGaps.length > 1 ? "perioder" : "periode"}: ${dateGaps.map(
                    (gap) => ` ${gap.fra} - ${gap.til}`
                )}`;
                setError("inntekteneSomLeggesTilGrunn", { type: "periodGaps", message });
            }

            if (!dateGaps?.length) {
                clearErrors("inntekteneSomLeggesTilGrunn");
            }
        }
    };

    const handleOnDelete = (index) => {
        inntekteneSomLeggesTilGrunnField.remove(index);
        if (!index) {
            inntekteneSomLeggesTilGrunnField.append({
                fraDato: null,
                tilDato: null,
                totalt: "",
                beskrivelse: "",
                tekniskNavn: "",
                selected: false,
                fraPostene: false,
            });
        }
    };

    const watchFieldArray = useWatch({ control, name: "inntekteneSomLeggesTilGrunn" });
    const controlledFields = inntekteneSomLeggesTilGrunnField.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    return (
        <>
            {errors?.inntekteneSomLeggesTilGrunn?.type === "periodGaps" && (
                <Alert variant="warning">{errors.inntekteneSomLeggesTilGrunn.message}</Alert>
            )}
            {!isValidDate(virkningstidspunkt) && <Alert variant="warning">Mangler virkningstidspunkt</Alert>}
            <TableWrapper heading={["Ta med", "Beskrivelse", "Beløp", "Fra og med", "Til og med", ""]}>
                {controlledFields.map((item, index) => (
                    <TableRowWrapper
                        key={item.id}
                        cells={[
                            <FormControlledCheckbox
                                key={`inntekteneSomLeggesTilGrunn.${index}.selected`}
                                name={`inntekteneSomLeggesTilGrunn.${index}.selected`}
                                onChange={(value) => handleOnSelect(value.target.checked, index)}
                                legend=""
                            />,
                            <Beskrivelse item={item} index={index} />,
                            <Totalt item={item} index={index} />,
                            <Periode
                                item={item}
                                index={index}
                                datepicker={
                                    <FormControlledDatePicker
                                        key={`inntekteneSomLeggesTilGrunn.${index}.fraDato`}
                                        name={`inntekteneSomLeggesTilGrunn.${index}.fraDato`}
                                        label="Fra og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item?.fraDato ?? null}
                                        onChange={validatePeriods}
                                        required
                                        hideLabel
                                    />
                                }
                            />,
                            <Periode
                                item={item}
                                index={index}
                                datepicker={
                                    <FormControlledDatePicker
                                        key={`inntekteneSomLeggesTilGrunn.${index}.tilDato`}
                                        name={`inntekteneSomLeggesTilGrunn.${index}.tilDato`}
                                        label="Til og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item?.tilDato ?? null}
                                        onChange={validatePeriods}
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
                onClick={useCallback(
                    () =>
                        inntekteneSomLeggesTilGrunnField.append({
                            fraDato: null,
                            tilDato: null,
                            totalt: "",
                            beskrivelse: "",
                            tekniskNavn: "",
                            selected: false,
                            fraPostene: false,
                        }),
                    []
                )}
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
            {fieldArray.fields.length > 0 && (
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
            )}
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
    const { saksnummer: behandlingId } = useForskudd();
    const [barnene, setBarnene] = useState([]);

    useEffect(() => {
        BEHANDLING_API.api.hentBehandling(Number(behandlingId)).then(({ data }) => {
            setBarnene(data.roller.filter((rolle) => rolle.rolleType === RolleType.BARN));
        });
    }, []);

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
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Barn", ""]}>
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
            )}
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
