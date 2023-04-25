import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, Label, Loader, Panel, Radio, RadioGroup, Search } from "@navikt/ds-react";
import React, { Fragment, Suspense, useEffect } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { useGetBoforhold } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { RolleType } from "../../api/BidragBehandlingApi";
import { PERSON_API } from "../../constants/api";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandling, useUpdateBehandling } from "../../hooks/useApiData";
import { useDebounce } from "../../hooks/useDebounce";
import { BoforholdFormValues } from "../../types/boforholdFormValues";
import { dateOrNull, isValidDate } from "../../utils/date-utils";
import { FormControlledCheckbox } from "../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { FormLayout } from "../layout/grid/FormLayout";
import { PersonNavn } from "../PersonNavn";
import { TableRowWrapper, TableWrapper } from "../table/TableWrapper";
import { calculateFraDato } from "./helpers/boforholdFormHelpers";
import { getVirkningstidspunkt } from "./helpers/helpers";
import { checkOverlappingPeriods } from "./helpers/inntektFormHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const createInitialValues = (boforhold, virkningstidspunkt) => ({
    ...boforhold,
    barn: boforhold.barn.length
        ? boforhold.barn.map((barn) => ({
              ...barn,
              perioder: barn.perioder.length
                  ? barn.perioder.map((periode) => ({
                        ...periode,
                        fraDato: dateOrNull(periode.fraDato),
                        tilDato: dateOrNull(periode.tilDato),
                    }))
                  : [
                        {
                            selected: false,
                            fraDato: virkningstidspunkt,
                            tilDato: null,
                            borMedForeldre: false,
                            registrertPaaAdresse: false,
                            kilde: "",
                        },
                    ],
          }))
        : [],
    sivilstand: boforhold.sivilstand.length
        ? boforhold.sivilstand.map((stand) => ({
              ...stand,
              fraDato: dateOrNull(stand.fraDato),
              tilDato: dateOrNull(stand.tilDato),
          }))
        : [],
});

const Main = () => {
    const { behandlingId, virkningstidspunktFormValues } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const virkningstidspunkt = getVirkningstidspunkt(virkningstidspunktFormValues, behandling);
    const barnFraBehandling = behandling.data?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);

    return (
        <>
            {!isValidDate(virkningstidspunkt) && <Alert variant="warning">Mangler virkningstidspunkt</Alert>}
            <Heading level="3" size="medium">
                Barn
            </Heading>
            <BarnPerioder barnFraBehandling={barnFraBehandling} virkningstidspunkt={virkningstidspunkt} />
            <Heading level="3" size="medium">
                Sivilstand
            </Heading>
            <SivilistandPerioder virkningstidspunkt={virkningstidspunkt} />
        </>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.INNTEKT]);

    return (
        <>
            <Heading level="3" size="medium">
                Begrunnelse
            </Heading>
            <FormControlledTextarea
                name="boforholdBegrunnelseMedIVedtakNotat"
                label="Begrunnelse (med i vedtaket og notat)"
            />
            <FormControlledTextarea name="boforholdBegrunnelseKunINotat" label="Begrunnelse (kun med i notat)" />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const BoforholdsForm = () => {
    const { behandlingId, virkningstidspunktFormValues, boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const barn = behandling.data?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    const { data: boforhold } = useGetBoforhold(
        behandlingId.toString(),
        barn.map((rolle) => rolle.ident),
        !!barn
    );

    const updateBehandling = useUpdateBehandling(behandlingId);
    const virkningstidspunkt = getVirkningstidspunkt(virkningstidspunktFormValues, behandling);
    const initialValues = boforholdFormValues ?? createInitialValues(boforhold, virkningstidspunkt);

    initialValues.boforholdBegrunnelseKunINotat = behandling.data.boforholdBegrunnelseKunINotat;
    initialValues.boforholdBegrunnelseMedIVedtakNotat = behandling.data.boforholdBegrunnelseMedIVedtakNotat;

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const watchAllFields = useWatch({ control: useFormMethods.control });

    useEffect(() => {
        if (!boforholdFormValues) setBoforholdFormValues(initialValues);

        return () => setBoforholdFormValues(useFormMethods.getValues());
    }, []);

    const onSave = () => {
        const values = useFormMethods.getValues();
        setBoforholdFormValues(values);
        updateBehandling.mutation.mutate(
            {
                boforholdBegrunnelseMedIVedtakNotat: values.boforholdBegrunnelseMedIVedtakNotat,
                boforholdBegrunnelseKunINotat: values.boforholdBegrunnelseKunINotat,
            },
            { onSuccess: () => useFormMethods.reset(undefined, { keepValues: true, keepErrors: true }) }
        );
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (useFormMethods.formState.isDirty) {
            debouncedOnSave();
        }
    }, [watchAllFields, useFormMethods.formState.isDirty]);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout title="Boforhold" main={<Main />} side={<Side />} />
                </form>
            </FormProvider>
        </>
    );
};

