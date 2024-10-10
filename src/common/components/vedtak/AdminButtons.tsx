import { BodyShort, Button, Loader } from "@navikt/ds-react";
import React, { Suspense } from "react";

import { TypeBehandling } from "../../../api/BidragBehandlingApiV1";
import { formatterBeløp } from "../../../utils/number-utils";
import { useBehandlingProvider } from "../../context/BehandlingContext";
import { useGetBehandlingV2, useGetBeregningInnteksgrenseSærbidrag } from "../../hooks/useApiData";
import useFeatureToogle from "../../hooks/useFeatureToggle";

export function AdminButtons() {
    const { isAdminEnabled } = useFeatureToogle();
    const { behandlingId, vedtakId } = useBehandlingProvider();
    const { type } = useGetBehandlingV2();
    if (!isAdminEnabled) return null;

    return (
        <div className="flex flex-row gap-5 border-t border-b-0 border-r-0 border-l-0 border-solid">
            <Button
                variant="tertiary-neutral"
                size="small"
                onClick={() => {
                    if (vedtakId) {
                        window.open(
                            `${window.location.origin}/admin/vedtak/explorer/?erBehandlingId=false&id=${vedtakId}&graftype=flowchart`
                        );
                    } else {
                        window.open(
                            `${window.location.origin}/admin/vedtak/explorer/?erBehandlingId=true&id=${behandlingId}&graftype=flowchart`
                        );
                    }
                }}
            >
                Vis vedtaksgraf
            </Button>
            {type === TypeBehandling.SAeRBIDRAG && <InnteksgrenseButton />}
        </div>
    );
}

const InnteksgrenseButton: React.FC = () => {
    const [showInnteksgrense, setShowInnteksgrense] = React.useState(true);

    return (
        <Suspense
            fallback={
                <BodyShort size="small" className="flex flex-row gap-4 self-center">
                    Henter BPs laveste inntekt for evne
                    <Loader size="xsmall" />
                </BodyShort>
            }
        >
            {!showInnteksgrense && (
                <Button variant="tertiary-neutral" size="small" onClick={() => setShowInnteksgrense(true)}>
                    Hent BPs laveste inntekt for evne
                </Button>
            )}
            {showInnteksgrense && <Innteksgrense />}
        </Suspense>
    );
};
const Innteksgrense: React.FC = () => {
    const { data: innteksgrense } = useGetBeregningInnteksgrenseSærbidrag();

    return (
        <BodyShort size="small" className="self-center">
            BPs laveste inntekt for evne: {formatterBeløp(innteksgrense, true)}
        </BodyShort>
    );
};
