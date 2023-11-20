import { SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useFeatureToogle() {
    const { data: userId } = useSuspenseQuery({
        queryKey: ["user"],
        queryFn: () => SecuritySessionUtils.hentSaksbehandlerId(),
    });
    const enableVedtakSkjermbilde = process.env.ENABLE_VEDTAK_SKJERMBILDE;
    const enableInntektSkjermbilde = process.env.ENABLE_INNTEKT_SKJERMBILDE;
    const enableFatteVedtak = process.env.ENABLE_FATTE_VEDTAK;
    console.log(
        `enableVedtakSkjermbilde=${enableVedtakSkjermbilde} enableInntektSkjermbilde=${enableInntektSkjermbilde} enableFatteVedtak=${enableFatteVedtak}`
    );
    return {
        isFatteVedtakEnabled: enableFatteVedtak,
        isInntektSkjermbildeEnabled:
            enableInntektSkjermbilde == undefined ||
            enableInntektSkjermbilde == "true" ||
            enableInntektSkjermbilde.includes(userId),
        isVedtakSkjermbildeEnabled:
            enableVedtakSkjermbilde == undefined ||
            enableVedtakSkjermbilde == "true" ||
            enableVedtakSkjermbilde.includes(userId),
    };
}
