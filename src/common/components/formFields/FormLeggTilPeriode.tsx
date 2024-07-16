import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Button } from "@navikt/ds-react";
import React from "react";

import texts from "../../constants/texts";
import { useInntektTableProvider } from "../inntekt/InntektTableContext";

const LeggTilPeriodeButton = ({ addPeriode, buttonLabel }: { addPeriode: () => void; buttonLabel?: string }) => {
    const { lesemodus } = useBehandlingProvider();
    const { viewOnly } = useInntektTableProvider();
    if (lesemodus || viewOnly) return null;
    return (
        <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
            {buttonLabel ?? texts.label.leggTilPeriode}
        </Button>
    );
};

export default LeggTilPeriodeButton;
