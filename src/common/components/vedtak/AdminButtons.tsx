import { Button } from "@navikt/ds-react";

import { useBehandlingProvider } from "../../context/BehandlingContext";
import useFeatureToogle from "../../hooks/useFeatureToggle";

export function AdminButtons() {
    const { isAdminEnabled } = useFeatureToogle();
    const { behandlingId, vedtakId } = useBehandlingProvider();
    if (!isAdminEnabled) return null;

    return (
        <div className="border-t border-b-0 border-r-0 border-l-0 border-solid">
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
        </div>
    );
}
