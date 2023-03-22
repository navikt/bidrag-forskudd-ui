import { ExternalLink } from "@navikt/ds-icons";
import { Accordion, Heading, Link, Loader } from "@navikt/ds-react";
import React, { Suspense, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { useMockApi } from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { AndreInntekter } from "../../../__mocks__/testdata/aInntektTestData";
import { ArbeidsforholdData } from "../../../__mocks__/testdata/arbeidsforholdTestData";
import { InntektData } from "../../../__mocks__/testdata/inntektTestData";
import { NOTAT_FIELDS } from "../../../constants/notatFields";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { ActionStatus } from "../../../types/actionStatus";
import { HentSkattegrunnlagResponse } from "../../../types/bidragGrunnlagTypes";
import { roundDown, roundUp } from "../../../utils/number-utils";
import { EChartsOption, ReactECharts } from "../../e-charts/ReactECharts";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { createInitialValues, createInntektPayload } from "./inntektFormHelpers";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

const chartOptions: EChartsOption = {
    legend: {},
    tooltip: {
        trigger: "axis",
        showContent: true,
        formatter: (params) => `<strong>Lønn</strong>: ${params[0].data.toLocaleString()}`,
        backgroundColor: "rgb(230,240,255)",
        borderColor: "rgb(230,240,255)",
    },
    xAxis: {
        type: "category",
        data: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"],
    },
    grid: { bottom: "0px", top: "16px", left: "8px", right: "0px", containLabel: true },
    yAxis: {
        type: "value",
        min: (value) => roundDown(value.min),
        max: (value) => roundUp(value.max),
    },
    series: [
        {
            data: [47352, 48121, 43271, 45522, 45731, 72321, 50112, 48103, 42335, 44753, 58121, 45733],
            type: "line",
            smooth: true,
        },
    ],
};

export default () => {
    const { behandlingId } = useForskudd();
    const { api: mockApi } = useMockApi();
    const { data: skattegrunnlager } = mockApi.getSkattegrunlag(behandlingId + "");
    const { data: aInntekt } = mockApi.getAndreTyperInntekt(behandlingId + "");
    const { data: inntekt, refetch, isRefetching } = mockApi.getInntekt(behandlingId + "");
    const { data: arbeidsforholder } = mockApi.getArbeidsforhold(behandlingId + "");
    const mutation = mockApi.postInntekt(behandlingId + "");

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <InntektForm
                inntekt={inntekt}
                arbeidsforholder={arbeidsforholder}
                refetch={refetch}
                isRefetching={isRefetching}
                mutation={mutation}
                skattegrunnlager={skattegrunnlager}
                aInntekt={aInntekt}
            />
        </Suspense>
    );
};

const InntektForm = ({
    inntekt,
    aInntekt,
    arbeidsforholder,
    skattegrunnlager,
    refetch,
    isRefetching,
    mutation,
}: {
    inntekt: InntektData;
    aInntekt: AndreInntekter[];
    arbeidsforholder: ArbeidsforholdData[];
    skattegrunnlager: HentSkattegrunnlagResponse[];
    refetch: () => Promise<QueryObserverResult>;
    isRefetching: boolean;
    mutation: UseMutationResult;
}) => {
    const channel = new BroadcastChannel("inntekter");
    const { inntektFormValues, setInntektFormValues, setActiveStep } = useForskudd();
    const initialValues = inntektFormValues ?? createInitialValues(inntekt, skattegrunnlager, aInntekt);
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);

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
                    <Heading level="2" size="xlarge">
                        Inntekt
                    </Heading>
                    <div style={{ width: "100%", maxWidth: "65ch" }}>
                        <ReactECharts option={chartOptions} />
                    </div>
                    <Accordion style={{ width: "100%", maxWidth: "65ch" }}>
                        <Accordion.Item>
                            <Accordion.Header>Arbeidsforhold</Accordion.Header>
                            <Accordion.Content>
                                <Arbeidsforhold arbeidsforholder={arbeidsforholder} />
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion>
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
