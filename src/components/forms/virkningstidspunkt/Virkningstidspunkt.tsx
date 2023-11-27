import { toISODateString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Heading, Label } from "@navikt/ds-react";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

import { VirkningsTidspunktResponse } from "../../../api/BidragBehandlingApi";
import { SOKNAD_LABELS } from "../../../constants/soknadFraLabels";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { Avslag } from "../../../enum/Avslag";
import { ForskuddBeregningKodeAarsak } from "../../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import {
    useGetBehandling,
    useGetBoforhold,
    useGetVirkningstidspunkt,
    useUpdateVirkningstidspunkt,
} from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { VirkningstidspunktFormValues } from "../../../types/virkningstidspunktFormValues";
import { addMonths, DateToDDMMYYYYString } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FlexRow } from "../../layout/grid/FlexRow";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import {
    aarsakToVirkningstidspunktMapper,
    getFomAndTomForMonthPicker,
    getSoktFraOrMottatDato,
} from "../helpers/virkningstidspunktHelpers";
import { ActionButtons } from "../inntekt/ActionButtons";

const createInitialValues = (response: VirkningsTidspunktResponse) =>
    ({
        virkningsDato: response.virkningsDato,
        aarsak: response.aarsak ?? "",
        virkningsTidspunktBegrunnelseMedIVedtakNotat: response.virkningsTidspunktBegrunnelseMedIVedtakNotat ?? "",
        virkningsTidspunktBegrunnelseKunINotat: response.virkningsTidspunktBegrunnelseKunINotat ?? "",
    }) as VirkningstidspunktFormValues;

const createPayload = (values: VirkningstidspunktFormValues) => ({
    ...values,
    aarsak: values.aarsak === "" ? null : values.aarsak,
});

const Main = ({ initialValues, error }) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: virkningstidspunkt } = useGetVirkningstidspunkt(behandlingId);
    const { data: boforhold } = useGetBoforhold(behandlingId);
    const [initialVirkningsdato, setInitialVirkningsdato] = useState(virkningstidspunkt.virkningsDato);
    const [showChangedVirkningsDatoAlert, setShowChangedVirkningsDatoAlert] = useState(false);
    const { setValue, clearErrors, getValues } = useFormContext();
    const virkningsDato = getValues("virkningsDato");

    const onAarsakSelect = (value: string) => {
        const date = aarsakToVirkningstidspunktMapper(value, behandling);
        setValue("virkningsDato", toISODateString(date));
        clearErrors("virkningsDato");
    };

    const [fom] = getFomAndTomForMonthPicker(new Date(behandling.datoFom));
    const tom = useMemo(() => addMonths(new Date(), 50 * 12), [fom]);

    useEffect(() => {
        if (!initialVirkningsdato && virkningstidspunkt && behandling) {
            setInitialVirkningsdato(
                virkningstidspunkt.virkningsDato ??
                    toISODateString(
                        getSoktFraOrMottatDato(new Date(behandling.datoFom), new Date(behandling.mottatDato))
                    )
            );
        }
    }, [virkningstidspunkt]);

    useEffect(() => {
        if (initialVirkningsdato && initialVirkningsdato !== virkningsDato) {
            const boforholdPeriodsExist = boforhold?.husstandsBarn[0]?.perioder.length;
            if (boforholdPeriodsExist) {
                setShowChangedVirkningsDatoAlert(true);
            }
        }

        if (initialVirkningsdato && showChangedVirkningsDatoAlert && initialVirkningsdato === virkningsDato) {
            setShowChangedVirkningsDatoAlert(false);
        }
    }, [virkningsDato]);

    return (
        <>
            {showChangedVirkningsDatoAlert && (
                <Alert variant="warning">
                    Virkningstidspunktet er endret. Dette kan påvirke beregningen. Boforhold og inntekt må manuelt
                    vurderes på nytt
                </Alert>
            )}
            {error && <Alert variant="error">{error.message}</Alert>}
            <FlexRow className="gap-x-12 mt-12">
                <div className="flex gap-x-2">
                    <Label size="small">Søknadstype</Label>
                    <BodyShort size="small">{behandling.soknadFraType}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Søknad fra</Label>
                    <BodyShort size="small">{SOKNAD_LABELS[behandling.soknadFraType]}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Mottat dato</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.mottatDato))}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Søkt fra dato</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.datoFom))}</BodyShort>
                </div>
            </FlexRow>
            <FlexRow className="gap-x-8">
                <FormControlledSelectField name="aarsak" label="Årsak" onSelect={onAarsakSelect}>
                    <option value="">Velg årsak/avslag</option>
                    <optgroup label="Årsak">
                        {Object.entries(ForskuddBeregningKodeAarsak).map(([value, text]) => (
                            <option key={value} value={value}>
                                {text}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Avslag">
                        {Object.entries(Avslag).map(([value, text]) => (
                            <option key={value} value={value}>
                                {text}
                            </option>
                        ))}
                    </optgroup>
                </FormControlledSelectField>
                <FormControlledMonthPicker
                    name="virkningsDato"
                    label="Virkningstidspunkt"
                    placeholder="DD.MM.ÅÅÅÅ"
                    defaultValue={initialValues.virkningsDato}
                    fromDate={fom}
                    toDate={tom}
                    required
                />
            </FlexRow>
        </>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const useFormMethods = useFormContext();
    const aarsak = useFormMethods.getValues("aarsak");
    const onNext = () =>
        setActiveStep(Avslag[aarsak] ? STEPS[ForskuddStepper.VEDTAK] : STEPS[ForskuddStepper.BOFORHOLD]);

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
        name: [
            "virkningsDato",
            "aarsak",
            "virkningsTidspunktBegrunnelseMedIVedtakNotat",
            "virkningsTidspunktBegrunnelseKunINotat",
        ],
    });

    useEffect(() => {
        channel.postMessage(JSON.stringify(fieldsForNotat));
    }, [fieldsForNotat]);

    const onSave = () => {
        const values = useFormMethods.getValues();
        updateVirkningsTidspunkt.mutation.mutate(createPayload(values), {
            onSuccess: () => {
                useFormMethods.reset(values, {
                    keepValues: true,
                    keepErrors: true,
                    keepDefaultValues: true,
                });
            },
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch(() => debouncedOnSave());

        return () => unsubscribe();
    }, []);

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
