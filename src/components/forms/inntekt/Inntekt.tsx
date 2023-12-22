import { ClockDashedIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, ExpansionCard, Heading, Tabs } from "@navikt/ds-react";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { OpplysningerDto, OpplysningerType, RolleDto, Rolletype } from "../../../api/BidragBehandlingApiV1";
import { SummertManedsinntekt } from "../../../api/BidragInntektApi";
import { ROLE_FORKORTELSER } from "../../../constants/roleTags";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import {
    useAddOpplysningerData,
    useGetBehandling,
    useGetBidragInntektQueries,
    useGetOpplysninger,
    useGrunnlagspakke,
    useOppdaterBehandling,
} from "../../../hooks/useApiData";
import { useHentArbeidsforhold } from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import useFeatureToogle from "../../../hooks/useFeatureToggle";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { ISODateTimeStringToDDMMYYYYString, toISODateString } from "../../../utils/date-utils";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import UnderArbeidAlert from "../../UnderArbeidAlert";
import {
    compareArbeidsforholdOpplysninger,
    compareOpplysninger,
    createInitialValues,
    createInntektPayload,
    getPerioderFraBidragInntekt,
} from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import AinntektLink from "./AinntektLink";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { InntektChart } from "./InntektChart";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

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
    inntektOpplysninger,
}: {
    behandlingRoller: RolleDto[];
    ainntekt: { [ident: string]: SummertManedsinntekt[] };
    opplysningerChanges: string[];
    updateOpplysninger: () => void;
    inntektOpplysninger: OpplysningerDto;
}) => {
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolletype !== Rolletype.BP)
        .sort((a, b) => {
            if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
            if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
            return 0;
        });

    return (
        <div className="grid gap-y-12">
            {opplysningerChanges.length > 0 && (
                <Alert variant="info">
                    <div className="flex items-center mb-4">
                        Nye opplysninger tilgjengelig. Sist hentet{" "}
                        {ISODateTimeStringToDDMMYYYYString(inntektOpplysninger.hentetDato)}
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
    const { behandlingId } = useForskudd();
    const isSavedInitialOpplysninger = useRef(false);
    const isSavedInitialArbeidsforholdOpplysninger = useRef(false);
    const behandling = useGetBehandling();
    const inntektOpplysninger = useGetOpplysninger(OpplysningerType.INNTEKT_BEARBEIDET);
    const arbeidsforholdOpplysninger = useGetOpplysninger(OpplysningerType.ARBEIDSFORHOLD);
    const { mutation: saveOpplysninger } = useAddOpplysningerData();
    const { arbeidsforholdListe } = useHentArbeidsforhold();
    const grunnlagspakke = useGrunnlagspakke();
    const { inntekter, roller } = behandling;
    const bidragInntekt = useGetBidragInntektQueries(behandling, grunnlagspakke).map(({ data }) => data);
    const ainntekt: { [ident: string]: SummertManedsinntekt[] } = bidragInntekt.reduce(
        (acc, curr) => ({ ...acc, [curr.ident]: curr.data.summertMånedsinntektListe }),
        {}
    );
    const oppdaterBehandlingFn = useOppdaterBehandling();
    const [opplysningerChanges, setOpplysningerChanges] = useState([]);
    const bmOgBarn = roller.filter((rolle) => rolle.rolletype === Rolletype.BM || rolle.rolletype === Rolletype.BA);

    const initialValues = createInitialValues(bmOgBarn, bidragInntekt, inntekter, grunnlagspakke);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        useFormMethods.trigger();
    }, []);

    const onSave = () => {
        const values = useFormMethods.getValues();

        oppdaterBehandlingFn.mutation.mutate(createInntektPayload(values), {
            onSuccess: () =>
                useFormMethods.reset(values, { keepValues: true, keepErrors: true, keepDefaultValues: true }),
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (!inntektOpplysninger && !isSavedInitialOpplysninger.current) {
            lagreInntektOpplysninger();
        }

        if (!arbeidsforholdOpplysninger && !isSavedInitialArbeidsforholdOpplysninger.current) {
            lagreArbeidsforholdOpplysninger();
        }

        // Prevent duplicate saving of opplysninger
        isSavedInitialOpplysninger.current = true;
        isSavedInitialArbeidsforholdOpplysninger.current = true;
    }, []);

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch(() => {
            if (useFormMethods.formState.isDirty) {
                debouncedOnSave();
            }
        });

        return () => unsubscribe();
    }, [useFormMethods.watch, useFormMethods.formState.isDirty]);

    useEffect(() => {
        if (inntektOpplysninger) {
            const savedOpplysninger = JSON.parse(inntektOpplysninger.data);
            const changesInntektOpplysninger = compareOpplysninger(savedOpplysninger, {
                inntekt: bidragInntekt.map((personInntekt) => ({
                    ident: personInntekt.ident,
                    summertAarsinntektListe: personInntekt.data.summertÅrsinntektListe,
                })),
                utvidetbarnetrygd: grunnlagspakke.ubstListe,
                barnetillegg: grunnlagspakke.barnetilleggListe.map((bt) => ({
                    ...bt,
                    ident: bt.partPersonId,
                    gjelderBarn: bt.barnPersonId,
                    barnetillegg: bt.belopBrutto,
                })),
            });

            const changesArbeidsforholdOpplysninger = arbeidsforholdOpplysninger
                ? compareArbeidsforholdOpplysninger(JSON.parse(arbeidsforholdOpplysninger.data), arbeidsforholdListe)
                : [];

            const allChanges = [...changesArbeidsforholdOpplysninger, ...changesInntektOpplysninger];
            if (allChanges.length) {
                setOpplysningerChanges(allChanges);
            }
        }
    }, []);

    const lagreArbeidsforholdOpplysninger = () => {
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.ARBEIDSFORHOLD,
            data: JSON.stringify(arbeidsforholdListe ?? []),
            hentetDato: toISODateString(new Date()),
        });
    };
    const lagreInntektOpplysninger = () => {
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.INNTEKT_BEARBEIDET,
            data: JSON.stringify({
                inntekt: bidragInntekt.map((personInntekt) => ({
                    ident: personInntekt.ident,
                    versjon: personInntekt.data.versjon,
                    summertAarsinntektListe: personInntekt.data.summertÅrsinntektListe.map((inntekt) => ({
                        ...inntekt,
                        datoFom: dateToDDMMYYYYString(new Date(inntekt.periode.fom)),
                        datoTom: dateToDDMMYYYYString(new Date(inntekt.periode.til)),
                    })),
                })),
                utvidetbarnetrygd: grunnlagspakke.ubstListe,
                barnetillegg: grunnlagspakke.barnetilleggListe,
                arbeidsforhold: arbeidsforholdListe ?? [],
            }),
            hentetDato: toISODateString(new Date()),
        });
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.INNTEKT,
            data: JSON.stringify({
                ainntektListe: grunnlagspakke.ainntektListe,
                skattegrunnlagListe: grunnlagspakke.skattegrunnlagListe,
                barnetilleggListe: grunnlagspakke.barnetilleggListe,
                barnetilsynListe: grunnlagspakke.barnetilsynListe,
                kontantstotteListe: grunnlagspakke.kontantstotteListe,
                ubstListe: grunnlagspakke.ubstListe,
                overgangsstonadListe: grunnlagspakke.overgangsstonadListe,
            }),
            hentetDato: toISODateString(new Date()),
        });
    };
    const updateOpplysninger = () => {
        lagreInntektOpplysninger();
        lagreArbeidsforholdOpplysninger();

        const fieldValues = useFormMethods.getValues();
        const values: InntektFormValues = {
            ...fieldValues,
            inntekteneSomLeggesTilGrunn: getPerioderFraBidragInntekt(bidragInntekt),
            utvidetbarnetrygd: grunnlagspakke.ubstListe.map((ubst) => ({
                deltBosted: false,
                beløp: ubst.belop,
                datoFom: ubst.periodeFra,
                datoTom: ubst.periodeTil,
            })),
            barnetillegg: grunnlagspakke.barnetilleggListe.map((periode) => ({
                ident: periode.barnPersonId,
                barnetillegg: periode.belopBrutto,
                datoFom: periode.periodeFra,
                datoTom: periode.periodeTil,
            })),
        };
        useFormMethods.reset(values);
        oppdaterBehandlingFn.mutation.mutate(createInntektPayload(values));
        setOpplysningerChanges([]);
    };

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                <FormLayout
                    title="Inntekt"
                    main={
                        <Main
                            behandlingRoller={behandling.roller}
                            ainntekt={ainntekt}
                            opplysningerChanges={opplysningerChanges}
                            updateOpplysninger={updateOpplysninger}
                            inntektOpplysninger={inntektOpplysninger}
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
