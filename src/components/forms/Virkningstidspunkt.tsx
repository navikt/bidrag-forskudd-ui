import { ExternalLink } from "@navikt/ds-icons";
import { BodyShort, Button, Heading, Label, Link, Loader, Select, Textarea } from "@navikt/ds-react";
import React, { Suspense, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { useMockApi } from "../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { BehandlingData } from "../../__mocks__/testdata/behandlingTestData";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { ActionStatus } from "../../types/actionStatus";
import { VirkningstidspunktFormValues } from "../../types/virkningstidspunktFormValues";
import { DatePickerInput } from "../date-picker/DatePickerInput";
import { FlexRow } from "../layout/grid/FlexRow";

const createInitialValues = (behandling) =>
    ({
        virkningstidspunkt: behandling.virkningstidspunkt ? new Date(behandling.virkningstidspunkt) : undefined,
        aarsak: behandling.aarsak ?? "",
        avslag: behandling.avslag ?? "",
        begrunnelseMedIVedtakNotat: behandling.begrunnelseMedIVedtakNotat ?? "",
        begrunnelseKunINotat: behandling.begrunnelseKunINotat ?? "",
    } as VirkningstidspunktFormValues);

export default () => {
    const { saksnummer } = useForskudd();
    const { api } = useMockApi();
    const { data: behandling, refetch, isRefetching } = api.getBehandlingData(saksnummer);
    const mutation = api.postBehandlingData(saksnummer);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <VirkningstidspunktForm
                behandling={behandling}
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
    behandling: BehandlingData;
    refetch: () => Promise<QueryObserverResult>;
    isRefetching: boolean;
    mutation: UseMutationResult;
}) => {
    const { virkningstidspunktFormValues, setVirkningstidspunktFormValues, setActiveStep, saksnummer } = useForskudd();
    const initialValues = virkningstidspunktFormValues ?? createInitialValues(behandling);
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);
    const channel = new BroadcastChannel("virkningstidspunkt");

    const {
        handleSubmit,
        control,
        reset,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: initialValues,
    });

    const fieldsForNotat = useWatch({
        control,
        name: ["virkningstidspunkt", "aarsak", "begrunnelseMedIVedtakNotat"],
    });

    useEffect(() => {
        channel.postMessage(JSON.stringify(fieldsForNotat));
    }, [fieldsForNotat]);

    useEffect(() => {
        if (!virkningstidspunktFormValues) setVirkningstidspunktFormValues(initialValues);

        return () => {
            setVirkningstidspunktFormValues(getValues());
        };
    }, []);

    const onRefetch = async () => {
        const { data } = await refetch();
        const values = createInitialValues(data);
        setVirkningstidspunktFormValues(values);
        reset(values);
    };

    const onSave = async () => {
        setAction(ActionStatus.SAVING);
        await save();
    };

    const save = async () => {
        const values = getValues();
        setVirkningstidspunktFormValues(values);
        await mutation.mutateAsync({ ...behandling, ...values });
        setAction(ActionStatus.IDLE);
    };

    const onSubmit = async () => {
        setAction(ActionStatus.SUBMITTING);
        await save();
        setActiveStep(STEPS[ForskuddStepper.INNTEKT]);
    };

    return (
        <div>
            <Heading level="2" size="xlarge">
                Virkningstidspunkt
            </Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-y-4 mt-4">
                    <FlexRow className="gap-x-12">
                        <div className="flex gap-x-2">
                            <Label size="small">Søknadstype</Label>
                            <BodyShort size="small">{behandling.soknadType}</BodyShort>
                        </div>
                        <div className="flex gap-x-2">
                            <Label size="small">Søknad fra</Label>
                            <BodyShort size="small">{behandling.soknadFra}</BodyShort>
                        </div>
                        <div className="flex gap-x-2">
                            <Label size="small">Mottat dato</Label>
                            <BodyShort size="small">{behandling.soktFraDato}</BodyShort>
                        </div>
                        <div className="flex gap-x-2">
                            <Label size="small">Søkt fra dato</Label>
                            <BodyShort size="small">{behandling.mottatDato}</BodyShort>
                        </div>
                    </FlexRow>
                    <FlexRow className="gap-x-8">
                        <Controller
                            control={control}
                            name="virkningstidspunkt"
                            render={({ field }) => (
                                <DatePickerInput
                                    label="Virkningstidspunkt"
                                    onChange={field.onChange}
                                    defaultValue={initialValues.virkningstidspunkt}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="aarsak"
                            render={({ field }) => (
                                <Select
                                    label="Årsak"
                                    className="w-52"
                                    size="small"
                                    value={field.value}
                                    onChange={field.onChange}
                                >
                                    <option value="">Velg årsak</option>
                                    {Object.entries(ForskuddBeregningKodeAarsak).map((entry) => (
                                        <option key={entry[0]} value={entry[0]}>
                                            {entry[1]}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                        <Controller
                            control={control}
                            name="avslag"
                            render={({ field }) => (
                                <Select
                                    label="Avslag/opphør"
                                    className="w-52"
                                    size="small"
                                    value={field.value}
                                    onChange={field.onChange}
                                >
                                    <option value=""></option>
                                    <option value="avslag_1">Avslag 1</option>
                                    <option value="avslag_2">Avslag 2</option>
                                </Select>
                            )}
                        />
                    </FlexRow>
                    <Controller
                        control={control}
                        name="begrunnelseMedIVedtakNotat"
                        render={({ field }) => (
                            <Textarea
                                label="Begrunnelse (med i vedtaket og notat)"
                                size="small"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="begrunnelseKunINotat"
                        render={({ field }) => (
                            <Textarea
                                label="Begrunnelse (kun med i notat)"
                                size="small"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <FlexRow>
                        <Button loading={action === ActionStatus.SUBMITTING} className="w-max" size="small">
                            Gå videre
                        </Button>
                        <Button
                            type="button"
                            loading={isRefetching}
                            variant="secondary"
                            onClick={onRefetch}
                            className="w-max"
                            size="small"
                        >
                            Oppfrisk
                        </Button>
                        <Button
                            type="button"
                            loading={action === ActionStatus.SAVING}
                            variant="secondary"
                            onClick={onSave}
                            className="w-max"
                            size="small"
                        >
                            Lagre
                        </Button>
                        <Link href={`/forskudd/${saksnummer}/notat`} target="_blank" className="font-bold">
                            Vis notat <ExternalLink aria-hidden />
                        </Link>
                    </FlexRow>
                </div>
            </form>
        </div>
    );
};
