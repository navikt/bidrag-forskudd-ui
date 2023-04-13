import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Accordion, Heading, Link } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import {
    useGetAndreTyperInntekt,
    useGetInntekt,
    useGetSkattegrunlag,
    usePostInntekt,
} from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { INNTEKT_PERIODE_NOTAT_FIELDS, NOTAT_FIELDS } from "../../../constants/notatFields";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useDebounce } from "../../../hooks/useDebounce";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { createInitialValues, createInntektPayload } from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { InntektChart } from "./InntektChart";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

const InntektHeader = () => (
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
);
const Main = () => (
    <>
        <InntektHeader />
        <div className="grid gap-y-4 w-max">
            <div className="flex gap-x-4">
                <Heading level="3" size="medium">
                    Inntektene som legges til grunn
                </Heading>
                <Link href="" target="_blank" className="font-bold">
                    A-inntekt <ExternalLinkIcon aria-hidden />
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
    </>
);

const Side = () => {
    const { setActiveStep } = useForskudd();
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.VEDTAK]);
    return (
        <>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Begrunnelse
                </Heading>
                <div>
                    <FormControlledTextarea
                        name="inntektBegrunnelseMedIVedtakNotat"
                        label="Begrunnelse (med i vedtaket og notat)"
                    />
                </div>
                <div>
                    <FormControlledTextarea name="inntektBegrunnelseKunINotat" label="Begrunnelse (kun med i notat)" />
                </div>
            </div>
            <ActionButtons onNext={onNext} />
        </>
    );
};

const InntektForm = () => {
    const channel = new BroadcastChannel("inntekter");
    const { behandlingId, inntektFormValues, setInntektFormValues } = useForskudd();
    const { data: skattegrunnlager } = useGetSkattegrunlag(behandlingId.toString());
    const { data: aInntekt } = useGetAndreTyperInntekt(behandlingId.toString());
    const { data: inntekt } = useGetInntekt(behandlingId.toString());
    const mutation = usePostInntekt(behandlingId.toString());

    const initialValues = inntektFormValues ?? createInitialValues(inntekt, skattegrunnlager, aInntekt);

    const useFormMethods = useForm({
        defaultValues: initialValues,
        mode: "onBlur",
        criteriaMode: "all",
    });

    const watchAllFields = useWatch({ control: useFormMethods.control });

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch((value, { name }) => {
            const field = name?.split(".")[0];
            if (NOTAT_FIELDS.includes(field)) {
                const isPeriodeField = INNTEKT_PERIODE_NOTAT_FIELDS.includes(field);
                channel.postMessage(
                    JSON.stringify({
                        field,
                        value: isPeriodeField ? value[field].filter((inntekt) => inntekt.selected) : value[field],
                    })
                );
            }
        });
        return () => unsubscribe();
    }, [useFormMethods.watch]);

    useEffect(() => {
        if (!inntektFormValues) setInntektFormValues(initialValues);
        useFormMethods.trigger();

        return () => setInntektFormValues(useFormMethods.getValues());
    }, []);

    const onSave = () => {
        const values = useFormMethods.getValues();
        mutation.mutate(
            { ...inntekt, ...createInntektPayload(values) },
            {
                onSuccess: () => useFormMethods.reset(undefined, { keepValues: true, keepErrors: true }),
            }
        );
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (useFormMethods.formState.isDirty) {
            debouncedOnSave();
        }
    }, [watchAllFields, useFormMethods.formState.isDirty]);

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                <FormLayout title="Inntekt" main={<Main />} side={<Side />} />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <InntektForm />
        </QueryErrorWrapper>
    );
};
