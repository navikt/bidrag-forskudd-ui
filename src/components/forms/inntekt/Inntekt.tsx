import { ClockDashedIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, ExpansionCard, Heading, Tabs } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Inntektsrapportering, OpplysningerType, RolleDto, Rolletype } from "../../../api/BidragBehandlingApiV1";
import { SummertManedsinntekt } from "../../../api/BidragInntektApi";
import { ROLE_FORKORTELSER } from "../../../constants/roleTags";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useGetBehandlingV2, useGetOpplysningerHentetdato, useOppdaterBehandling } from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import { ISODateTimeStringToDDMMYYYYString } from "../../../utils/date-utils";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import UnderArbeidAlert from "../../UnderArbeidAlert";
import { createInitialValues, createInntektPayload } from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import AinntektLink from "./AinntektLink";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { BarnetilleggTabel } from "./BarnetilleggTabel";
import { InntektChart } from "./InntektChart";
import { InntekteneSomLeggesTilGrunnTabel } from "./InntekteneSomLeggesTilGrunnTabel";
import { UtvidetBarnetrygdTabel } from "./UtvidetBarnetrygdTabel";

const InntektHeader = ({ inntekt, ident }: { inntekt: SummertManedsinntekt[]; ident: string }) => (
    <div className="grid w-full max-w-[65ch] gap-y-8">
        <InntektChart inntekt={inntekt} />
        <ExpansionCard aria-label="default-demo" size="small">
            <ExpansionCard.Header>
                <ExpansionCard.Title>Arbeidsforhold</ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <QueryErrorWrapper>
                    <Arbeidsforhold ident={ident} />
                </QueryErrorWrapper>
            </ExpansionCard.Content>
        </ExpansionCard>
    </div>
);

const Main = ({
    behandlingRoller,
    ainntekt,
    opplysningerChanges,
    updateOpplysninger,
}: {
    behandlingRoller: RolleDto[];
    ainntekt: { [ident: string]: SummertManedsinntekt[] };
    opplysningerChanges: string[];
    updateOpplysninger: () => void;
}) => {
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolletype !== Rolletype.BP)
        .sort((a, b) => {
            if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
            if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
            return 0;
        });

    const opplysningerHentetdato = useGetOpplysningerHentetdato(OpplysningerType.INNTEKT_BEARBEIDET);
    return (
        <div className="grid gap-y-12">
            {opplysningerChanges.length > 0 && (
                <Alert variant="info">
                    <div className="flex items-center mb-4">
                        Nye opplysninger tilgjengelig. Sist hentet{" "}
                        {ISODateTimeStringToDDMMYYYYString(opplysningerHentetdato)}
                        <Button
                            variant="tertiary"
                            size="small"
                            className="ml-8"
                            icon={<ClockDashedIcon aria-hidden />}
                            onClick={updateOpplysninger}
                        >
                            Oppdater
                        </Button>
                    </div>
                    <p>Følgende endringer har blitt utført:</p>
                    {opplysningerChanges.map((change, index) => (
                        <p key={`${change}-${index}`}>{change}</p>
                    ))}
                </Alert>
            )}
            <Tabs defaultValue={roller.find((rolle) => rolle.rolletype === Rolletype.BM).ident}>
                <Tabs.List>
                    {roller.map((rolle) => (
                        <Tabs.Tab
                            key={rolle.ident}
                            value={rolle.ident}
                            label={`${ROLE_FORKORTELSER[rolle.rolletype]} ${
                                rolle.rolletype === Rolletype.BM ? "" : rolle.ident
                            }`}
                        />
                    ))}
                </Tabs.List>
                {roller.map((rolle) => {
                    const inntekt = ainntekt[rolle.ident];
                    return (
                        <Tabs.Panel key={rolle.ident} value={rolle.ident} className="grid gap-y-12">
                            <div className="mt-12">
                                {inntekt.length > 0 ? (
                                    <InntektHeader inntekt={inntekt} ident={rolle.ident} />
                                ) : (
                                    <Alert variant="info">
                                        <BodyShort>Ingen inntekt funnet</BodyShort>
                                    </Alert>
                                )}
                            </div>
                            <div className="grid gap-y-4">
                                <div className="flex gap-x-4">
                                    <Heading level="3" size="medium">
                                        Inntektene som legges til grunn
                                    </Heading>
                                    {inntekt.length > 0 && <AinntektLink ident={rolle.ident} />}
                                </div>
                                <InntekteneSomLeggesTilGrunnTabel ident={rolle.ident} />
                            </div>
                            {rolle.rolletype === Rolletype.BM && (
                                <>
                                    <div className="grid gap-y-4">
                                        <Heading level="3" size="medium">
                                            Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                                        </Heading>
                                        <BarnetilleggTabel />
                                    </div>
                                    <div className="grid gap-y-4">
                                        <Heading level="3" size="medium">
                                            Utvidet barnetrygd
                                        </Heading>
                                        <UtvidetBarnetrygdTabel />
                                    </div>
                                </>
                            )}
                        </Tabs.Panel>
                    );
                })}
            </Tabs>
        </div>
    );
};

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
                    <FormControlledTextarea name="notat.medIVedtaket" label="Begrunnelse (med i vedtaket og notat)" />
                </div>
                <div>
                    <FormControlledTextarea name="notat.kunINotat" label="Begrunnelse (kun med i notat)" />
                </div>
            </div>
            <ActionButtons onNext={onNext} />
        </>
    );
};

