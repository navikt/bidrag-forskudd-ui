import behandlingQueryKeys, { toUnderholdskostnadTabQueryParameter } from "@common/constants/behandlingQueryKeys";
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

        return toUnderholdskostnadTabQueryParameter(søknadsBarnUnderholdskostnader[0].gjelderBarn.id, true);
    }, []);

    const activeTab = selectedTab ?? defaultTab;

    return [activeTab, defaultTab];
};
