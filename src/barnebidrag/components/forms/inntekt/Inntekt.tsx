import { Rolletype } from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { InntektHeader } from "@common/components/inntekt/InntektHeader";
import { InntektTableComponent, InntektTableProvider } from "@common/components/inntekt/InntektTableContext";
import { NyOpplysningerAlert } from "@common/components/inntekt/NyOpplysningerAlert";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import urlSearchParams from "@common/constants/behandlingQueryKeys";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { inntekterTablesViewRules } from "@common/helpers/inntektFormHelpers";
import { createInitialValues } from "@common/helpers/inntektFormHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { useOnSaveInntekt } from "@common/hooks/useOnSaveInntekt";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { InntektFormValues } from "@common/types/inntektFormValues";
import { Tabs } from "@navikt/ds-react";
import { getSearchParam } from "@utils/window-utils";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";

const Main = () => {
    const { roller: behandlingRoller, type } = useGetBehandlingV2();
    const [searchParams, setSearchParams] = useSearchParams();

    const roller = behandlingRoller.sort((a, b) => {
        if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
        if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
        return 0;
    });

    function updateSearchparamForTab(currentTabId: string) {
        setSearchParams((params) => {
            params.set(urlSearchParams.inntektTab, currentTabId);
            return params;
        });
    }

    const defaultTab = useMemo(() => {
        const roleId = roller
            .find((rolle) => rolle.id?.toString() === getSearchParam(urlSearchParams.inntektTab))
            ?.id?.toString();
        return roleId ?? roller.find((rolle) => rolle.rolletype === Rolletype.BM).id.toString();
    }, []);

    const selectedTab = searchParams.get(behandlingQueryKeys.inntektTab) ?? defaultTab;

    return (
        <Tabs
            defaultValue={defaultTab}
            value={selectedTab}
            onChange={updateSearchparamForTab}
            className="lg:max-w-[960px] md:max-w-[720px] sm:max-w-[598px]"
        >
            <Tabs.List>
                {roller.map((rolle) => (
                    <Tabs.Tab
                        key={rolle.ident}
                        value={rolle.id.toString()}
                        label={`${ROLE_FORKORTELSER[rolle.rolletype]} ${
                            rolle.rolletype === Rolletype.BM ? "" : rolle.ident
                        }`}
                    />
                ))}
            </Tabs.List>
            {roller.map((rolle) => {
                return (
                    <InntektTableProvider rolle={rolle} type={type}>
                        <Tabs.Panel key={rolle.ident} value={rolle.id.toString()} className="grid gap-y-4">
                            <div className="mt-4">
                                <InntektHeader ident={rolle.ident} />
                            </div>
                            {inntekterTablesViewRules[type][rolle.rolletype].map((tableType) =>
                                InntektTableComponent[tableType]()
                            )}
                        </Tabs.Panel>
                    </InntektTableProvider>
                );
            })}
        </Tabs>
    );
};

const Side = () => {
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
    const { roller } = useGetBehandlingV2();
    const bm = roller.find((rolle) => rolle.rolletype === Rolletype.BM);
    const saveInntekt = useOnSaveInntekt();
    const { watch, getValues, setValue } = useFormContext<InntektFormValues>();
    const [previousValues, setPreviousValues] = useState<string>(getValues(`begrunnelser.${bm.id}`));
    const onSave = () => {
        const begrunnelse = getValues(`begrunnelser.${bm.id}`);
        saveInntekt.mutation.mutate(
            {
                oppdatereBegrunnelse: {
                    nyBegrunnelse: begrunnelse,
                },
            },
            {
                onSuccess: (response) => {
                    saveInntekt.queryClientUpdater((currentData) => ({
                        ...currentData,
                        inntekter: {
                            ...currentData.inntekter,
                            begrunnelser: [
                                {
                                    innhold: response.begrunnelse,
                                    gjelder: bm,
                                    kunINotat: response.begrunnelse,
                                },
                            ],
                        },
                    }));
                    setPreviousValues(response.begrunnelse);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue(`begrunnelser.${bm.id}`, previousValues ?? "");
                        },
                    });
                },
            }
        );
    };
    const onNext = () => onStepChange(STEPS[BarnebidragStepper.BOFORHOLD]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (name.includes("begrunnelser") && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <FormControlledTextarea name={`begrunnelser.${bm.id}`} label={text.title.begrunnelse} />
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
                <NewFormLayout title="Inntekt" main={<Main />} side={<Side />} pageAlert={<NyOpplysningerAlert />} />
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