const BarnPerioder = ({ barnFraBehandling, virkningstidspunkt }) => {
    const { control, setValue } = useFormContext<BoforholdFormValues>();
    const barnFieldArray = useFieldArray({
        control,
        name: "barn",
    });
    const watchFieldArray = useWatch({ control, name: "barn" });
    const controlledFields = barnFieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const addBarn = () => {
        barnFieldArray.append({
            ident: null,
            medISaken: false,
            navn: null,
            perioder: [
                {
                    selected: false,
                    fraDato: virkningstidspunkt,
                    tilDato: null,
                    borMedForeldre: false,
                    registrertPaaAdresse: false,
                    kilde: "",
                },
            ],
        });
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Panel border className="p-0">
                        {item.medISaken && (
                            <FlexRow className="items-center p-3">
                                <BodyShort size="small">
                                    <PersonNavn
                                        ident={barnFraBehandling.find((b) => b.ident === item.ident).ident}
                                    ></PersonNavn>
                                </BodyShort>
                                <BodyShort size="small">{item.ident}</BodyShort>
                            </FlexRow>
                        )}
                        {!item.medISaken && (
                            <>
                                <FlexRow className="items-center p-3">
                                    <div>Barn</div>
                                    <div className="ml-auto self-end">
                                        <Button
                                            type="button"
                                            onClick={() => barnFieldArray.remove(index)}
                                            icon={<TrashIcon aria-hidden />}
                                            variant="tertiary"
                                            size="small"
                                        >
                                            Slett barn
                                        </Button>
                                    </div>
                                </FlexRow>
                                <FlexRow className="items-center p-3">
                                    <RadioGroup legend="">
                                        <Radio value="10">Fødselsnummer/d-nummer</Radio>
                                        <Radio value="10">Fritekst</Radio>
                                    </RadioGroup>
                                    <div>
                                        <div>
                                            <Search
                                                className="w-fit"
                                                label="Fødselsnummer/ d-nummer"
                                                variant="secondary"
                                                size="small"
                                                hideLabel={false}
                                                onClear={() => {
                                                    // TODO nulstil alt for barnet
                                                    setValue(`barn.${index}.ident`, null);
                                                    setValue(`barn.${index}.navn`, null);
                                                }}
                                                onSearchClick={(value) => {
                                                    PERSON_API.informasjon
                                                        .hentPersonPost({ ident: value })
                                                        .then(({ data }) => {
                                                            setValue(`barn.${index}.ident`, value);
                                                            setValue(`barn.${index}.navn`, data.navn);
                                                        })
                                                        .catch((r) => {
                                                            // TODO -> LEGG TIL BARNET MANUELT
                                                        });
                                                }}
                                            />
                                            <div className="w-fit navds-form-field">
                                                <Label size="small">Navn</Label>
                                                <BodyShort size="medium">{controlledFields[index].navn}</BodyShort>
                                            </div>
                                        </div>
                                        <div>fdato</div>
                                    </div>
                                </FlexRow>
                            </>
                        )}
                        <Periode barnIndex={index} virkningstidspunkt={virkningstidspunkt} />
                    </Panel>
                </Fragment>
            ))}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addBarn}>
                + legg til barn
            </Button>
        </>
    );
};

