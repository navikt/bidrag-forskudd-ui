import { faro } from "@grafana/faro-react";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { LocalStorage } from "@navikt/bidrag-ui-common";
import { Button } from "@navikt/ds-react";
import { useEffect, useState } from "react";

import { TypeBehandling } from "../../api/BidragBehandlingApiV1";
import elementIds from "../../common/constants/elementIds";
import { useBehandlingProvider } from "../../common/context/BehandlingContext";
import environment from "../../environment";
import { BarnebidragStepper } from "../enum/BarnebidragStepper";

export default function EksterneLenkerKnapper() {
    return (
        <div className="agroup fixed bottom-0 right-0 p-2 flex items-end justify-end w-max h-0 flex-row gap-[5px]">
            <BrukerveiledningKnapp />
        </div>
    );
}
function BrukerveiledningKnapp() {
    const nudgeEnabledName = "brukerveiledningShowNudge";
    const { activeStep } = useBehandlingProvider();
    const [nudge, setNudge] = useState(LocalStorage.get(nudgeEnabledName) !== "false");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setNudge(false);
            LocalStorage.set(nudgeEnabledName, "false");
        }, 5000);
        return () => clearTimeout(timeoutId);
    }, []);
    function renderHref() {
        switch (activeStep) {
            case BarnebidragStepper.VIRKNINGSTIDSPUNKT:
                return elementIds.brukerveildning.tittel_virkningstidspunkt;
            case BarnebidragStepper.BOFORHOLD:
                return elementIds.brukerveildning.tittel_boforhold;
            case BarnebidragStepper.UNDERHOLDSKOSTNAD:
                return elementIds.brukerveildning.tittel_underholdskostnad;
            case BarnebidragStepper.GEBYR:
                return elementIds.brukerveildning.tittel_gebyr;
            case BarnebidragStepper.INNTEKT:
                return elementIds.brukerveildning.tittel_inntekt;
            case BarnebidragStepper.VEDTAK:
                return elementIds.brukerveildning.tittel_vedtak;
            case BarnebidragStepper.SAMVÆR:
                return elementIds.brukerveildning.tittel_samvær;
            default:
                return "";
        }
    }
    return (
        <div>
            <Button
                title="Brukerveiledning"
                variant="tertiary"
                className={`rounded-xl border-solid ${
                    nudge ? "animate-bounce border-[var(--a-border-success)] border-[2px]" : "border"
                } `}
                size="xsmall"
                icon={<ExternalLinkIcon />}
                onClick={() => {
                    faro.api.pushEvent("click.button.brukerveiledning", { type: TypeBehandling.BIDRAG });
                    window.open(environment.url.bidragBrukerveiledning + "#" + renderHref(), "_blank");
                }}
            >
                Brukerveiledning
            </Button>
        </div>
    );
}
