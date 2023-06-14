import { Alert, BodyShort, Heading, Label } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

import { VirkningsTidspunktResponse } from "../../api/BidragBehandlingApi";
import { SOKNAD_LABELS } from "../../constants/soknadFraLabels";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { Avslag } from "../../enum/Avslag";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandling, useGetVirkningstidspunkt, useUpdateVirkningstidspunkt } from "../../hooks/useApiData";
import { useDebounce } from "../../hooks/useDebounce";
import { VirkningstidspunktFormValues } from "../../types/virkningstidspunktFormValues";
import { DDMMYYYYStringToDate, isValidDate, toISODateString } from "../../utils/date-utils";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { FormLayout } from "../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../query-error-boundary/QueryErrorWrapper";
import { aarsakToVirkningstidspunktMapper } from "./helpers/virkningstidspunktHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const createInitialValues = (response: VirkningsTidspunktResponse) =>
    ({
        virkningsDato: response.virkningsDato ? DDMMYYYYStringToDate(response.virkningsDato) : null,
        aarsak: response.aarsak ?? "",
        avslag: response.avslag ?? "",
        virkningsTidspunktBegrunnelseMedIVedtakNotat: response.virkningsTidspunktBegrunnelseMedIVedtakNotat ?? "",
        virkningsTidspunktBegrunnelseKunINotat: response.virkningsTidspunktBegrunnelseKunINotat ?? "",
    } as VirkningstidspunktFormValues);

const createPayload = (values: VirkningstidspunktFormValues) => ({
    virkningsTidspunktBegrunnelseMedIVedtakNotat: values.virkningsTidspunktBegrunnelseMedIVedtakNotat,
    virkningsTidspunktBegrunnelseKunINotat: values.virkningsTidspunktBegrunnelseKunINotat,
    aarsak: values.aarsak === "" ? null : values.aarsak,
    avslag: values.avslag === "" ? null : values.avslag,
    virkningsDato: toISODateString(values.virkningsDato),
});

const Main = ({ initialValues, error }) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const useFormMethods = useFormContext();
    const onAarsakSelect = (value: string) => {
        const date = aarsakToVirkningstidspunktMapper(value, behandling);
        if (isValidDate(date)) {
            useFormMethods.setValue("virkningsDato", date);
        }
    };

    return (
        <>
            {error && <Alert variant="error">{error.message}</Alert>}
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
            <FlexRow>
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
    const { data: behandling } = useGetVirkningstidspunkt(behandlingId);
    const updateVirkningsTidspunkt = useUpdateVirkningstidspunkt(behandlingId);
    const initialValues = createInitialValues(behandling);
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
        channel.postMessage(JSON.stringify(fieldsForNotat));
    }, [fieldsForNotat]);

    const onSave = () => {
        const values = useFormMethods.getValues();
        updateVirkningsTidspunkt.mutation.mutate(createPayload(values), {
            onSuccess: () => {
                useFormMethods.reset(values, { keepValues: true, keepErrors: true });
            },
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (useFormMethods.formState.isDirty) {
            debouncedOnSave();
        }
    }, [watchAllFields]);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout
                        title="Virkningstidspunkt"
                        main={<Main initialValues={initialValues} error={updateVirkningsTidspunkt.error} />}
                        side={<Side />}
                    />
                </form>
            </FormProvider>
        </>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <VirkningstidspunktForm />
        </QueryErrorWrapper>
    );
};
