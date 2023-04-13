import { Alert, BodyShort, Heading, Label, Loader } from "@navikt/ds-react";
import React, { Suspense, useEffect } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

import { BehandlingDto } from "../../api/BidragBehandlingApi";
import { SOKNAD_LABELS } from "../../constants/soknadFraLabels";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { Avslag } from "../../enum/Avslag";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandling, useUpdateBehandling } from "../../hooks/useApiData";
import { useDebounce } from "../../hooks/useDebounce";
import { VirkningstidspunktFormValues } from "../../types/virkningstidspunktFormValues";
import { dateOrNull, isValidDate } from "../../utils/date-utils";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { FormLayout } from "../layout/grid/FormLayout";
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

const Main = ({ initialValues }) => {
    const { behandlingId } = useForskudd();
    const {
        data: { data: behandling },
    } = useGetBehandling(behandlingId);
    const updateBehandling = useUpdateBehandling(behandlingId);
    const useFormMethods = useFormContext();
    const onAarsakSelect = (value: string) => {
        const date = aarsakToVirkningstidspunktMapper(value, behandling);
        if (isValidDate(date)) {
            useFormMethods.setValue("virkningsDato", date);
        }
    };

    return (
        <>
            {updateBehandling.error && <Alert variant="error">{updateBehandling.error.message}</Alert>}
            <FlexRow className="gap-x-12 mt-12">
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
        </>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.BOFORHOLD]);

    return (
        <>
            <Heading level="3" size="medium">
                Begrunnelse
            </Heading>
            <FormControlledTextarea
                name="virkningsTidspunktBegrunnelseMedIVedtakNotat"
                label="Begrunnelse (med i vedtaket og notat)"
            />
            <FormControlledTextarea
                name="virkningsTidspunktBegrunnelseKunINotat"
                label="Begrunnelse (kun med i notat)"
            />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const VirkningstidspunktForm = () => {
    const { behandlingId } = useForskudd();
    const {
        data: { data: behandling },
    } = useGetBehandling(behandlingId);
    const updateBehandling = useUpdateBehandling(behandlingId);
    const { virkningstidspunktFormValues, setVirkningstidspunktFormValues } = useForskudd();
    const initialValues = virkningstidspunktFormValues ?? createInitialValues(behandling);
    const channel = new BroadcastChannel("virkningstidspunkt");

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const fieldsForNotat = useWatch({
        control: useFormMethods.control,
        name: ["virkningsDato", "aarsak", "virkningsTidspunktBegrunnelseMedIVedtakNotat"],
    });

    const watchAllFields = useWatch({ control: useFormMethods.control });

    useEffect(() => {
        if (!virkningstidspunktFormValues) setVirkningstidspunktFormValues(initialValues);

        return () => setVirkningstidspunktFormValues(useFormMethods.getValues());
    }, []);

    useEffect(() => {
        channel.postMessage(JSON.stringify(fieldsForNotat));
    }, [fieldsForNotat]);

    const onSave = () => {
        const values = useFormMethods.getValues();
        setVirkningstidspunktFormValues(values);
        updateBehandling.mutation.mutate(
            {
                virkningsTidspunktBegrunnelseMedIVedtakNotat: values.virkningsTidspunktBegrunnelseMedIVedtakNotat,
                virkningsTidspunktBegrunnelseKunINotat: values.virkningsTidspunktBegrunnelseKunINotat,
                aarsak: values.aarsak ? values.aarsak : null,
                avslag: values.avslag ? values.avslag : null,
                virkningsDato: values.virkningsDato?.toLocaleDateString("no-NO", { dateStyle: "short" }) ?? null,
            },
            { onSuccess: () => useFormMethods.reset(undefined, { keepValues: true, keepErrors: true }) }
        );
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (useFormMethods.formState.isDirty) {
            debouncedOnSave();
        }
    }, [watchAllFields, useFormMethods.formState.isDirty]);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout
                        title="Virkningstidspunkt"
                        main={<Main initialValues={initialValues} />}
                        side={<Side />}
                    />
                </form>
            </FormProvider>
        </>
    );
};

export default () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <VirkningstidspunktForm />
        </Suspense>
    );
};
