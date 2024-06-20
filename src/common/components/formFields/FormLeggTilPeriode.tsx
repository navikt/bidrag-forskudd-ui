import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Button } from "@navikt/ds-react";
import React from "react";

import texts from "../../constants/texts";

const LeggTilPeriodeButton = ({ addPeriode }: { addPeriode: () => void }) => {
    const { lesemodus } = useBehandlingProvider();
    if (lesemodus) return null;
    return (
        <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
            {texts.label.leggTilPeriode}
        </Button>
    );
};

export default LeggTilPeriodeButton;