const Periode = ({ barnIndex, virkningstidspunkt }) => {
    const {
        control,
        getValues,
        clearErrors,
        setError,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const barnPerioder = useFieldArray({
        control,
        name: `barn.${barnIndex}.perioder`,
    });

    const watchFieldArray = useWatch({ control, name: `barn.${barnIndex}.perioder` });
    const controlledFields = barnPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const validateFomOgTom = (date, index, field) => {
        const perioderValues = getValues(`barn.${barnIndex}.perioder`);
        const fomOgTomInvalid =
            field === "fraDato"
                ? perioderValues[index].tilDato && date > perioderValues[index].tilDato
                : perioderValues[index].fraDato && date < perioderValues[index].fraDato;

        if (fomOgTomInvalid) {
            setError(`barn.${barnIndex}.perioder.${index}.fraDato`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`barn.${barnIndex}.perioder.${index}.fraDato`);
        }
    };

    const validatePeriods = () => {
        const perioder = getValues(`barn.${barnIndex}.perioder`);

        if (!perioder.length) {
            clearErrors(`barn.${barnIndex}.perioder`);
            return;
        }
        const filtrertOgSorterListe = perioder
            .filter((periode) => periode.fraDato !== null)
            .sort((a, b) => a.fraDato.getTime() - b.fraDato.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError(`barn.${barnIndex}.perioder`, {
                type: "overlappingPerioder",
                message: "Du har overlappende perioder",
            });
        }

        if (!overlappingPerioder?.length) {
            clearErrors(`barn.${barnIndex}.perioder`);
        }
    };

    const addPeriode = () => {
        const perioderValues = getValues(`barn.${barnIndex}.perioder`);
        barnPerioder.append({
            selected: false,
            fraDato: calculateFraDato(perioderValues, virkningstidspunkt),
            tilDato: null,
            borMedForeldre: false,
            registrertPaaAdresse: false,
            kilde: "",
        });
    };

    return (
        <>
            {errors?.barn && errors.barn[barnIndex]?.perioder.type === "overlappingPerioder" && (
                <Alert variant="warning">
                    <BodyShort>{errors.barn[barnIndex].perioder.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Ta med", "Fra og med", "Til og med", "Registrert på adresse", "Kilde", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledCheckbox
                                    key={`barn.${barnIndex}.perioder.${index}.selected`}
                                    name={`barn.${barnIndex}.perioder.${index}.selected`}
                                    className="m-auto"
                                    legend=""
                                />,
                                <FormControlledMonthPicker
                                    key={`barn.${barnIndex}.perioder.${index}.fraDato`}
                                    name={`barn.${barnIndex}.perioder.${index}.fraDato`}
                                    label="Fra og med"
                                    placeholder="MM.ÅÅÅÅ"
                                    defaultValue={item.fraDato}
                                    onChange={(date) => {
                                        validatePeriods();
                                        validateFomOgTom(date, index, "fraDato");
                                    }}
                                    toDate={new Date()}
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`barn.${barnIndex}.perioder.${index}.tilDato`}
                                    name={`barn.${barnIndex}.perioder.${index}.tilDato`}
                                    label="Til og med"
                                    placeholder="MM.ÅÅÅÅ"
                                    defaultValue={item.tilDato}
                                    onChange={(date) => {
                                        validatePeriods();
                                        validateFomOgTom(date, index, "tilDato");
                                    }}
                                    lastDayOfMonthPicker
                                    hideLabel
                                />,
                                <FormControlledCheckbox
                                    key={`barn.${barnIndex}.perioder.${index}.registrertPaaAdresse`}
                                    name={`barn.${barnIndex}.perioder.${index}.registrertPaaAdresse`}
                                    className="m-auto"
                                    legend=""
                                />,
                                <FormControlledSelectField
                                    key={`barn.${barnIndex}.perioder.${index}.kilde`}
                                    name={`barn.${barnIndex}.perioder.${index}.kilde`}
                                    className="w-fit"
                                    label="Kilde"
                                    options={[
                                        { value: "", text: "Velg kilde" },
                                        { value: "offentlig", text: "Offentlig" },
                                        { value: "manuelt", text: "Manuelt" },
                                    ]}
                                    hideLabel
                                />,
                                index ? (
                                    <Button
                                        key={`delete-button-${barnIndex}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            barnPerioder.remove(index);
                                            validatePeriods();
                                        }}
                                        icon={<TrashIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <div className="min-w-[40px]"></div>
                                ),
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <div className="p-3">
                <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                    + legg til periode
                </Button>
            </div>
        </>
    );
};

const SivilistandPerioder = ({ virkningstidspunkt }) => {
    const {
        control,
        getValues,
        clearErrors,
        setError,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const sivilstandPerioder = useFieldArray({
        control,
        name: `sivilstand`,
    });

    const watchFieldArray = useWatch({ control, name: `sivilstand` });
    const controlledFields = sivilstandPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const validateFomOgTom = (date, index, field) => {
        const sivilstandPerioder = getValues("sivilstand");
        const fomOgTomInvalid =
            field === "fraDato"
                ? sivilstandPerioder[index].tilDato && date > sivilstandPerioder[index].tilDato
                : sivilstandPerioder[index].fraDato && date < sivilstandPerioder[index].fraDato;

        if (fomOgTomInvalid) {
            setError(`sivilstand.${index}.fraDato`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`sivilstand.${index}.fraDato`);
        }
    };

    const validatePeriods = () => {
        const sivilstandPerioder = getValues("sivilstand");

        if (!sivilstandPerioder.length) {
            clearErrors("sivilstand");
            return;
        }
        const filtrertOgSorterListe = sivilstandPerioder
            .filter((periode) => periode.fraDato !== null)
            .sort((a, b) => a.fraDato.getTime() - b.fraDato.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("sivilstand", {
                type: "overlappingPerioder",
                message: "Du har overlappende perioder",
            });
        }

        if (!overlappingPerioder?.length) {
            clearErrors("sivilstand");
        }
    };

    const addPeriode = () => {
        const sivilstandPerioderValues = getValues("sivilstand");
        sivilstandPerioder.append({
            fraDato: calculateFraDato(sivilstandPerioderValues, virkningstidspunkt),
            tilDato: null,
            stand: "",
        });
    };

    return (
        <>
            {errors?.sivilstand?.type === "overlappingPerioder" && (
                <Alert variant="warning">
                    <BodyShort>{errors.sivilstand.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Periode", "Sivilstand", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <div className="flex gap-x-4">
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.fraDato`}
                                        name={`sivilstand.${index}.fraDato`}
                                        label="Periode"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.fraDato}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "fraDato");
                                        }}
                                        toDate={new Date()}
                                        hideLabel
                                    />
                                    <FormControlledMonthPicker
                                        name={`sivilstand.${index}.tilDato`}
                                        label="Periode"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.tilDato}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "tilDato");
                                        }}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                </div>,
                                <FormControlledSelectField
                                    name={`sivilstand.${index}.stand`}
                                    label="Sivilstand"
                                    className="w-52"
                                    options={[
                                        { value: "", text: "Velg sivilstand" },
                                        { value: "ugift", text: "Ugift" },
                                        { value: "gift", text: "Gift" },
                                        { value: "skilt", text: "Skilt" },
                                    ]}
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        sivilstandPerioder.remove(index);
                                        validatePeriods();
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
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                + legg til periode
            </Button>
        </>
    );
};

export default () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <BoforholdsForm />
        </Suspense>
    );
};
