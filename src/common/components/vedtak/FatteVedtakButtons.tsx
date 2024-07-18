import { RedirectTo } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, ConfirmationPanel, Heading } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import environment from "../../../environment";
import { BEHANDLING_API_V1 } from "../../constants/api";
import tekster from "../../constants/texts";
import { useBehandlingProvider } from "../../context/BehandlingContext";
import useFeatureToogle from "../../hooks/useFeatureToggle";
import { FlexRow } from "../layout/grid/FlexRow";
import NotatButton from "../NotatButton";
export class MåBekrefteOpplysningerStemmerError extends Error {
    constructor() {
        super("Bekreft at opplysningene stemmer");
    }
}
export const FatteVedtakButtons = ({
    isBeregningError,
    disabled = false,
}: {
    isBeregningError: boolean;
    disabled?: boolean;
}) => {
    const [bekreftetVedtak, setBekreftetVedtak] = useState(false);
    const { isFatteVedtakEnabled } = useFeatureToogle();
    const { behandlingId } = useBehandlingProvider();
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const fatteVedtakFn = useMutation({
        mutationFn: () => {
            if (!bekreftetVedtak) {
                throw new MåBekrefteOpplysningerStemmerError();
            }
            return BEHANDLING_API_V1.api.fatteVedtak(Number(behandlingId));
        },
        onSuccess: () => {
            RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
        },
    });

    const måBekrefteAtOpplysningerStemmerFeil =
        fatteVedtakFn.isError && fatteVedtakFn.error instanceof MåBekrefteOpplysningerStemmerError;

    return (
        <div>
            <ConfirmationPanel
                className="pb-2"
                checked={bekreftetVedtak}
                label={tekster.varsel.bekreftFatteVedtak}
                onChange={() => {
                    setBekreftetVedtak((x) => !x);
                    fatteVedtakFn.reset();
                }}
                error={måBekrefteAtOpplysningerStemmerFeil ? "Du må bekrefte at opplysningene stemmer" : undefined}
            >
                <Heading spacing level="2" size="xsmall">
                    {tekster.title.sjekkNotatOgOpplysninger}
                </Heading>
                <div>
                    {tekster.varsel.vedtakNotat} <NotatButton />
                </div>
            </ConfirmationPanel>
            {fatteVedtakFn.isError && !måBekrefteAtOpplysningerStemmerFeil && (
                <Alert variant="error" className="mt-2 mb-2">
                    <Heading spacing size="small" level="3">
                        {tekster.error.kunneIkkFatteVedtak}
                    </Heading>
                    <BodyShort>{tekster.error.fatteVedtak}</BodyShort>
                </Alert>
            )}
            {fatteVedtakFn.isSuccess && (
                <Alert variant="success" size="small" className={"mt-2 mb-2"}>
                    <Heading size="small" level="3">
                        {tekster.title.vedtakFattet}
                    </Heading>
                    <BodyShort>{tekster.varsel.vedtakFattet}</BodyShort>
                </Alert>
            )}
            <FlexRow>
                <Button
                    loading={fatteVedtakFn.isPending}
                    disabled={isBeregningError || !isFatteVedtakEnabled || fatteVedtakFn.isSuccess || disabled}
                    onClick={() => fatteVedtakFn.mutate()}
                    className="w-max"
                    size="small"
                >
                    {tekster.label.fatteVedtakButton}
                </Button>
            </FlexRow>
        </div>
    );
};
