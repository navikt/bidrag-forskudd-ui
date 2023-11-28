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
        retry: 3,
    });
    const enableVedtakSkjermbilde = process.env.ENABLE_VEDTAK_SKJERMBILDE;
    const enableInntektSkjermbilde = process.env.ENABLE_INNTEKT_SKJERMBILDE;
    const enableFatteVedtak = process.env.ENABLE_FATTE_VEDTAK;

    function getUserIdsEnabledFor(value: string): string[] {
        if (value == "false" || value == "true") {
            return [];
        }
        return value?.split(",").map((v) => v.trim()) ?? [];
    }
    const userIdsInntekt = getUserIdsEnabledFor(enableInntektSkjermbilde);
    const userIdsVedtak = getUserIdsEnabledFor(enableVedtakSkjermbilde);

    useEffect(() => {
        console.debug(
            `enableVedtakSkjermbilde=${enableVedtakSkjermbilde} enableInntektSkjermbilde=${enableInntektSkjermbilde} enableFatteVedtak=${enableFatteVedtak} process.env.ENABLE_INNTEKT_SKJERMBILDE=${process.env.ENABLE_INNTEKT_SKJERMBILDE} process.env.ENABLE_VEDTAK_SKJERMBILDE=${process.env.ENABLE_VEDTAK_SKJERMBILDE}`
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
        isInntektSkjermbildeEnabled:
            enableInntektSkjermbilde == undefined ||
            enableInntektSkjermbilde == "true" ||
            userIdsInntekt.includes(userId),
        isVedtakSkjermbildeEnabled:
            enableVedtakSkjermbilde == undefined || enableVedtakSkjermbilde == "true" || userIdsVedtak.includes(userId),
    };
}
