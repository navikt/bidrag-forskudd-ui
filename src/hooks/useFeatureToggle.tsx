import { SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useFlag, useUnleashClient, useUnleashContext } from "@unleash/proxy-client-react";
import { useEffect } from "react";

export default function useFeatureToogle() {
    const isMockEnabled = process.env.ENABLE_MOCK == "true";
    const { data: userId } = useSuspenseQuery({
        queryKey: ["user"],
        queryFn: () => SecuritySessionUtils.hentSaksbehandlerId(),
        initialData: () => (isMockEnabled ? "" : undefined),
        staleTime: isMockEnabled ? 0 : Infinity,
    });
    const enableInntektSkjermbilde = useFlag("behandling.skjermbilde.inntekter");
    const enableVedtakSkjermbilde = useFlag("behandling.skjermbilde.vedtak");
    const enableFatteVedtak = useFlag("behandling.fattevedtak");
    const updateContext = useUnleashContext();
    const client = useUnleashClient();

    useEffect(() => {
        updateContext({
            userId,
            properties: {
                inforingsgruppen: userId,
                testbrukere: userId,
            },
        });
        console.log(client.getAllToggles(), client.getContext());
    }, [userId]);

    useEffect(() => {
        console.log(
            "enableVedtakSkjermbilde",
            enableVedtakSkjermbilde,
            "enableInntektSkjermbilde",
            enableInntektSkjermbilde,
            "enableFatteVedtak",
            enableFatteVedtak
        );
    }, [enableVedtakSkjermbilde, enableInntektSkjermbilde, enableFatteVedtak]);
    return {
        isFatteVedtakEnabled: enableFatteVedtak,
        isInntektSkjermbildeEnabled: enableInntektSkjermbilde,
        isVedtakSkjermbildeEnabled: enableVedtakSkjermbilde,
    };
}
