import { Rolletype } from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import urlSearchParams from "@common/constants/behandlingQueryKeys";
import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { Tabs } from "@navikt/ds-react";
import { getSearchParam } from "@utils/window-utils";
import React, { useMemo } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";
import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { createInitialValues } from "../helpers/UnderholdskostnadFormHelpers";
import { Barnetilsyn } from "./Barnetilsyn";

const Main = () => {
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const underholdskostnader = getValues("underholdskostnader");
    const [searchParams, setSearchParams] = useSearchParams();

    function updateSearchparamForTab(currentTabId: string) {
        setSearchParams((params) => {
            params.set(urlSearchParams.underholdskostnadTab, currentTabId);
            return params;
        });
    }

    const defaultTab = useMemo(() => {
        const underholdskostnadId = underholdskostnader
            .find((underhold) => underhold.id?.toString() === getSearchParam(urlSearchParams.underholdskostnadTab))
            ?.id?.toString();
        return underholdskostnadId ?? underholdskostnader[0]?.id?.toString();
    }, []);

    const selectedTab = searchParams.get(behandlingQueryKeys.underholdskostnadTab) ?? defaultTab;

    return (
        <Tabs
            defaultValue={defaultTab}
            value={selectedTab}
            onChange={updateSearchparamForTab}
            className="lg:max-w-[960px] md:max-w-[720px] sm:max-w-[598px]"
        >
            <Tabs.List>
                {underholdskostnader.map((underhold) => (
                    <Tabs.Tab
                        key={underhold.id}
                        value={underhold.id.toString()}
                        label={underhold.gjelderBarn.medIBehandlingen ? ROLE_FORKORTELSER.BA : ""}
                    />
                ))}
            </Tabs.List>
            {underholdskostnader.map((underhold, index) => {
                return (
                    <Tabs.Panel key={underhold.id} value={underhold.id.toString()} className="grid gap-y-4">
                        <Barnetilsyn index={index} />
                    </Tabs.Panel>
                );
            })}
        </Tabs>
    );
};

const Side = () => {
    const { onStepChange } = useBehandlingProvider();
    const { roller } = useGetBehandlingV2();
    const bm = roller.find((rolle) => rolle.rolletype === Rolletype.BM);
    const onNext = () => onStepChange(STEPS[BarnebidragStepper.INNTEKT]);

    return (
        <>
            <FormControlledTextarea name={`begrunnelser.${bm.id}`} label={text.title.begrunnelse} />
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
                <NewFormLayout title={text.title.underholdskostnad} main={<Main />} side={<Side />} />
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
