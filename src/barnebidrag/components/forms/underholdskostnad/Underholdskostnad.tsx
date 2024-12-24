import { Rolletype, UnderholdDto } from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import ModiaLink from "@common/components/inntekt/ModiaLink";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { BodyShort, Tabs, Textarea } from "@navikt/ds-react";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { PersonIdent } from "../../../../common/components/PersonIdent";
import { toUnderholdskostnadTabQueryParameter } from "../../../../common/constants/behandlingQueryKeys";
import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";
import { useGetActiveAndDefaultUnderholdskostnadTab } from "../../../hooks/useGetActiveAndDefaultUnderholdskostnadTab";
import { useOnUpdateUnderholdBegrunnelse } from "../../../hooks/useOnUpdateUnderhold";
import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { createInitialValues } from "../helpers/UnderholdskostnadFormHelpers";
import { AndreBarn } from "./AndreBarn";
import { Barnetilsyn } from "./Barnetilsyn";
import { NyOpplysningerAlert } from "./BarnetilsynOpplysninger";

const Main = () => {
    const { roller } = useGetBehandlingV2();
    const { onNavigateToTab } = useBehandlingProvider();
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const søknadsBarnUnderholdskostnader = getValues("underholdskostnaderMedIBehandling");
    const [activeTab, defaultTab] = useGetActiveAndDefaultUnderholdskostnadTab();
    const BMRolle = roller.find((rolle) => rolle.rolletype === Rolletype.BM);

    return (
        <>
            {BMRolle.harInnvilgetTilleggsstønad && (
                <BehandlingAlert variant="info">
                    <BodyShort size="small">{text.alert.harInnvilgetTilleggsstønad}</BodyShort>
                    <ModiaLink ident={BMRolle.ident} />
                </BehandlingAlert>
            )}
            <Tabs
                defaultValue={defaultTab}
                value={activeTab}
                onChange={onNavigateToTab}
                className="lg:max-w-[960px] md:max-w-[720px] sm:max-w-[598px]"
            >
                <Tabs.List>
                    {søknadsBarnUnderholdskostnader.map((underhold) => (
                        <Tabs.Tab
                            key={`tab-${underhold.gjelderBarn.id}`}
                            value={toUnderholdskostnadTabQueryParameter(underhold.gjelderBarn.id, true)}
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
                            key={`underholdskostnadTabPanel-${underhold.gjelderBarn.id}`}
                            value={toUnderholdskostnadTabQueryParameter(underhold.gjelderBarn.id, true)}
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
        </>
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
    const saveUnderhold = useOnUpdateUnderholdBegrunnelse();
    const fieldName = tabIsAndreBarn
        ? "underholdskostnaderAndreBarnBegrunnelse"
        : (`${field as "underholdskostnaderMedIBehandling"}.${fieldIndex}.begrunnelse` as const);
    const [previousValue, setPreviousValue] = useState<string>(getValues(fieldName));

    const onNext = () => onStepChange(STEPS[BarnebidragStepper.INNTEKT]);

    const onSave = () => {
        const begrunnelse = getValues(fieldName);
        saveUnderhold.mutation.mutate(
            {
                begrunnelse,
                underholdsid: Number(underholdId),
            },
            {
                onSuccess: () => {
                    saveUnderhold.queryClientUpdater((currentData) => {
                        const underholdIndex = currentData.underholdskostnader.findIndex(
                            (underhold) => underhold.id === Number(underholdId)
                        );

                        const updatedUnderholdskostnader = tabIsAndreBarn
                            ? currentData.underholdskostnader.map((underhold) => ({
                                  ...underhold,
                                  begrunnelse: underhold.gjelderBarn.medIBehandlingen
                                      ? underhold.begrunnelse
                                      : begrunnelse,
                              }))
                            : currentData.underholdskostnader.toSpliced(Number(underholdIndex), 1, {
                                  ...currentData.underholdskostnader[underholdIndex],
                                  begrunnelse: begrunnelse,
                              });

                        return {
                            ...currentData,
                            underholdskostnader: updatedUnderholdskostnader,
                        };
                    });
                    setPreviousValue(begrunnelse);
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

    useEffect(() => {
        const underholdskostnaderMedIBehandling = underholdskostnader.filter(
            (underhold) => underhold.gjelderBarn.medIBehandlingen
        );
        const underholdskostnaderAndreBarn = underholdskostnader.filter(
            (underhold) => !underhold.gjelderBarn.medIBehandlingen
        );

        const checkForBegrunnelseValidationError = (underhold: UnderholdDto, index: number) => {
            if (underhold?.valideringsfeil?.manglerBegrunnelse) {
                const fieldName = underhold.gjelderBarn.medIBehandlingen
                    ? (`underholdskostnaderMedIBehandling.${index}.begrunnelse` as const)
                    : ("underholdskostnaderAndreBarnBegrunnelse" as const);
                useFormMethods.setError(fieldName, {
                    type: "notValid",
                    message: text.error.feltErPåkrevd,
                });
            }
        };

        underholdskostnaderMedIBehandling.forEach(checkForBegrunnelseValidationError);
        underholdskostnaderAndreBarn.forEach(checkForBegrunnelseValidationError);
    }, []);

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
