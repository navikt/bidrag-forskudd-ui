import { Alert, BodyShort, ExpansionCard, Heading, Tabs } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { Rolletype } from "../../../api/BidragBehandlingApiV1";
import { ROLE_FORKORTELSER } from "../../../constants/roleTags";
import { STEPS } from "../../../constants/steps";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useGetBehandling, useGetBehandlingV2, useOppdaterBehandlingV2 } from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, isValidDate } from "../../../utils/date-utils";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import UnderArbeidAlert from "../../UnderArbeidAlert";
import { createInitialValues, createInntektPayload } from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { Barnetillegg } from "./Barnetillegg";
import { InntektChart } from "./InntektChart";
import { Kontantstøtte } from "./Kontantstoette";
import { SkattepliktigeOgPensjonsgivendeInntekt } from "./SkattepliktigeOgPensjonsgivendeInntekt";
import { Småbarnstillegg } from "./Smaabarnstilleg";
import { UtvidetBarnetrygd } from "./UtvidetBarnetrygd";

const InntektHeader = ({ ident }: { ident: string }) => {
    const { inntekter } = useGetBehandlingV2();
    const inntekt = inntekter.månedsinntekter?.filter((inntekt) => inntekt.ident === ident);
    return inntekt?.length > 0 ? (
        <div className="grid w-full max-w-[65ch] gap-y-8">
            <InntektChart inntekt={inntekt} />
            <ExpansionCard aria-label="default-demo" size="small">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>{text.title.arbeidsforhold}</ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <QueryErrorWrapper>
                        <Arbeidsforhold ident={ident} />
                    </QueryErrorWrapper>
                </ExpansionCard.Content>
            </ExpansionCard>
        </div>
    ) : (
        <Alert variant="info">
            <BodyShort>Ingen inntekt funnet</BodyShort>
        </Alert>
    );
};
const Main = () => {
    const {
        virkningstidspunkt: { virkningstidspunkt: virkningsdato },
        roller: behandlingRoller,
    } = useGetBehandling();
    const virkningstidspunkt = dateOrNull(virkningsdato);
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolletype !== Rolletype.BP)
        .sort((a, b) => {
            if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
            if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
            return 0;
        });

    return (
        <div className="grid gap-y-12">
            {!isValidDate(virkningstidspunkt) && (
                <Alert variant="warning">
                    <BodyShort>Mangler virkningstidspunkt</BodyShort>
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
                    return (
                        <Tabs.Panel key={rolle.ident} value={rolle.ident} className="grid gap-y-12">
                            <div className="mt-12">
                                <InntektHeader ident={rolle.ident} />
                            </div>
                            <SkattepliktigeOgPensjonsgivendeInntekt ident={rolle.ident} />
                            {rolle.rolletype === Rolletype.BM && (
                                <>
                                    <Barnetillegg />
                                    <UtvidetBarnetrygd />
                                    <Småbarnstillegg />
                                    <Kontantstøtte />
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
    const { setActiveStep, inntektFormValues, setInntektFormValues } = useForskudd();
    const { mutation: oppdaterBehandling } = useOppdaterBehandlingV2();
    const { watch } = useFormContext<InntektFormValues>();
    const onSave = () => {
        oppdaterBehandling.mutate(createInntektPayload(inntektFormValues));
    };
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.VEDTAK]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch(({ notat }, { name }) => {
            if (["notat.medIVedtaket", "notat.kunINotat"].includes(name)) {
                setInntektFormValues((prev) => ({
                    ...prev,
                    notat,
                }));
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

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
    const { setInntektFormValues } = useForskudd();
    const { inntekter, roller } = useGetBehandlingV2();
    const bmOgBarn = roller.filter((rolle) => rolle.rolletype === Rolletype.BM || rolle.rolletype === Rolletype.BA);
    const initialValues = createInitialValues(bmOgBarn, inntekter);
    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    // TODO update opplysninger && fetch new calculated values
    // const updateOpplysninger = () => {};
    useEffect(() => {
        setInntektFormValues(initialValues);
    }, []);

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <FormLayout title="Inntekt" main={<Main />} side={<Side />} />
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
