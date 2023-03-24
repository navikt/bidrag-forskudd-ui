import { ExternalLink } from "@navikt/ds-icons";
import { Accordion, Heading, Link } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useMockApi } from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { NOTAT_FIELDS } from "../../../constants/notatFields";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { ActionStatus } from "../../../types/actionStatus";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { InntektChart } from "./InntektChart";
import { createInitialValues, createInntektPayload } from "./inntektFormHelpers";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

export default () => {
    return (
        <div className="grid gap-y-8">
            <InntektHeader />
            <QueryErrorWrapper>
                <InntektForm />
            </QueryErrorWrapper>
        </div>
    );
};

const InntektForm = () => {
    const channel = new BroadcastChannel("inntekter");
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);
    const { behandlingId, inntektFormValues, setInntektFormValues, setActiveStep } = useForskudd();
    const { api: mockApi } = useMockApi();
    const { data: skattegrunnlager } = mockApi.getSkattegrunlag(behandlingId.toString());
    const { data: aInntekt } = mockApi.getAndreTyperInntekt(behandlingId.toString());
    const { data: inntekt, refetch, isRefetching } = mockApi.getInntekt(behandlingId.toString());
    const mutation = mockApi.postInntekt(behandlingId.toString());

    const initialValues = inntektFormValues ?? createInitialValues(inntekt, skattegrunnlager, aInntekt);

    const useFormMethods = useForm({
        defaultValues: initialValues,
        mode: "onBlur",
        criteriaMode: "all",
    });

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch((value, { name }) => {
            const field = name?.split("[")[0];
            if (NOTAT_FIELDS.includes(field)) {
                channel.postMessage(JSON.stringify({ field, value: value[field] }));
            }
        });
        return () => unsubscribe();
    }, [useFormMethods.watch]);

    useEffect(() => {
        if (!inntektFormValues) setInntektFormValues(initialValues);

        return () => setInntektFormValues(useFormMethods.getValues());
    }, []);

    useEffect(() => {
        if (action === ActionStatus.REFETCHED) setAction(ActionStatus.IDLE);
    }, [action]);

    const onRefetch = async () => {
        const { data } = await refetch();
        const values = createInitialValues(data, skattegrunnlager, aInntekt);
        useFormMethods.reset(values);
        setInntektFormValues(values);
        setAction(ActionStatus.REFETCHED);
    };

    const onSave = async () => {
        setAction(ActionStatus.SAVING);
        await save();
    };

    const save = async () => {
        const values = useFormMethods.getValues();
        setInntektFormValues(values);
        await mutation.mutateAsync({ ...inntekt, ...createInntektPayload(values) });
        setAction(ActionStatus.IDLE);
    };

    const onSubmit = async () => {
        setAction(ActionStatus.SUBMITTING);
        await save();
        setActiveStep(STEPS[ForskuddStepper.VEDTAK]);
    };

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSubmit)}>
                <div className="grid gap-y-8">
                    <div className="grid gap-y-4 w-max">
                        <div className="flex gap-x-4">
                            <Heading level="3" size="medium">
                                Inntektene som legges til grunn
                            </Heading>
                            <Link href="" target="_blank" className="font-bold">
                                A-inntekt <ExternalLink aria-hidden />
                            </Link>
                        </div>
                        <InntekteneSomLeggesTilGrunnTabel />
                    </div>
                    <div className="grid gap-y-4 w-max">
                        <Heading level="3" size="medium">
                            Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                        </Heading>
                        <BarnetilleggTabel />
                    </div>
                    <div className="grid gap-y-4 w-max">
                        <Heading level="3" size="medium">
                            Utvidet barnetrygd
                        </Heading>
                        <UtvidetBarnetrygdTabel />
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Begrunnelse
                        </Heading>
                        <div>
                            <FormControlledTextarea
                                name="begrunnelseIVedtaket"
                                label="Begrunnelse (med i vedtaket og notat)"
                            />
                        </div>
                        <div>
                            <FormControlledTextarea name="begrunnelseINotat" label="Begrunnelse (kun med i notat)" />
                        </div>
                    </div>
                    <ActionButtons action={action} onSave={onSave} onRefetch={onRefetch} isRefetching={isRefetching} />
                </div>
            </form>
        </FormProvider>
    );
};

const InntektHeader = () => (
    <>
        <Heading level="2" size="xlarge">
            Inntekt
        </Heading>
        <div className="grid w-full max-w-[65ch] gap-y-8">
            <InntektChart />
            <Accordion>
                <Accordion.Item>
                    <Accordion.Header>Arbeidsforhold</Accordion.Header>
                    <Accordion.Content>
                        <QueryErrorWrapper>
                            <Arbeidsforhold />
                        </QueryErrorWrapper>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </div>
    </>
);
