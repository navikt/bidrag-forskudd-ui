import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { UnderholdskostnadFormValues } from "../types/underholdskostnadFormValues";

export const useGetActiveAndDefaultUnderholdskostnadTab = () => {
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const søknadsBarnUnderholdskostnader = getValues("underholdskostnaderMedIBehandling");
    const [searchParams] = useSearchParams();
    const selectedTab = searchParams.get(behandlingQueryKeys.tab);

    const defaultTab = useMemo(() => {
        if (selectedTab) {
            return selectedTab;
        }

        return `underholdskostnaderMedIBehandling-${søknadsBarnUnderholdskostnader[0]?.id}-0`;
    }, []);

    const activeTab = selectedTab ?? defaultTab;

    return [activeTab, defaultTab];
};
