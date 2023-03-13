import { Close, Edit } from "@navikt/ds-icons";
import { Accordion, BodyShort, Button, Heading, Label, Loader } from "@navikt/ds-react";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { useMockApi } from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { ArbeidsforholdData } from "../../../__mocks__/testdata/arbeidsforholdTestData";
import { InntektData } from "../../../__mocks__/testdata/inntektTestData";
import { NOTAT_FIELDS } from "../../../constants/notatFields";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { ActionStatus } from "../../../types/actionStatus";
import { HentSkattegrunnlagResponse } from "../../../types/bidragGrunnlagTypes";
import { EChartsOption, ReactECharts } from "../../e-charts/ReactECharts";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormControlledDatePickerRange } from "../../formFields/FormControllerDatePickerRange";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { createInitialValues, createInntektPayload } from "./inntektFormHelpers";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

const chartOptions: EChartsOption = {
    legend: {},
    tooltip: {
        trigger: "axis",
        showContent: true,
    },
    xAxis: { type: "category", data: ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Okt", "Nov", "Des"] },
    yAxis: { type: "value" },
    series: [
        {
            data: [47000, 48000, 43200, 45500, 45700, 72000, 50000, 48100, 42300, 44000, 58000, 45700],
            type: "line",
            smooth: true,
        },
    ],
};

export default () => {
    const { saksnummer } = useForskudd();
    const { api: mockApi } = useMockApi();
    const { data: skattegrunnlager } = mockApi.getSkattegrunlag(saksnummer);
    const { data: inntekt, refetch, isRefetching } = mockApi.getInntekt(saksnummer);
    const { data: arbeidsforholder } = mockApi.getArbeidsforhold(saksnummer);
    const mutation = mockApi.postInntekt(saksnummer);

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
            />
        </Suspense>
    );
};

const InntektForm = ({
    inntekt,
    arbeidsforholder,
    skattegrunnlager,
    refetch,
    isRefetching,
    mutation,
}: {
    inntekt: InntektData;
    arbeidsforholder: ArbeidsforholdData[];
    skattegrunnlager: HentSkattegrunnlagResponse[];
    refetch: () => Promise<QueryObserverResult>;
    isRefetching: boolean;
    mutation: UseMutationResult;
}) => {
    const channel = new BroadcastChannel("inntekter");
    const { inntektFormValues, setInntektFormValues, setActiveStep } = useForskudd();
    const initialValues = inntektFormValues ?? createInitialValues(inntekt, skattegrunnlager);
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);
    const [openPeriodDatePicker, setOpenPeriodDatePicker] = useState(false);

    const useFormMethods = useForm({
        defaultValues: initialValues,
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
        const values = createInitialValues(data, skattegrunnlager);
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
        setActiveStep(STEPS[ForskuddStepper.BOFORHOLD]);
    };

    const toggleOpenDatepickerRange = useCallback(
        () => setOpenPeriodDatePicker(!openPeriodDatePicker),
        [openPeriodDatePicker]
    );

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSubmit)}>
                <div className="grid gap-y-8">
                    <Heading level="2" size="xlarge">
                        Inntekt
                    </Heading>
                    <Periode toggleOpenDatepickerRange={toggleOpenDatepickerRange} />
                    {openPeriodDatePicker && (
                        <div className="flex gap-x-4">
                            <div>
                                <FormControlledDatePickerRange
                                    fromFieldName="periodeFra"
                                    toFieldName="periodeTil"
                                    defaultValues={{ from: initialValues.periodeFra, to: initialValues.periodeTil }}
                                    resetDefaultValues={action === ActionStatus.REFETCHED}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="tertiary"
                                icon={<Close aria-hidden />}
                                size="small"
                                className="flex self-end"
                                onClick={toggleOpenDatepickerRange}
                            >
                                Lukk
                            </Button>
                        </div>
                    )}
                    <Accordion style={{ width: "100%", maxWidth: "65ch" }}>
                        <Accordion.Item>
                            <Accordion.Header>{"<Graf>"}</Accordion.Header>
                            <Accordion.Content>
                                <ReactECharts option={chartOptions} />
                            </Accordion.Content>
                        </Accordion.Item>
                        <Accordion.Item>
                            <Accordion.Header>Arbeidsforhold</Accordion.Header>
                            <Accordion.Content>
                                <Arbeidsforhold arbeidsforholder={arbeidsforholder} />
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Inntektene som legges til grunn
                        </Heading>
                        <InntekteneSomLeggesTilGrunnTabel />
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Utvidet barnetrygd
                        </Heading>
                        <UtvidetBarnetrygdTabel />
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                        </Heading>
                        <BarnetilleggTabel />
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Kommentar
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
                        <div>
                            <FormControlledCheckbox name="toTrinnsKontroll" legend="Skal til to-trinns kontroll." />
                        </div>
                    </div>
                    <ActionButtons action={action} onSave={onSave} onRefetch={onRefetch} isRefetching={isRefetching} />
                </div>
            </form>
        </FormProvider>
    );
};

const Periode = ({ toggleOpenDatepickerRange }) => {
    const { control } = useFormContext();
    const [fra, til] = useWatch({ control, name: ["periodeFra", "periodeTil"] });

    return (
        <div className="flex gap-x-2 items-center">
            <Label size="small">Periode: </Label>
            <BodyShort size="small">
                {fra.toLocaleDateString()} - {til.toLocaleDateString()}
            </BodyShort>
            <Button
                type="button"
                variant="tertiary"
                icon={<Edit aria-hidden />}
                size="xsmall"
                onClick={toggleOpenDatepickerRange}
            >
                Endre periode
            </Button>
        </div>
    );
};
