import { BodyShort, Heading, Label, Loader } from "@navikt/ds-react";
import React, { Suspense, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { UseMutationResult } from "react-query";

import { BehandlingDto } from "../../api/BidragBehandlingApi";
import { SOKNAD_LABELS } from "../../constants/soknadFraLabels";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { Avslag } from "../../enum/Avslag";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useApiData } from "../../hooks/useApiData";
import { ActionStatus } from "../../types/actionStatus";
import { VirkningstidspunktFormValues } from "../../types/virkningstidspunktFormValues";
import { dateOrNull, isValidDate } from "../../utils/date-utils";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { aarsakToVirkningstidspunktMapper } from "./helpers/virkningstidspunktHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const createInitialValues = (behandling: BehandlingDto) =>
    ({
        virkningsDato: dateOrNull(behandling.virkningsDato),
        aarsak: behandling.aarsak ?? "",
        avslag: behandling.avslag ?? "",
        virkningsTidspunktBegrunnelseMedIVedtakNotat: behandling.virkningsTidspunktBegrunnelseMedIVedtakNotat ?? "",
        virkningsTidspunktBegrunnelseKunINotat: behandling.virkningsTidspunktBegrunnelseKunINotat ?? "",
    } as VirkningstidspunktFormValues);

export default () => {
    const { behandlingId } = useForskudd();
    const { api } = useApiData();
    const { data: behandling } = api.getBehandling(behandlingId);
    const mutation = api.updateBehandling(behandlingId);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <VirkningstidspunktForm behandling={behandling.data} mutation={mutation} />
        </Suspense>
    );
};

const VirkningstidspunktForm = ({
    behandling,
    mutation,
}: {
    behandling: BehandlingDto;
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
        name: ["virkningsDato", "aarsak", "begrunnelseMedIVedtakNotat"],
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

    const onAarsakSelect = (value: string) => {
        const date = aarsakToVirkningstidspunktMapper(value, behandling);
        if (isValidDate(date)) {
            useFormMethods.setValue("virkningsDato", date);
        }
    };

    const onNext = async () => {
        const values = useFormMethods.getValues();
        setVirkningstidspunktFormValues(values);
        setActiveStep(STEPS[ForskuddStepper.BOFORHOLD]);
    };

    const save = async () => {
        const values = useFormMethods.getValues();
        setVirkningstidspunktFormValues(values);

        await mutation
            .mutateAsync({
                virkningsTidspunktBegrunnelseMedIVedtakNotat: values.virkningsTidspunktBegrunnelseMedIVedtakNotat,
                virkningsTidspunktBegrunnelseKunINotat: values.virkningsTidspunktBegrunnelseKunINotat,
                aarsak: values.aarsak ? values.aarsak : null,
                avslag: values.avslag ? values.avslag : null,
                virkningsDato: values.virkningsDato.toLocaleDateString("no-NO", { dateStyle: "short" }),
            })
            .finally(() => setAction(ActionStatus.IDLE));
    };

    const onSubmit = async () => {
        setAction(ActionStatus.SUBMITTING);
        await save();
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
                                <BodyShort size="small">{SOKNAD_LABELS[behandling.soknadFraType]}</BodyShort>
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
                            <FormControlledSelectField
                                name="aarsak"
                                label="Årsak"
                                onSelect={onAarsakSelect}
                                options={[{ value: "", text: "Velg årsak" }].concat(
                                    Object.entries(ForskuddBeregningKodeAarsak).map((entry) => ({
                                        value: entry[0],
                                        text: entry[1],
                                    }))
                                )}
                            />
                            <FormControlledMonthPicker
                                name="virkningsDato"
                                label="Virkningstidspunkt"
                                placeholder="MM.ÅÅÅÅ"
                                defaultValue={initialValues.virkningsDato}
                            />
                            <FormControlledSelectField
                                name="avslag"
                                label="Avslag/opphør"
                                options={[{ value: "", text: "Velg avslag/opphør" }].concat(
                                    Object.entries(Avslag).map((entry) => ({
                                        value: entry[0],
                                        text: entry[1],
                                    }))
                                )}
                            />
                        </FlexRow>
                        <FormControlledTextarea
                            name="virkningsTidspunktBegrunnelseMedIVedtakNotat"
                            label="Begrunnelse (med i vedtaket og notat)"
                        />
                        <FormControlledTextarea name="virkningsTidspunktBegrunnelseKunINotat" label="Begrunnelse (kun med i notat)" />
                        <ActionButtons action={action} onNext={onNext} />
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
