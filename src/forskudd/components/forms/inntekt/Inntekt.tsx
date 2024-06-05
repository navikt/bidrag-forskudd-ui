import { Rolletype } from "@api/BidragBehandlingApiV1";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { ForskuddAlert } from "@common/components/ForskuddAlert";
import { FormLayout } from "@common/components/layout/grid/FormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { BodyShort, ExpansionCard, Heading, Tabs } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYHHMMString } from "@utils/date-utils";
import { scrollToHash } from "@utils/window-utils";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useOnSaveInntekt } from "../../../hooks/useOnSaveInntekt";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { InntektFormValues } from "../../../types/inntektFormValues";
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

const NyOpplysningerAlert = () => {
    const { ikkeAktiverteEndringerIGrunnlagsdata } = useGetBehandlingV2();
    const ikkeAktiverteEndringer = Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).filter(
        (i) => i.length > 0
    );

    if (ikkeAktiverteEndringer.length === 0) return null;
    return (
        <ForskuddAlert variant="info">
            <Heading size="xsmall" level="3">
                {text.alert.nyOpplysningerInfo}
            </Heading>
            <BodyShort size="small">
                Nye opplysninger fra offentlige register er tilgjengelig. Oppdatert{" "}
                {DateToDDMMYYYYHHMMString(dateOrNull(ikkeAktiverteEndringer[0][0].innhentetTidspunkt))}.
            </BodyShort>
        </ForskuddAlert>
    );
};

const InntektHeader = ({ ident }: { ident: string }) => {
    const { inntekter } = useGetBehandlingV2();
    const inntekt = inntekter.månedsinntekter?.filter((inntekt) => inntekt.ident === ident);
    return inntekt?.length > 0 ? (
        <div className="grid w-full max-w-[65ch] gap-y-8">
            <InntektChart inntekt={inntekt} />
            <ExpansionCard aria-label="default-demo" size="small">
                <ExpansionCard.Header>
                    <ExpansionCard.Title size="small">{text.title.arbeidsforhold}</ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <QueryErrorWrapper>
                        <Arbeidsforhold ident={ident} />
                    </QueryErrorWrapper>
                </ExpansionCard.Content>
            </ExpansionCard>
        </div>
    ) : (
        <ForskuddAlert variant="info">
            <BodyShort>Ingen inntekt funnet</BodyShort>
        </ForskuddAlert>
    );
};
const Main = () => {
    const { roller: behandlingRoller } = useGetBehandlingV2();
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolletype !== Rolletype.BP)
        .sort((a, b) => {
            if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
            if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
            return 0;
        });
    useEffect(scrollToHash, []);

    return (
        <div className="grid gap-y-2">
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
                            <div className="mt-4">
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
    const { onStepChange, setSaveErrorState } = useForskudd();
    const saveInntekt = useOnSaveInntekt();
    const { watch, getValues, setValue } = useFormContext<InntektFormValues>();
    const [previousValues, setPreviousValues] = useState<string>(getValues("notat.kunINotat"));
    const onSave = () => {
        const [kunINotat] = getValues(["notat.kunINotat"]);
        saveInntekt.mutation.mutate(
            {
                oppdatereNotat: {
                    kunINotat,
                },
            },
            {
                onSuccess: (response) => {
                    saveInntekt.queryClientUpdater((currentData) => ({
                        ...currentData,
                        inntekter: {
                            ...currentData.inntekter,
                            notat: response.notat,
                        },
                    }));
                    setPreviousValues(response.notat.kunINotat);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue("notat.kunINotat", previousValues ?? "");
                        },
                    });
                },
            }
        );
    };
    const onNext = () => onStepChange(STEPS[ForskuddStepper.VEDTAK]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (["notat.kunINotat"].includes(name) && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <FormControlledTextarea name="notat.kunINotat" label={text.title.begrunnelse} />
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
                <FormLayout title="Inntekt" main={<Main />} side={<Side />} pageAlert={<NyOpplysningerAlert />} />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <InntektForm />
        </QueryErrorWrapper>
    );
};
