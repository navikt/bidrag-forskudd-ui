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
import { dateOrNull } from "../../utils/date-utils";
import { FormControlledCheckbox } from "../formFields/FormControlledCheckbox";
import { FormControlledDatePicker } from "../formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { RolleTag } from "../RolleTag";
import { TableRowWrapper, TableWrapper } from "../table/TableWrapper";
import { ActionButtons } from "./inntekt/ActionButtons";
import { checkOverlappingPeriods } from "./inntekt/inntektFormHelpers";

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
    const { behandlingId } = useForskudd();
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

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <BoforholdsForm
                boforhold={boforhold}
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
    barnFraBehandling,
    refetch,
    isRefetching,
    mutation,
}: {
    boforhold: BoforholdData;
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
                        <BarnPerioder barnFraBehandling={barnFraBehandling} />
                    </div>
                    <div className="grid gap-y-4 w-max">
                        <Heading level="3" size="medium">
                            Sivilstand
                        </Heading>
                        <SivilistandPerioder />
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

const BarnPerioder = ({ barnFraBehandling }) => {
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
                    <Periode barnIndex={index} />
                </Fragment>
            ))}
        </>
    );
};

const Periode = ({ barnIndex }) => {
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
                                    <FormControlledDatePicker
                                        name={`barn.${barnIndex}.perioder.${index}.fraDato`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.fraDato}
                                        onChange={validatePeriods}
                                        hideLabel
                                    />
                                    <FormControlledDatePicker
                                        name={`barn.${barnIndex}.perioder.${index}.tilDato`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.tilDato}
                                        onChange={validatePeriods}
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
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    barnPerioder.append({
                        fraDato: null,
                        tilDato: null,
                        borMedForeldre: false,
                        registrertPaaAdresse: false,
                        kilde: "",
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};

const SivilistandPerioder = () => {
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
                                    <FormControlledDatePicker
                                        key={`sivilstand.${index}.fraDato`}
                                        name={`sivilstand.${index}.fraDato`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.fraDato}
                                        onChange={validatePeriods}
                                        hideLabel
                                    />
                                    <FormControlledDatePicker
                                        name={`sivilstand.${index}.tilDato`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.tilDato}
                                        onChange={validatePeriods}
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
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    sivilstandPerioder.append({
                        fraDato: null,
                        tilDato: null,
                        stand: "",
                    })
                }
            >
                + legg til periode
            </Button>
        </>
    );
};
