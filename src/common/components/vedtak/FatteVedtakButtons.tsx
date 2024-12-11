import { faro } from "@grafana/faro-react";
import { RedirectTo } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, ConfirmationPanel, Heading, Select } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { TypeBehandling } from "../../../api/BidragBehandlingApiV1";
import environment from "../../../environment";
import { BEHANDLING_API_V1 } from "../../constants/api";
import tekster from "../../constants/texts";
import { useBehandlingProvider } from "../../context/BehandlingContext";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
import { FlexRow } from "../layout/grid/FlexRow";
import NotatButton from "../NotatButton";
export class MåBekrefteOpplysningerStemmerError extends Error {
    constructor() {
        super("Bekreft at opplysningene stemmer");
    }
}

const utsettDagerListe = [3, 4, 5, 6, 7, 8, 9];
export const FatteVedtakButtons = ({
    isBeregningError,
    disabled = false,
}: {
    isBeregningError: boolean;
    disabled?: boolean;
}) => {
    const [bekreftetVedtak, setBekreftetVedtak] = useState(false);
    const { behandlingId, type } = useBehandlingProvider();
    const erBarnebidrag = type === TypeBehandling.BIDRAG;
    const [innkrevingUtsattAntallDager, setInnkrevingUtsattAntallDager] = useState<number | null>(
        erBarnebidrag ? 3 : null
    );
    const { engangsbeløptype, stønadstype } = useGetBehandlingV2();
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const fatteVedtakFn = useMutation({
        mutationFn: () => {
            if (!bekreftetVedtak) {
                throw new MåBekrefteOpplysningerStemmerError();
            }
            return BEHANDLING_API_V1.api.fatteVedtak(Number(behandlingId), { innkrevingUtsattAntallDager });
        },
        onSuccess: () => {
            faro.api.pushEvent(`fatte.vedtak`, {
                behandlingId: behandlingId?.toString() ?? "Ukjent",
                stønadstype,
                engangsbeløptype,
                behandlingType: type,
            });
            RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
        },
    });

    const måBekrefteAtOpplysningerStemmerFeil =
        fatteVedtakFn.isError && fatteVedtakFn.error instanceof MåBekrefteOpplysningerStemmerError;

    return (
        <div>
            {erBarnebidrag && (
                <Select
                    size="small"
                    onChange={(e) =>
                        setInnkrevingUtsattAntallDager(e.target.value === "" ? null : Number(e.target.value))
                    }
                    defaultValue={innkrevingUtsattAntallDager}
                    label="Utsett overføring til regnskap"
                    className="w-max pb-2"
                >
                    <option value="">Ikke utsett</option>
                    {utsettDagerListe.map((dager) => (
                        <option value={dager}>{dager} dager</option>
                    ))}
                </Select>
            )}
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
                <div className="text-wrap">
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
                    disabled={isBeregningError || fatteVedtakFn.isSuccess || disabled}
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
