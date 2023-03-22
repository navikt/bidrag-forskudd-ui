import { Heading, Label, Loader } from "@navikt/ds-react";
import React, { Suspense, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { useMockApi } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { BoforholdData } from "../../__mocks__/testdata/boforholdTestData";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { ActionStatus } from "../../types/actionStatus";
import { dateOrNull } from "../../utils/date-utils";
import { FormControlledCheckbox } from "../formFields/FormControlledCheckbox";
import { FormControlledDatePicker } from "../formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
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
                        tilDato: dateOrNull(periode.fraDato),
                    }))
                  : [],
          }))
        : [],
    sivilstand: {
        ...boforhold.sivilstand,
        fraDato: dateOrNull(boforhold.sivilstand.fraDato),
        tilDato: dateOrNull(boforhold.sivilstand.fraDato),
    },
});

export default () => {
    const { saksnummer } = useForskudd();
    const { api } = useMockApi();
    const { data: boforhold, refetch, isRefetching } = api.getBoforhold(saksnummer);
    const mutation = api.postBoforhold(saksnummer);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <BoforholdsForm boforhold={boforhold} refetch={refetch} isRefetching={isRefetching} mutation={mutation} />
        </Suspense>
    );
};

const BoforholdsForm = ({
    boforhold,
    refetch,
    isRefetching,
    mutation,
}: {
    boforhold: BoforholdData;
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
                    <div className="grid gap-y-4">
                        <Heading level="2" size="xlarge">
                            Boforhold
                        </Heading>
                        {initialValues.barn.map((barn) =>
                            barn.perioder.map((periode, index) => (
                                <FlexRow key={`${periode.fraDato}-${index}`}>
                                    <div>
                                        <FormControlledDatePicker
                                            name="fraDato"
                                            label="Periode"
                                            placeholder="DD.MM.ÅÅÅÅ"
                                            defaultValue={periode.fraDato}
                                            resetDefaultValue={action === ActionStatus.REFETCHED}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <FormControlledDatePicker
                                            name="tilDato"
                                            label="Periode"
                                            placeholder="DD.MM.ÅÅÅÅ"
                                            defaultValue={periode.tilDato}
                                            resetDefaultValue={action === ActionStatus.REFETCHED}
                                            hideLabel
                                        />
                                    </div>
                                    <div className="grid justify-items-center">
                                        <Label size="small">Bor ikke med foreldre</Label>
                                        <FormControlledCheckbox name="borMedForeldre" legend="" />
                                    </div>
                                    <div className="grid justify-items-center">
                                        <Label size="small">Registrert på adresse</Label>
                                        <FormControlledCheckbox name="registrertPaaAdresse" legend="" />
                                    </div>
                                    <div>
                                        <FormControlledSelectField
                                            name="kilde"
                                            label="Kilde"
                                            options={[
                                                { value: "", text: "" },
                                                { value: "offentlig", text: "Offentlig" },
                                                { value: "manuelt", text: "Manuelt" },
                                            ]}
                                        />
                                    </div>
                                </FlexRow>
                            ))
                        )}
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Sivilstand
                        </Heading>
                        <FlexRow>
                            <div>
                                <FormControlledDatePicker
                                    name="sivilstand.fraDato"
                                    label="Periode"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={initialValues.sivilstand.fraDato}
                                    resetDefaultValue={action === ActionStatus.REFETCHED}
                                />
                            </div>
                            <div className="flex items-end">
                                <FormControlledDatePicker
                                    name="sivilstand.tilDato"
                                    label="Periode"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    className="mt-5"
                                    defaultValue={initialValues.sivilstand.tilDato}
                                    resetDefaultValue={action === ActionStatus.REFETCHED}
                                    hideLabel
                                />
                            </div>
                            <div>
                                <FormControlledSelectField
                                    name="sivilstand.stand"
                                    label="Sivilstand"
                                    className="w-52"
                                    options={[
                                        { value: "", text: "" },
                                        { value: "ugift", text: "Ugift" },
                                        { value: "gift", text: "Gift" },
                                    ]}
                                />
                            </div>
                        </FlexRow>
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
