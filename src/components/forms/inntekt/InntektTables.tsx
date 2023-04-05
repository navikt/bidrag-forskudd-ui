import { InformationSquareIcon, TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, Loader, Popover } from "@navikt/ds-react";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { RolleDto, RolleType } from "../../../api/BidragBehandlingApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { InntektBeskrivelse } from "../../../enum/InntektBeskrivelse";
import { useGetBehandling } from "../../../hooks/useApiData";
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

const Beskrivelse = ({ item, index }) =>
    item.fraPostene ? (
        <BodyShort className="min-w-[215px] capitalize">{item.beskrivelse}</BodyShort>
    ) : (
        <FormControlledSelectField
            key={`inntekteneSomLeggesTilGrunn.${index}.beskrivelse`}
            name={`inntekteneSomLeggesTilGrunn.${index}.beskrivelse`}
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
        name: "inntekteneSomLeggesTilGrunn",
    });
    const virkningstidspunkt = getVirkningstidspunkt(virkningstidspunktFormValues, behandling);
    const watchFieldArray = useWatch({ control, name: "inntekteneSomLeggesTilGrunn" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const handleOnSelect = (value: boolean, index: number) => {
        if (isValidDate(virkningstidspunkt)) {
            const inntekteneSomLeggesTilGrunn = getValues("inntekteneSomLeggesTilGrunn");
            if (inntekteneSomLeggesTilGrunn.length) {
                syncDates(
                    value,
                    inntekteneSomLeggesTilGrunn,
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
            const inntekteneSomLeggesTilGrunn = getValues("inntekteneSomLeggesTilGrunn").filter(
                (inntekt) => inntekt.selected
            );

            if (!inntekteneSomLeggesTilGrunn.length) {
                clearErrors("inntekteneSomLeggesTilGrunn");
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
                setError("inntekteneSomLeggesTilGrunn", { ...errors.inntekteneSomLeggesTilGrunn, types });
            }
            if (!dateGaps?.length) {
                // @ts-ignore
                clearErrors("inntekteneSomLeggesTilGrunn.types.periodGaps");
            }
            if (!overlappingPerioder?.length) {
                // @ts-ignore
                clearErrors("inntekteneSomLeggesTilGrunn.types.overlappingPerioder");
            }
        }
    };

    const handleOnDelete = (index) => {
        clearErrors(`inntekteneSomLeggesTilGrunn.${index}`);
        inntekteneSomLeggesTilGrunnField.remove(index);
    };

    const controlledFields = inntekteneSomLeggesTilGrunnField.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    return (
        <>
            {errors?.inntekteneSomLeggesTilGrunn?.types && (
                <Alert variant="warning">
                    {errors.inntekteneSomLeggesTilGrunn.types?.periodGaps && (
                        <BodyShort>{errors.inntekteneSomLeggesTilGrunn.types.periodGaps}</BodyShort>
                    )}
                    {errors.inntekteneSomLeggesTilGrunn.types?.overlappingPerioder && (
                        <>
                            <BodyShort>Du har overlappende perioder:</BodyShort>
                            {JSON.parse(errors.inntekteneSomLeggesTilGrunn.types.overlappingPerioder as string).map(
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
                                    <FormControlledMonthPicker
                                        key={`inntekteneSomLeggesTilGrunn.${index}.fraDato`}
                                        name={`inntekteneSomLeggesTilGrunn.${index}.fraDato`}
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
                                datepicker={
                                    <FormControlledMonthPicker
                                        key={`inntekteneSomLeggesTilGrunn.${index}.tilDato`}
                                        name={`inntekteneSomLeggesTilGrunn.${index}.tilDato`}
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
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={useCallback(
                    () =>
                        inntekteneSomLeggesTilGrunnField.append({
                            aar: "",
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

    const getBarn = (roller: RolleDto[]) => roller.filter((rolle) => rolle.rolleType === RolleType.BARN);

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
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
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
                                    options={[{ value: "", text: "Velg barn" }].concat(
                                        getBarn(data.data.roller).map((barn) => ({
                                            value: barn.ident,
                                            text: barn.navn,
                                        }))
                                    )}
                                    hideLabel
                                />,
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
                        beloep: 0,
                    })
                }
            >
                + legg til periode
            </Button>
        </Suspense>
    );
};
