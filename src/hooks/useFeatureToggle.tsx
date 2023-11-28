import { SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useFeatureToogle() {
    const isMockEnabled = process.env.ENABLE_MOCK == "true";
    const { data: userId } = useSuspenseQuery({
        queryKey: ["user"],
        queryFn: () => SecuritySessionUtils.hentSaksbehandlerId(),
        initialData: () => (isMockEnabled ? "" : undefined),
        staleTime: isMockEnabled ? 0 : Infinity,
    });
    const enableVedtakSkjermbilde = process.env.ENABLE_VEDTAK_SKJERMBILDE == "true";
    const enableInntektSkjermbilde = process.env.ENABLE_INNTEKT_SKJERMBILDE == "true";
    const enableFatteVedtak = process.env.ENABLE_FATTE_VEDTAK;

    function getUserIdsEnabledFor(value: string): string[] {
        if (value == "false" || value == "true") {
            return [];
        }
        return value?.split(",").map((v) => v.trim()) ?? [];
    }
    const userIdsInntekt = getUserIdsEnabledFor(process.env.ENABLE_INNTEKT_SKJERMBILDE);
    const userIdsVedtak = getUserIdsEnabledFor(process.env.ENABLE_VEDTAK_SKJERMBILDE);

    useEffect(() => {
        console.debug(
            `enableVedtakSkjermbilde=${enableVedtakSkjermbilde} enableInntektSkjermbilde=${enableInntektSkjermbilde} enableFatteVedtak=${enableFatteVedtak}`
        );
        console.debug(
            "UserIds",
            userId,
            "vedtak",
            userIdsVedtak,
            userIdsVedtak.includes(userId),
            "inntekt",
            userIdsInntekt,
            userIdsInntekt.includes(userId)
        );
    }, [userId]);

    return {
        isFatteVedtakEnabled: enableFatteVedtak,
        isInntektSkjermbildeEnabled: enableInntektSkjermbilde || userIdsInntekt.includes(userId),
        isVedtakSkjermbildeEnabled: enableVedtakSkjermbilde || userIdsVedtak.includes(userId),
    };
}
