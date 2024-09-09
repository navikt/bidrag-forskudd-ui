import { SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { useQuery } from "@tanstack/react-query";
import { useFlag, useUnleashClient } from "@unleash/proxy-client-react";
import { useEffect } from "react";

export default function useFeatureToogle() {
    const isMockEnabled = process.env.ENABLE_MOCK === "true";
    const enableFatteVedtak = useFlag("behandling.fattevedtak");
    const enableAdmin = useFlag("behandling.admin");
    const særbidragBetaltAvBp = useFlag("sarbidrag_utgift_betalt_av_bp");
    const enableBehandlingVesntremeny = useFlag("behandling_vesntremeny");
    const client = useUnleashClient();
    const { data: userId } = useQuery({
        queryKey: ["user"],
        queryFn: async () => SecuritySessionUtils.hentSaksbehandlerId(),
        initialData: () => (isMockEnabled ? "" : undefined),
        staleTime: isMockEnabled ? 0 : Infinity,
    });

    useEffect(() => {
        client.updateContext({
            userId,
        });
    }, [userId]);

    useEffect(() => {
        console.debug(
            "enableFatteVedtak",
            enableFatteVedtak,
            "enableAdmin",
            enableAdmin,
            "særbidragBetaltAvBp",
            særbidragBetaltAvBp
        );
    }, [enableFatteVedtak, enableAdmin, særbidragBetaltAvBp]);
    return {
        isAdminEnabled: enableAdmin,
        isFatteVedtakEnabled: enableFatteVedtak,
        isSærbidragBetaltAvBpEnabled: særbidragBetaltAvBp,
        isbehandlingVesntremenyEnabled: enableBehandlingVesntremeny,
    };
}
