import { SecuritySessionUtils } from "@navikt/bidrag-ui-common";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useFeatureToogle() {
    const { data: userId } = useSuspenseQuery({
        queryKey: ["user"],
        queryFn: () => SecuritySessionUtils.hentSaksbehandlerId(),
        initialData: "",
    });
    const enableVedtakSkjermbilde = process.env.ENABLE_VEDTAK_SKJERMBILDE;
    const enableInntektSkjermbilde = process.env.ENABLE_INNTEKT_SKJERMBILDE;
    const enableFatteVedtak = process.env.ENABLE_FATTE_VEDTAK;
    console.debug(
        `enableVedtakSkjermbilde=${enableVedtakSkjermbilde} enableInntektSkjermbilde=${enableInntektSkjermbilde} enableFatteVedtak=${enableFatteVedtak} process.env.ENABLE_INNTEKT_SKJERMBILDE=${process.env.ENABLE_INNTEKT_SKJERMBILDE} process.env.ENABLE_VEDTAK_SKJERMBILDE=${process.env.ENABLE_VEDTAK_SKJERMBILDE}`
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
