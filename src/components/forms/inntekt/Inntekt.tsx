import { Heading, Label, Loader } from "@navikt/ds-react";
import React, { Suspense, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { UseMutationResult } from "react-query";
import { QueryObserverResult } from "react-query/types/core/types";

import { useMockApi } from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { ArbeidsforholdData } from "../../../__mocks__/testdata/arbeidsforholdTestData";
import { InntektData } from "../../../__mocks__/testdata/inntektTestData";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { ActionStatus } from "../../../types/actionStatus";
import { HentSkattegrunnlagResponse } from "../../../types/bidragGrunnlagTypes";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormControlledDatePickerRange } from "../../formFields/FormControllerDatePickerRange";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import {
    createInitialValues,
    createInntektPayload,
    createSkattegrunlagFields,
    syncSkattegrunlagFields,
} from "./inntektFormHelpers";
import { AndreTyperInntekter, InntektInfo } from "./Inntektinfo";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

export default () => {
    const { saksnummer } = useForskudd();
    const { api: mockApi } = useMockApi();
    const { data: skattegrunnlager } = mockApi.getSkattegrunlag(saksnummer);
    const { data: inntekt, refetch, isRefetching } = mockApi.getInntektData(saksnummer);
    const { data: arbeidsforholder } = mockApi.getArbeidsforholdData(saksnummer);
    const mutation = mockApi.postInntektData(saksnummer);

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
    const { inntektFormValues, setInntektFormValues, setActiveStep } = useForskudd();
    const skattegrunlagFields = createSkattegrunlagFields(inntekt, skattegrunnlager);
    const initialValues = inntektFormValues ?? { ...createInitialValues(inntekt), ...skattegrunlagFields };
    const [action, setAction] = useState<ActionStatus>(ActionStatus.IDLE);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const inntekteneSomLeggesTilGrunnField = useFieldArray({
        control: useFormMethods.control,
        name: "inntekteneSomLeggesTilGrunn",
    });

    const watchInntekteneSomLeggesTilGrunn = useFormMethods.watch("inntekteneSomLeggesTilGrunn");

    useEffect(() => {
        syncSkattegrunlagFields(skattegrunlagFields, watchInntekteneSomLeggesTilGrunn, useFormMethods);
    }, [watchInntekteneSomLeggesTilGrunn]);

    useEffect(() => {
        if (!inntektFormValues) setInntektFormValues(initialValues);

        return () => {
            setInntektFormValues(useFormMethods.getValues());
        };
    }, []);

    const onRefetch = async () => {
        const { data } = await refetch();
        const values = createInitialValues(data);
        useFormMethods.reset(values);
        setInntektFormValues(values);
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

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSubmit)}>
                <div className="grid gap-y-8">
                    <div className="grid gap-y-4">
                        <Heading level="2" size="xlarge">
                            Inntekt
                        </Heading>
                        <div className="grid gap-y-2">
                            <div>
                                <Label size="small">Periode: </Label>
                                <FormControlledDatePickerRange
                                    fromFieldName="periodeFra"
                                    toFieldName="periodeTil"
                                    defaultValues={{ from: initialValues.periodeFra, to: initialValues.periodeTil }}
                                />
                            </div>
                            <InntektInfo
                                gjennomsnittInntektSisteTreMaaneder={inntekt.gjennomsnittInntektSisteTreMaaneder}
                                gjennomsnittInntektSisteTolvMaaneder={inntekt.gjennomsnittInntektSisteTolvMaaneder}
                                inntekteneSomLeggesTilGrunnFieldArray={inntekteneSomLeggesTilGrunnField}
                                skattegrunnlager={skattegrunnlager}
                            />
                        </div>
                    </div>
                    <div className="grid gap-y-4">
                        <AndreTyperInntekter andreTyperInntekter={inntekt.andreTyperInntekter} />
                    </div>
                    <div className="grid gap-y-4">
                        <Arbeidsforhold arbeidsforholder={arbeidsforholder} />
                    </div>
                    <div className="grid gap-y-4">
                        <Heading level="3" size="medium">
                            Inntektene som legges til grunn
                        </Heading>
                        <InntekteneSomLeggesTilGrunnTabel fieldArray={inntekteneSomLeggesTilGrunnField} />
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
