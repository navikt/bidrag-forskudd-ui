import { Delete } from "@navikt/ds-icons";
import { Alert, BodyShort, Button, Heading, Loader } from "@navikt/ds-react";
import React, { Fragment, Suspense, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { useMockApi } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { BoforholdData } from "../../__mocks__/testdata/boforholdTestData";
import { RolleDto, RolleType } from "../../api/BidragBehandlingApi";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useApiData } from "../../hooks/useApiData";
import { ActionStatus } from "../../types/actionStatus";
import { BoforholdFormValues } from "../../types/boforholdFormValues";
import { dateOrNull, isValidDate } from "../../utils/date-utils";
import { FormControlledCheckbox } from "../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { RolleTag } from "../RolleTag";
import { TableRowWrapper, TableWrapper } from "../table/TableWrapper";
import { calculateFraDato } from "./helpers/boforholdFormHelpers";
import { getVirkningstidspunkt } from "./helpers/helpers";
import { checkOverlappingPeriods } from "./helpers/inntektFormHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const createInitialValues = (boforhold) => ({
    ...boforhold,
    barn: boforhold.barn.length
        ? boforhold.barn.map((barn) => ({
              ...barn,
              perioder: barn.perioder
                  ? barn.perioder.map((periode) => ({
                        ...periode,
                        fraDato: dateOrNull(periode.fraDato),
                        tilDato: dateOrNull(periode.tilDato),
                    }))
                  : [],
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

export default () => {
    const { behandlingId, virkningstidspunktFormValues } = useForskudd();
    const { api } = useApiData();
    const { data: behandling } = api.getBehandling(behandlingId);
    const barn = behandling.data?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    const { api: mockApi } = useMockApi();
    const {
        data: boforhold,
        refetch,
        isRefetching,
    } = mockApi.getBoforhold(
        behandlingId.toString(),
        barn.map((rolle) => rolle.ident),
        !!barn
    );
    const mutation = mockApi.postBoforhold(behandlingId.toString());
    const virkningstidspunkt = getVirkningstidspunkt(virkningstidspunktFormValues, behandling);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <BoforholdsForm
                boforhold={boforhold}
                virkningstidspunkt={virkningstidspunkt}
                barnFraBehandling={barn}
                refetch={refetch}
                isRefetching={isRefetching}
                mutation={mutation}
            />
        </Suspense>
    );
};

const BoforholdsForm = ({
    boforhold,
    virkningstidspunkt,
    barnFraBehandling,
    refetch,
    isRefetching,
    mutation,
}: {
    boforhold: BoforholdData;
    virkningstidspunkt: Date;
    barnFraBehandling: RolleDto[];
    refetch: () => Promise<QueryObserverResult>;
    isRefetching: boolean;
    mutation: UseMutationResult;
}) => {
    const { boforholdFormValues, setBoforholdFormValues, setActiveStep } = useForskudd();
    const initialValues = boforholdFormValues ?? createInitialValues(boforhold);
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (!boforholdFormValues) setBoforholdFormValues(initialValues);

        return () => setBoforholdFormValues(useFormMethods.getValues());
    }, []);

    useEffect(() => {
        if (action === ActionStatus.REFETCHED) setAction(ActionStatus.IDLE);
    }, [action]);

    const onRefetch = async () => {
        const { data } = await refetch();
        const values = createInitialValues(data);
        useFormMethods.reset(values);
        setBoforholdFormValues(values);
        setAction(ActionStatus.REFETCHED);
    };

    const onSave = async () => {
        setAction(ActionStatus.SAVING);
        await save();
    };

    const save = async () => {
        const values = useFormMethods.getValues();
        setBoforholdFormValues(values);
        await mutation.mutateAsync(values);
        setAction(ActionStatus.IDLE);
    };

    const onSubmit = async () => {
        setAction(ActionStatus.SUBMITTING);
        await save();
        setActiveStep(STEPS[ForskuddStepper.INNTEKT]);
    };

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSubmit)}>
                <div className="grid gap-y-8">
                    <div className="grid gap-y-4 w-max">
                        <Heading level="2" size="xlarge">
                            Boforhold
                        </Heading>
                        {!isValidDate(virkningstidspunkt) && (
                            <Alert variant="warning">Mangler virkningstidspunkt</Alert>
                        )}
                        <BarnPerioder barnFraBehandling={barnFraBehandling} virkningstidspunkt={virkningstidspunkt} />
                    </div>
                    <div className="grid gap-y-4 w-max">
                        <Heading level="3" size="medium">
                            Sivilstand
                        </Heading>
                        <SivilistandPerioder virkningstidspunkt={virkningstidspunkt} />
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Begrunnelse
                        </Heading>
                        <FormControlledTextarea
                            name="begrunnelseIVedtaket"
                            label="Begrunnelse (med i vedtaket og notat)"
                        />
                        <FormControlledTextarea name="begrunnelseINotat" label="Begrunnelse (kun med i notat)" />
                    </div>
                    <ActionButtons action={action} onSave={onSave} onRefetch={onRefetch} isRefetching={isRefetching} />
                </div>
            </form>
        </FormProvider>
    );
};

