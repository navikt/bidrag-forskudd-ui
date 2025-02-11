import { faro } from "@grafana/faro-react";
import { RedirectTo } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, ConfirmationPanel, Heading, Select } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { useParams } from "react-router-dom";

import { TypeBehandling } from "../../../api/BidragBehandlingApiV1";
import { useQueryParams } from "../../../barnebidrag/hooks/useQueryparams";
import environment from "../../../environment";
import { BEHANDLING_API_V1 } from "../../constants/api";
import tekster from "../../constants/texts";
import { useBehandlingProvider } from "../../context/BehandlingContext";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
import useFeatureToogle from "../../hooks/useFeatureToggle";
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
    const { isAdminEnabled } = useFeatureToogle();
    const [showConfetti, setShowConfetti] = useState(false);
    const [bekreftetVedtak, setBekreftetVedtak] = useState(false);
    const { behandlingId, type } = useBehandlingProvider();
    const erBarnebidrag = type === TypeBehandling.BIDRAG;
    const [innkrevingUtsattAntallDager, setInnkrevingUtsattAntallDager] = useState<number | null>(
        erBarnebidrag ? 3 : null
    );
    const { engangsbeløptype, stønadstype } = useGetBehandlingV2();
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const enhet = useQueryParams().get("enhet");
    const fatteVedtakFn = useMutation({
        mutationFn: () => {
            if (!bekreftetVedtak) {
                throw new MåBekrefteOpplysningerStemmerError();
            }
            return BEHANDLING_API_V1.api.fatteVedtak(Number(behandlingId), { innkrevingUtsattAntallDager, enhet });
        },
        onSuccess: () => {
            faro.api.pushEvent(`fatte.vedtak`, {
                behandlingId: behandlingId?.toString() ?? "Ukjent",
                stønadstype,
                engangsbeløptype,
                behandlingType: type,
            });
            RedirectTo.sakshistorikk(saksnummer, environment.url.bisys);
            if (erBarnebidrag && isAdminEnabled) {
                setShowConfetti(true);
            }
        },
    });

    const måBekrefteAtOpplysningerStemmerFeil =
        fatteVedtakFn.isError && fatteVedtakFn.error instanceof MåBekrefteOpplysningerStemmerError;

    return (
        <div>
            {showConfetti && <Confetti />}
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
                    {utsettDagerListe.map((dager, index) => (
                        <option value={dager} key={dager + "-" + index}>
                            {dager} dager
                        </option>
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

export default function Confetti() {
    const refAnimationInstance = useRef(null);

    const getInstance = useCallback((instance) => {
        refAnimationInstance.current = instance;
    }, []);

    const makeShot = useCallback((particleRatio, opts) => {
        if (refAnimationInstance.current) {
            refAnimationInstance.current.confetti({
                ...opts,
                origin: { y: 0.7 },
                particleCount: Math.floor(200 * particleRatio),
            });
        }
    }, []);

    useEffect(() => fire(), []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        makeShot(0.2, {
            spread: 60,
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, [makeShot]);

    return (
        <ReactCanvasConfetti
            onInit={(ref) => getInstance(ref)}
            style={{
                position: "fixed",
                pointerEvents: "none",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
            }}
        />
    );
}
