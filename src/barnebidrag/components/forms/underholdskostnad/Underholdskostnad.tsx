import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import urlSearchParams from "@common/constants/behandlingQueryKeys";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { Tabs, Textarea } from "@navikt/ds-react";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { PersonIdent } from "../../../../common/components/PersonIdent";
import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";
import { useGetActiveAndDefaultUnderholdskostnadTab } from "../../../hooks/useGetActiveAndDefaultUnderholdskostnadTab";
import { useOnUpdateUnderhold } from "../../../hooks/useOnUpdateUnderhold";
import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { createInitialValues } from "../helpers/UnderholdskostnadFormHelpers";
import { AndreBarn } from "./AndreBarn";
import { Barnetilsyn } from "./Barnetilsyn";
import { NyOpplysningerAlert } from "./BarnetilsynOpplysninger";

const Main = () => {
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const søknadsBarnUnderholdskostnader = getValues("underholdskostnaderMedIBehandling");
    const [activeTab, defaultTab] = useGetActiveAndDefaultUnderholdskostnadTab();
    const [_, setSearchParams] = useSearchParams();

    function updateSearchparamForTab(currentTabId: string) {
        setSearchParams((params) => {
            params.set(urlSearchParams.tab, currentTabId);
            return params;
        });
    }

    return (
        <Tabs
            defaultValue={defaultTab}
            value={activeTab}
            onChange={updateSearchparamForTab}
            className="lg:max-w-[960px] md:max-w-[720px] sm:max-w-[598px]"
        >
            <Tabs.List>
                {søknadsBarnUnderholdskostnader.map((underhold, index) => (
                    <Tabs.Tab
                        key={`tab-${underhold.id}-${index}`}
                        value={`underholdskostnaderMedIBehandling-${underhold.id}-${index}`}
                        label={
                            <div className="flex flex-row gap-1">
                                {ROLE_FORKORTELSER.BA} <PersonIdent ident={underhold.gjelderBarn.ident} />
                            </div>
                        }
                    />
                ))}
                <Tabs.Tab
                    key="underholdskostnaderAndreBarn"
                    value="underholdskostnaderAndreBarn"
                    label={text.label.andreBarn}
                />
            </Tabs.List>
            {søknadsBarnUnderholdskostnader.map((underhold, index) => {
                return (
                    <Tabs.Panel
                        key={`underholdskostnadTabPanel-${underhold.id}-${index}`}
                        value={`underholdskostnaderMedIBehandling-${underhold.id}-${index}`}
                        className="grid gap-y-4 py-4"
                    >
                        <Barnetilsyn index={index} />
                    </Tabs.Panel>
                );
            })}
            <Tabs.Panel value="underholdskostnaderAndreBarn" className="grid gap-y-4">
                <AndreBarn />
            </Tabs.Panel>
        </Tabs>
    );
};

const Side = () => {
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
    const [activeTab] = useGetActiveAndDefaultUnderholdskostnadTab();
    const [field, id, index] = activeTab.split("-");
    const { watch, getValues, setValue } = useFormContext<UnderholdskostnadFormValues>();
    const tabIsAndreBarn = field === "underholdskostnaderAndreBarn";
    const fieldIndex = tabIsAndreBarn ? 0 : Number(index);
    const underholdId = tabIsAndreBarn ? getValues(field)[0]?.id : id;
    const saveUnderhold = useOnUpdateUnderhold(Number(underholdId));
    const fieldName =
        `${field as "underholdskostnaderMedIBehandling" | "underholdskostnaderAndreBarn"}.${fieldIndex}.begrunnelse` as const;
    const [previousValue, setPreviousValue] = useState<string>(getValues(fieldName));

    const onNext = () => onStepChange(STEPS[BarnebidragStepper.INNTEKT]);

    const onSave = () => {
        const begrunnelse = getValues(fieldName);
        saveUnderhold.mutation.mutate(
            {
                begrunnelse,
            },
            {
                onSuccess: (response) => {
                    saveUnderhold.queryClientUpdater((currentData) => {
                        const underholdIndex = currentData.underholdskostnader.findIndex(
                            (underhold) => underhold.id === Number(underholdId)
                        );

                        const updatedUnderholdskostnader = tabIsAndreBarn
                            ? currentData.underholdskostnader.map((underhold) => ({
                                  ...underhold,
                                  begrunnelse: underhold.gjelderBarn.medIBehandlingen
                                      ? underhold.begrunnelse
                                      : response.begrunnelse,
                              }))
                            : currentData.underholdskostnader.toSpliced(Number(underholdIndex), 1, {
                                  ...currentData.underholdskostnader[underholdIndex],
                                  begrunnelse: response.begrunnelse,
                              });

                        return {
                            ...currentData,
                            underholdskostnader: updatedUnderholdskostnader,
                        };
                    });
                    setPreviousValue(response.begrunnelse);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue(fieldName, previousValue ?? "");
                        },
                    });
                },
            }
        );
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (name.includes(fieldName) && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, [fieldName]);

    return (
        <>
            {underholdId && <FormControlledTextarea key={fieldName} name={fieldName} label={text.title.begrunnelse} />}
            {!underholdId && <Textarea label={text.title.begrunnelse} size="small" readOnly={true} />}
            <ActionButtons onNext={onNext} />
        </>
    );
};

const UnderholdskostnadForm = () => {
    const { underholdskostnader } = useGetBehandlingV2();
    const initialValues = useMemo(() => createInitialValues(underholdskostnader), [underholdskostnader]);
    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <NewFormLayout
                    title={text.title.underholdskostnad}
                    main={<Main />}
                    side={<Side />}
                    pageAlert={<NyOpplysningerAlert />}
                />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <UnderholdskostnadForm />
        </QueryErrorWrapper>
    );
};
