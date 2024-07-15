import { RolleDto, Rolletype } from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { Barnetillegg } from "@common/components/inntekt/Barnetillegg";
import { BeregnetInntekter } from "@common/components/inntekt/BeregnetInntekter";
import { InntektHeader } from "@common/components/inntekt/InntektHeader";
import { Kontantstøtte } from "@common/components/inntekt/Kontantstoette";
import { NyOpplysningerAlert } from "@common/components/inntekt/NyOpplysningerAlert";
import { SkattepliktigeOgPensjonsgivende } from "@common/components/inntekt/SkattepliktigeOgPensjonsgivende";
import { Småbarnstillegg } from "@common/components/inntekt/Smaabarnstilleg";
import { UtvidetBarnetrygd } from "@common/components/inntekt/UtvidetBarnetrygd";
import { FormLayout } from "@common/components/layout/grid/FormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { createInitialValues } from "@common/helpers/inntektFormHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { useOnSaveInntekt } from "@common/hooks/useOnSaveInntekt";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { InntektFormValues } from "@common/types/inntektFormValues";
import { Tabs } from "@navikt/ds-react";
import { scrollToHash } from "@utils/window-utils";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { STEPS } from "../../../constants/steps";
import { SærligeutgifterStepper } from "../../../enum/SærligeutgifterStepper";

const Main = () => {
    const { roller: behandlingRoller } = useGetBehandlingV2();
    const roller = behandlingRoller.sort((a, b) => {
        if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
        if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
        return 0;
    });
    useEffect(scrollToHash, []);

    function renderInntektTables(rolle: RolleDto) {
        switch (rolle.rolletype) {
            case Rolletype.BM:
                return (
                    <>
                        <Barnetillegg ident={rolle.ident} />
                        <UtvidetBarnetrygd ident={rolle.ident} />
                        <Småbarnstillegg ident={rolle.ident} />
                        <Kontantstøtte ident={rolle.ident} />
                        <BeregnetInntekter rolle={rolle} />
                    </>
                );
            case Rolletype.BP:
                return (
                    <>
                        <Barnetillegg ident={rolle.ident} />
                        <BeregnetInntekter rolle={rolle} />
                    </>
                );

            case Rolletype.BA:
                return (
                    <>
                        <BeregnetInntekter rolle={rolle} />
                    </>
                );
        }
    }

    return (
        <div className="grid gap-y-2">
            <Tabs defaultValue={roller.find((rolle) => rolle.rolletype === Rolletype.BM).ident}>
                <Tabs.List>
                    {roller.map((rolle) => (
                        <Tabs.Tab
                            key={rolle.ident}
                            value={rolle.ident}
                            label={`${ROLE_FORKORTELSER[rolle.rolletype]} ${
                                [Rolletype.BM, Rolletype.BP].includes(rolle.rolletype) ? "" : rolle.ident
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
                            {renderInntektTables(rolle)}
                        </Tabs.Panel>
                    );
                })}
            </Tabs>
        </div>
    );
};

const Side = () => {
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
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
    const onNext = () => onStepChange(STEPS[SærligeutgifterStepper.BOFORHOLD]);

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
    const initialValues = useMemo(
        () => createInitialValues(roller, inntekter, virkningsdato),
        [roller, inntekter, virkningsdato]
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
