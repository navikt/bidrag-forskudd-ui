import { BodyShort, Heading, Label, Loader } from "@navikt/ds-react";
import React, { Suspense, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { BehandlingDto } from "../../api/BidragBehandlingApi";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useApiData } from "../../hooks/useApiData";
import { ActionStatus } from "../../types/actionStatus";
import { VirkningstidspunktFormValues } from "../../types/virkningstidspunktFormValues";
import { FormControlledDatePicker } from "../formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { ActionButtons } from "./inntekt/ActionButtons";

const createInitialValues = (behandling) =>
    ({
        virkningstidspunkt: behandling.virkningstidspunkt ? new Date(behandling.virkningstidspunkt) : null,
        aarsak: behandling.aarsak ?? "",
        avslag: behandling.avslag ?? "",
        begrunnelseMedIVedtakNotat: behandling.begrunnelseMedIVedtakNotat ?? "",
        begrunnelseKunINotat: behandling.begrunnelseKunINotat ?? "",
    } as VirkningstidspunktFormValues);

export default () => {
    const { behandlingId } = useForskudd();
    const { api } = useApiData();
    const { refetch, isRefetching, data: data } = api.getBehandling(behandlingId);
    const mutation = api.updateBehandling(behandlingId);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <VirkningstidspunktForm
                behandling={data.data}
                refetch={refetch}
                isRefetching={isRefetching}
                mutation={mutation}
            />
        </Suspense>
    );
};

const VirkningstidspunktForm = ({
    behandling,
    refetch,
    isRefetching,
    mutation,
}: {
    behandling: BehandlingDto;
    refetch: () => Promise<QueryObserverResult>;
    isRefetching: boolean;
    mutation: UseMutationResult;
}) => {
    const { virkningstidspunktFormValues, setVirkningstidspunktFormValues, setActiveStep } = useForskudd();
    const initialValues = virkningstidspunktFormValues ?? createInitialValues(behandling);
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);
    const channel = new BroadcastChannel("virkningstidspunkt");

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const fieldsForNotat = useWatch({
        control: useFormMethods.control,
        name: ["virkningstidspunkt", "aarsak", "begrunnelseMedIVedtakNotat"],
    });

    useEffect(() => {
        if (!virkningstidspunktFormValues) setVirkningstidspunktFormValues(initialValues);

        return () => {
            setVirkningstidspunktFormValues(useFormMethods.getValues());
        };
    }, []);

    useEffect(() => {
        channel.postMessage(JSON.stringify(fieldsForNotat));
    }, [fieldsForNotat]);

    useEffect(() => {
        if (action === ActionStatus.REFETCHED) setAction(ActionStatus.IDLE);
    }, [action]);

    const onRefetch = async () => {
        const { data } = await refetch();
        const values = createInitialValues(data);
        setVirkningstidspunktFormValues(values);
        useFormMethods.reset(values);
        setAction(ActionStatus.REFETCHED);
    };

    const onSave = async () => {
        setAction(ActionStatus.SAVING);
        await save();
    };

    const save = async () => {
        const values = useFormMethods.getValues();
        setVirkningstidspunktFormValues(values);

        await mutation.mutateAsync({ ...behandling, ...values });
        setAction(ActionStatus.IDLE);
    };

    const onSubmit = async () => {
        setAction(ActionStatus.SUBMITTING);
        await save();
        setActiveStep(STEPS[ForskuddStepper.BOFORHOLD]);
    };

    return (
        <div>
            <Heading level="2" size="xlarge">
                Virkningstidspunkt
            </Heading>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSubmit)}>
                    <div className="grid gap-y-4 mt-4">
                        <FlexRow className="gap-x-12">
                            <div className="flex gap-x-2">
                                <Label size="small">Søknadstype</Label>
                                <BodyShort size="small">{behandling.soknadType}</BodyShort>
                            </div>
                            <div className="flex gap-x-2">
                                <Label size="small">Søknad fra</Label>
                                <BodyShort size="small">{behandling.soknadFraType}</BodyShort>
                            </div>
                            <div className="flex gap-x-2">
                                <Label size="small">Mottat dato</Label>
                                <BodyShort size="small">{behandling.mottatDato}</BodyShort>
                            </div>
                            <div className="flex gap-x-2">
                                <Label size="small">Søkt fra dato</Label>
                                <BodyShort size="small">{behandling.datoFom}</BodyShort>
                            </div>
                        </FlexRow>
                        <FlexRow className="gap-x-8">
                            <FormControlledDatePicker
                                name="virkningstidspunkt"
                                label="Virkningstidspunkt"
                                placeholder="DD.MM.ÅÅÅÅ"
                                defaultValue={initialValues.virkningstidspunkt}
                                resetDefaultValue={action === ActionStatus.REFETCHED}
                            />
                            <FormControlledSelectField
                                name="aarsak"
                                label="Årsak"
                                options={Object.entries(ForskuddBeregningKodeAarsak).map((entry) => ({
                                    value: entry[0],
                                    text: entry[1],
                                }))}
                            />
                            <FormControlledSelectField
                                name="avslag"
                                label="Avslag/opphør"
                                options={[
                                    {
                                        value: "",
                                        text: "",
                                    },
                                    {
                                        value: "avslag_1",
                                        text: "Avslag 1",
                                    },
                                    {
                                        value: "avslag_2",
                                        text: "Avslag 2",
                                    },
                                ]}
                            />
                        </FlexRow>
                        <FormControlledTextarea
                            name="begrunnelseMedIVedtakNotat"
                            label="Begrunnelse (med i vedtaket og notat)"
                        />
                        <FormControlledTextarea name="begrunnelseKunINotat" label="Begrunnelse (kun med i notat)" />
                        <ActionButtons
                            action={action}
                            onSave={onSave}
                            onRefetch={onRefetch}
                            isRefetching={isRefetching}
                        />
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
