import { capitalize, toISODateString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Heading, Label } from "@navikt/ds-react";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { OppdaterVirkningstidspunkt, VirkningstidspunktDto } from "../../../api/BidragBehandlingApiV1";
import { SOKNAD_LABELS } from "../../../constants/soknadFraLabels";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { Avslag } from "../../../enum/Avslag";
import { ForskuddBeregningKodeAarsak } from "../../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useGetBehandling, useOppdaterBehandling } from "../../../hooks/useApiData";
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

const createInitialValues = (response: VirkningstidspunktDto) =>
    ({
        virkningsdato: response.virkningsdato,
        årsak: response.årsak ?? "",
        virkningstidspunktsbegrunnelseIVedtakOgNotat: response.notat?.medIVedtaket ?? "",
        virkningstidspunktsbegrunnelseKunINotat: response.notat?.kunINotat ?? "",
    }) as VirkningstidspunktFormValues;

const createPayload = (values: VirkningstidspunktFormValues): OppdaterVirkningstidspunkt => ({
    ...values,
    årsak: values.årsak === "" ? null : values.årsak,
    notat: {
        medIVedtaket: values.virkningstidspunktsbegrunnelseIVedtakOgNotat,
        kunINotat: values.virkningstidspunktsbegrunnelseKunINotat,
    },
});

const Main = ({ initialValues, error }) => {
    const behandling = useGetBehandling();
    const [initialVirkningsdato, setInitialVirkningsdato] = useState(behandling.virkningstidspunkt.virkningsdato);
    const [showChangedVirkningsDatoAlert, setShowChangedVirkningsDatoAlert] = useState(false);
    const { setValue, clearErrors, getValues } = useFormContext();
    const virkningsDato = getValues("virkningsdato");

    const onAarsakSelect = (value: string) => {
        const date = aarsakToVirkningstidspunktMapper(value, behandling);
        setValue("virkningsdato", date ? toISODateString(date) : null);
        clearErrors("virkningsdato");
    };

    const [fom] = getFomAndTomForMonthPicker(new Date(behandling.søktFomDato));
    const tom = useMemo(() => addMonths(new Date(), 50 * 12), [fom]);

    useEffect(() => {
        if (!initialVirkningsdato && behandling) {
            setInitialVirkningsdato(
                behandling.virkningstidspunkt.virkningsdato ??
                    toISODateString(
                        getSoktFraOrMottatDato(new Date(behandling.søktFomDato), new Date(behandling.mottattdato))
                    )
            );
        }
    }, [behandling]);

    useEffect(() => {
        if (initialVirkningsdato && initialVirkningsdato !== virkningsDato) {
            const boforholdPeriodsExist = behandling.boforhold?.husstandsbarn[0]?.perioder.length;
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
                    <Label size="small">Søknadstype:</Label>
                    <BodyShort size="small">
                        {capitalize(behandling.stønadstype ?? behandling.engangsbeløptype)}
                    </BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Søknad fra:</Label>
                    <BodyShort size="small">{SOKNAD_LABELS[behandling.søktAv]}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Mottat dato:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.mottattdato))}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">Søkt fra dato:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.søktFomDato))}</BodyShort>
                </div>
            </FlexRow>
            <FlexRow className="gap-x-8">
                <FormControlledSelectField name="årsak" label="Årsak" onSelect={onAarsakSelect}>
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
                    name="virkningsdato"
                    label="Virkningstidspunkt"
                    placeholder="DD.MM.ÅÅÅÅ"
                    defaultValue={initialValues.virkningsdato}
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
    const aarsak = useFormMethods.getValues("årsak");
    const onNext = () =>
        setActiveStep(Avslag[aarsak] ? STEPS[ForskuddStepper.VEDTAK] : STEPS[ForskuddStepper.BOFORHOLD]);

    return (
        <>
            <Heading level="3" size="medium">
                Begrunnelse
            </Heading>
            <FormControlledTextarea
                name="virkningstidspunktsbegrunnelseIVedtakOgNotat"
                label="Begrunnelse (med i vedtaket og notat)"
            />
            <FormControlledTextarea
                name="virkningstidspunktsbegrunnelseKunINotat"
                label="Begrunnelse (kun med i notat)"
            />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const VirkningstidspunktForm = () => {
    const { virkningstidspunkt } = useGetBehandling();
    const oppdaterBehandling = useOppdaterBehandling();
    const initialValues = createInitialValues(virkningstidspunkt);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const onSave = () => {
        const values = useFormMethods.getValues();
        oppdaterBehandling.mutation.mutate(
            { virkningstidspunkt: createPayload(values) },
            {
                onSuccess: () => {
                    useFormMethods.reset(values, {
                        keepValues: true,
                        keepErrors: true,
                        keepDefaultValues: true,
                    });
                },
            }
        );
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
                        main={<Main initialValues={initialValues} error={oppdaterBehandling.error} />}
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
