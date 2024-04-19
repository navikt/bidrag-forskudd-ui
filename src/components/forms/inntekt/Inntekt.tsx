import { Alert, BodyShort, ExpansionCard, Heading, Tabs } from "@navikt/ds-react";
import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { Rolletype } from "../../../api/BidragBehandlingApiV1";
import { ROLE_FORKORTELSER } from "../../../constants/roleTags";
import { STEPS } from "../../../constants/steps";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, DateToDDMMYYYYHHMMString, isValidDate } from "../../../utils/date-utils";
import { scrollToHash } from "../../../utils/window-utils";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import UnderArbeidAlert from "../../UnderArbeidAlert";
import { createInitialValues } from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { Barnetillegg } from "./Barnetillegg";
import { BeregnetInntekter } from "./BeregnetInntekter";
import { InntektChart } from "./InntektChart";
import { Kontantstøtte } from "./Kontantstoette";
import { SkattepliktigeOgPensjonsgivende } from "./SkattepliktigeOgPensjonsgivende";
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
        ikkeAktiverteEndringerIGrunnlagsdata,
    } = useGetBehandlingV2();
    const virkningstidspunkt = dateOrNull(virkningsdato);
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolletype !== Rolletype.BP)
        .sort((a, b) => {
            if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
            if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
            return 0;
        });
    useEffect(scrollToHash, []);

    const ikkeAktiverteEndringer = Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).filter(
        (i) => i.length > 0
    );

    function renderNyeOpplysningerAlert() {
        if (ikkeAktiverteEndringer.length === 0) return null;
        return (
            <Alert variant="info" size="small">
                <Heading size="small">{text.alert.nyOpplysningerInfo}</Heading>
                <BodyShort>
                    Nye opplysninger fra offentlige register er tilgjengelig. Oppdatert{" "}
                    {DateToDDMMYYYYHHMMString(dateOrNull(ikkeAktiverteEndringer[0][0].innhentetTidspunkt))}.
                </BodyShort>
            </Alert>
        );
    }

    return (
        <div className="grid gap-y-12">
            {renderNyeOpplysningerAlert()}
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
                        <Tabs.Panel key={rolle.ident} value={rolle.ident} className="grid gap-y-4">
                            <div className="mt-12">
                                <InntektHeader ident={rolle.ident} />
                            </div>
                            <SkattepliktigeOgPensjonsgivende ident={rolle.ident} />
                            {rolle.rolletype === Rolletype.BM && (
                                <>
                                    <Barnetillegg />
                                    <UtvidetBarnetrygd />
                                    <Småbarnstillegg />
                                    <Kontantstøtte />
                                    <BeregnetInntekter />
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
    const saveInntekt = useOnSaveInntekt();
    const { watch, getValues } = useFormContext<InntektFormValues>();
    const onSave = () => {
        const [medIVedtaket, kunINotat] = getValues(["notat.medIVedtaket", "notat.kunINotat"]);
        saveInntekt.mutate({
            oppdatereNotat: {
                medIVedtaket,
                kunINotat,
            },
        });
    };
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.VEDTAK]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name }) => {
            if (["notat.medIVedtaket", "notat.kunINotat"].includes(name)) {
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
    const { inntekter, roller } = useGetBehandlingV2();
    const virkningsdato = useVirkningsdato();
    const bmOgBarn = roller.filter((rolle) => rolle.rolletype === Rolletype.BM || rolle.rolletype === Rolletype.BA);
    const initialValues = useMemo(
        () => createInitialValues(bmOgBarn, inntekter, virkningsdato),
        [bmOgBarn, inntekter, virkningsdato]
    );
    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

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