const BarnPerioder = ({ barnFraBehandling, virkningstidspunkt }) => {
    const { control } = useFormContext<BoforholdFormValues>();
    const inntekteneSomLeggesTilGrunnField = useFieldArray({
        control,
        name: "barn",
    });
    const watchFieldArray = useWatch({ control, name: "barn" });
    const controlledFields = inntekteneSomLeggesTilGrunnField.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <FlexRow className="items-center">
                        <RolleTag rolleType={RolleType.BARN} />
                        <BodyShort size="small">{barnFraBehandling.find((b) => b.ident === item.ident).navn}</BodyShort>
                        <BodyShort size="small">{item.ident}</BodyShort>
                    </FlexRow>
                    <Periode barnIndex={index} virkningstidspunkt={virkningstidspunkt} />
                </Fragment>
            ))}
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
            return;
        }

        if (field === "tilDato") {
            if (perioderValues[index].fraDato && date < perioderValues[index].fraDato) {
                setError(`barn.${barnIndex}.perioder.${index}.fraDato`, {
                    type: "datesNotValid",
                    message: "Fom dato kan ikke være før tom dato",
                });
            }
            return;
        }
        clearErrors(`barn.${barnIndex}.perioder.${index}.fraDato`);
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
                <TableWrapper heading={["Periode", "Bor ikke med foreldre", "Registrert på adresse", "Kilde", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <div key={`barn.${barnIndex}.perioder.${index}.fraDato`} className="flex gap-x-4">
                                    <FormControlledMonthPicker
                                        name={`barn.${barnIndex}.perioder.${index}.fraDato`}
                                        label="Periode"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.fraDato}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "tilDato");
                                        }}
                                        toDate={new Date()}
                                        hideLabel
                                    />
                                    <FormControlledMonthPicker
                                        name={`barn.${barnIndex}.perioder.${index}.tilDato`}
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
                                <FormControlledCheckbox
                                    key={`barn.${barnIndex}.perioder.${index}.borMedForeldre`}
                                    name={`barn.${barnIndex}.perioder.${index}.borMedForeldre`}
                                    legend=""
                                />,
                                <FormControlledCheckbox
                                    key={`barn.${barnIndex}.perioder.${index}.registrertPaaAdresse`}
                                    name={`barn.${barnIndex}.perioder.${index}.registrertPaaAdresse`}
                                    legend=""
                                />,
                                <FormControlledSelectField
                                    key={`barn.${barnIndex}.perioder.${index}.kilde`}
                                    name={`barn.${barnIndex}.perioder.${index}.kilde`}
                                    label="Kilde"
                                    options={[
                                        { value: "", text: "Velg kilde" },
                                        { value: "offentlig", text: "Offentlig" },
                                        { value: "manuelt", text: "Manuelt" },
                                    ]}
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${barnIndex}-${index}`}
                                    type="button"
                                    onClick={() => {
                                        barnPerioder.remove(index);
                                        validatePeriods();
                                    }}
                                    icon={<Delete aria-hidden />}
                                    variant="tertiary"
                                    size="xsmall"
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
            return;
        }

        if (field === "tilDato") {
            if (sivilstandPerioder[index].fraDato && date < sivilstandPerioder[index].fraDato) {
                setError(`sivilstand.${index}.fraDato`, {
                    type: "datesNotValid",
                    message: "Fom dato kan ikke være før tom dato",
                });
            }
            return;
        }
        clearErrors(`sivilstand.${index}.fraDato`);
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
                                    icon={<Delete aria-hidden />}
                                    variant="tertiary"
                                    size="xsmall"
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
