import { InformationSquareIcon, TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, Popover } from "@navikt/ds-react";
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { RolleType } from "../../../api/BidragBehandlingApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { InntektBeskrivelse } from "../../../enum/InntektBeskrivelse";
import { useGetBehandling, usePersonsQueries } from "../../../hooks/useApiData";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { getVirkningstidspunkt } from "../helpers/helpers";
import {
    checkOverlappingPeriods,
    findDateGaps,
    getOverlappingInntektPerioder,
    syncDates,
} from "../helpers/inntektFormHelpers";

const Beskrivelse = ({ item, index, ident }) =>
    item.fraPostene ? (
        <BodyShort className="min-w-[215px] capitalize">{item.beskrivelse}</BodyShort>
    ) : (
        <FormControlledSelectField
            key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.beskrivelse`}
            name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.beskrivelse`}
            label="Beskrivelse"
            options={[{ value: "", text: "Velg type inntekt" }].concat(
                Object.entries(InntektBeskrivelse).map((entry) => ({
                    value: entry[0],
                    text: entry[1],
                }))
            )}
            hideLabel
        />
    );

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
const Totalt = ({ item, index, ident }) =>
    item.fraPostene ? (
        <div className="flex items-center gap-x-4">
            <BodyShort className="min-w-[80px] flex justify-end">{item.totalt}</BodyShort>
            <Detaljer totalt={item.totalt} />
        </div>
    ) : (
        <div className="w-[120px]">
            <FormControlledTextField
                key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.totalt`}
                name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.totalt`}
                label="Totalt"
                type="number"
                min="1"
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
            icon={<TrashIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    );

const Periode = ({ item, index, ident, datepicker }) => {
    const { control } = useFormContext<InntektFormValues>();
    const value = useWatch({
        control,
        name: `inntekteneSomLeggesTilGrunn.${ident}.${index}.selected`,
    });

    return <div className={`${value || !item.fraPostene ? "" : "hidden"} min-w-[160px]`}>{datepicker}</div>;
};