const InntektForm = () => {
    const { inntektFormValues, setInntektFormValues } = useForskudd();
    const behandling = useGetBehandlingV2();
    const { inntekter, roller } = behandling;
    const { mutation: oppdaterBehandling } = useOppdaterBehandling();
    const bmOgBarn = roller.filter((rolle) => rolle.rolletype === Rolletype.BM || rolle.rolletype === Rolletype.BA);
    const ainntekt: { [ident: string]: SummertManedsinntekt[] } = inntekter.inntekter.reduce(
        (acc, curr) => ({
            ...acc,
            [curr.ident]: inntekter.inntekter.filter(
                (inntekt) => inntekt.ident === curr.ident && inntekt.rapporteringstype === Inntektsrapportering.AINNTEKT
            ),
        }),
        {}
    );

    const initialValues = createInitialValues(bmOgBarn, inntekter);
    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const onSave = () => {
        const values = useFormMethods.getValues();

        oppdaterBehandling.mutate(createInntektPayload(values), {
            onSuccess: () =>
                useFormMethods.reset(values, { keepValues: true, keepErrors: true, keepDefaultValues: true }),
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch(() => {
            if (useFormMethods.formState.isDirty) {
                debouncedOnSave();
            }
        });

        return () => unsubscribe();
    }, [useFormMethods.watch, useFormMethods.formState.isDirty]);

    const updateOpplysninger = () => {
        // TODO update opplysninger && fetch new calculated values
        // useFormMethods.reset(values);
        // oppdaterBehandling.mutate(createInntektPayload(values));
        setInntektFormValues(inntektFormValues);
    };

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <FormLayout
                    title="Inntekt"
                    main={
                        <Main
                            behandlingRoller={behandling.roller}
                            ainntekt={ainntekt}
                            opplysningerChanges={[]}
                            updateOpplysninger={updateOpplysninger}
                        />
                    }
                    side={<Side />}
                />
            </form>
        </FormProvider>
    );
};

export default () => {
    const { isInntektSkjermbildeEnabled } = useFeatureToogle();

    if (!isInntektSkjermbildeEnabled) {
        return <UnderArbeidAlert />;
    }
    return (
        <QueryErrorWrapper>
            <InntektForm />
        </QueryErrorWrapper>
    );
};