export const InntekteneSomLeggesTilGrunnTabel = ({ ident }: { ident: string }) => {
    const { behandlingId, virkningstidspunktFormValues } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const {
        control,
        getValues,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const inntekteneSomLeggesTilGrunnField = useFieldArray({
        control,
        name: `inntekteneSomLeggesTilGrunn.${ident}`,
    });
    const virkningstidspunkt = getVirkningstidspunkt(virkningstidspunktFormValues, behandling);
    const watchFieldArray = useWatch({ control, name: `inntekteneSomLeggesTilGrunn.${ident}` });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const handleOnSelect = (value: boolean, index: number) => {
        if (isValidDate(virkningstidspunkt)) {
            const inntekteneSomLeggesTilGrunn = getValues(`inntekteneSomLeggesTilGrunn.${ident}`);
            if (inntekteneSomLeggesTilGrunn.length) {
                syncDates(
                    value,
                    inntekteneSomLeggesTilGrunn,
                    ident,
                    index,
                    setValue,
                    virkningstidspunkt,
                    setError,
                    clearErrors
                );
            }
        }
    };

    const validatePeriods = () => {
        if (isValidDate(virkningstidspunkt)) {
            const inntekteneSomLeggesTilGrunn = getValues(`inntekteneSomLeggesTilGrunn.${ident}`).filter(
                (inntekt) => inntekt.selected
            );

            if (!inntekteneSomLeggesTilGrunn.length) {
                clearErrors(`inntekteneSomLeggesTilGrunn.${ident}`);
                return;
            }
            const dateGaps = findDateGaps(inntekteneSomLeggesTilGrunn, virkningstidspunkt);
            const overlappingPerioder = getOverlappingInntektPerioder(inntekteneSomLeggesTilGrunn);
            let types = {};

            if (dateGaps?.length) {
                const message = `Mangler inntekter for ${dateGaps.length > 1 ? "perioder" : "periode"}: ${dateGaps.map(
                    (gap) => ` ${gap.fra} - ${gap.til}`
                )}`;
                types = { ...types, periodGaps: message };
            }

            if (overlappingPerioder?.length) {
                types = { ...types, overlappingPerioder: JSON.stringify(overlappingPerioder) };
            }
            if (Object.keys(types).length) {
                setError(`inntekteneSomLeggesTilGrunn.${ident}`, { ...errors.inntekteneSomLeggesTilGrunn, types });
            }
            if (!dateGaps?.length) {
                // @ts-ignore
                clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.types.periodGaps`);
            }
            if (!overlappingPerioder?.length) {
                // @ts-ignore
                clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.types.overlappingPerioder`);
            }
        }
    };

    const handleOnDelete = (index) => {
        clearErrors(`inntekteneSomLeggesTilGrunn.${ident}.${index}`);
        inntekteneSomLeggesTilGrunnField.remove(index);
    };

    const controlledFields = inntekteneSomLeggesTilGrunnField.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const addPeriode = () => {
        inntekteneSomLeggesTilGrunnField.append({
            aar: "",
            fraDato: null,
            tilDato: null,
            totalt: "",
            beskrivelse: "",
            tekniskNavn: "",
            selected: false,
            fraPostene: false,
        });
    };

    return (
        <>
            {errors?.inntekteneSomLeggesTilGrunn?.[ident]?.types && (
                <Alert variant="warning">
                    {errors.inntekteneSomLeggesTilGrunn[ident].types?.periodGaps && (
                        <BodyShort>{errors.inntekteneSomLeggesTilGrunn[ident].types.periodGaps}</BodyShort>
                    )}
                    {errors.inntekteneSomLeggesTilGrunn[ident].types?.overlappingPerioder && (
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
            {!isValidDate(virkningstidspunkt) && <Alert variant="warning">Mangler virkningstidspunkt</Alert>}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Ta med", "Beskrivelse", "Beløp", "Fra og med", "Til og med", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledCheckbox
                                    key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.selected`}
                                    name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.selected`}
                                    onChange={(value) => handleOnSelect(value.target.checked, index)}
                                    className="m-auto"
                                    legend=""
                                />,
                                <Beskrivelse item={item} index={index} ident={ident} />,
                                <Totalt item={item} index={index} ident={ident} />,
                                <Periode
                                    item={item}
                                    index={index}
                                    ident={ident}
                                    datepicker={
                                        <FormControlledMonthPicker
                                            key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.fraDato`}
                                            name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.fraDato`}
                                            label="Fra og med"
                                            placeholder="MM.ÅÅÅÅ"
                                            defaultValue={item.fraDato}
                                            required={item.selected}
                                            hideLabel
                                        />
                                    }
                                />,
                                <Periode
                                    item={item}
                                    index={index}
                                    ident={ident}
                                    datepicker={
                                        <FormControlledMonthPicker
                                            key={`inntekteneSomLeggesTilGrunn.${ident}.${index}.tilDato`}
                                            name={`inntekteneSomLeggesTilGrunn.${ident}.${index}.tilDato`}
                                            label="Til og med"
                                            placeholder="MM.ÅÅÅÅ"
                                            defaultValue={item.tilDato}
                                            hideLabel
                                        />
                                    }
                                />,
                                <DeleteButton item={item} index={index} handleOnDelete={handleOnDelete} />,
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                + legg til periode
            </Button>
        </>
    );
};

export const UtvidetBarnetrygdTabel = () => {
    const {
        control,
        getValues,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "utvidetBarnetrygd",
    });

    const watchFieldArray = useWatch({ control, name: "utvidetBarnetrygd" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const utvidetBarnetrygdList = getValues("utvidetBarnetrygd");

        if (!utvidetBarnetrygdList.length) {
            clearErrors("utvidetBarnetrygd");
            return;
        }
        const filtrertOgSorterListe = utvidetBarnetrygdList
            .filter((periode) => isValidDate(periode.fraDato))
            .sort((a, b) => a.fraDato.getTime() - b.fraDato.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("utvidetBarnetrygd", {
                ...errors.utvidetBarnetrygd,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("utvidetBarnetrygd.types.overlappingPerioder");
        }
    };

    return (
        <>
            {errors?.utvidetBarnetrygd?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.utvidetBarnetrygd.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Periode", "Delt bosted", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <div key={`utvidetBarnetrygd.${index}.fraDato`} className="flex gap-x-4">
                                    <FormControlledMonthPicker
                                        key={`utvidetBarnetrygd.${index}.fraDato`}
                                        name={`utvidetBarnetrygd.${index}.fraDato`}
                                        label="Fra og med"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.fraDato}
                                        required
                                        hideLabel
                                    />
                                    <FormControlledMonthPicker
                                        key={`utvidetBarnetrygd.${index}.tilDato`}
                                        name={`utvidetBarnetrygd.${index}.tilDato`}
                                        label="Til og med"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.fraDato}
                                        hideLabel
                                    />
                                </div>,
                                <FormControlledCheckbox
                                    key={`utvidetBarnetrygd.${index}.deltBosted`}
                                    name={`utvidetBarnetrygd.${index}.deltBosted`}
                                    className="m-auto"
                                    legend=""
                                />,
                                <FormControlledTextField
                                    key={`utvidetBarnetrygd.${index}.beloep`}
                                    name={`utvidetBarnetrygd.${index}.beloep`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        clearErrors(`utvidetBarnetrygd.${index}`);
                                        fieldArray.remove(index);
                                    }}
                                    icon={<TrashIcon aria-hidden />}
                                    variant="tertiary"
                                    size="small"
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
                        beloep: 0,
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};

export const BarnetilleggTabel = () => {
    const { behandlingId } = useForskudd();
    const { data: data } = useGetBehandling(behandlingId);
    const barna = data.data?.roller.filter((rolle) => rolle.rolleType === RolleType.BARN);
    const personsQueries = usePersonsQueries(barna);
    const personQueriesSuccess = personsQueries.every((query) => query.isSuccess);
    const barnMedNavn = personsQueries.map((data) => data.data);

    const {
        control,
        getValues,
        clearErrors,
        setError,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "barnetillegg",
    });

    const watchFieldArray = useWatch({ control, name: "barnetillegg" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const barnetilleggList = getValues("barnetillegg");

        if (!barnetilleggList.length) {
            clearErrors("barnetillegg");
            return;
        }
        const filtrertOgSorterListe = barnetilleggList
            .filter((periode) => isValidDate(periode.fraDato))
            .sort((a, b) => a.fraDato.getTime() - b.fraDato.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("barnetillegg", {
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

    return (
        <>
            {errors?.barnetillegg?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.barnetillegg.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Barn", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`barnetillegg.${index}.fraDato`}
                                    name={`barnetillegg.${index}.fraDato`}
                                    label="Fra og med"
                                    placeholder="MM.ÅÅÅÅ"
                                    defaultValue={item.fraDato}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`barnetillegg.${index}.tilDato`}
                                    name={`barnetillegg.${index}.tilDato`}
                                    label="Til og med"
                                    placeholder="MM.ÅÅÅÅ"
                                    defaultValue={item.tilDato}
                                    hideLabel
                                />,
                                <FormControlledSelectField
                                    key={`barnetillegg.${index}.barn`}
                                    name={`barnetillegg.${index}.barn`}
                                    label="Barn"
                                    hideLabel
                                >
                                    <option key={"Velg barn"} value={""}>
                                        Velg barn
                                    </option>
                                    {personQueriesSuccess &&
                                        barnMedNavn.map((barn) => (
                                            <option key={barn.navn} value={barn.ident}>
                                                {barn.navn}
                                            </option>
                                        ))}
                                </FormControlledSelectField>,
                                <FormControlledTextField
                                    key={`barnetillegg.${index}.beloep`}
                                    name={`barnetillegg.${index}.beloep`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        clearErrors(`barnetillegg.${index}`);
                                        fieldArray.remove(index);
                                    }}
                                    icon={<TrashIcon aria-hidden />}
                                    variant="tertiary"
                                    size="small"
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
                        beloep: 0,
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};
