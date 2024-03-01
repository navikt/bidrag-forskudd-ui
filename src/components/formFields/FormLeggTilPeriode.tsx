import { Button } from "@navikt/ds-react";
import React from "react";

import { useForskudd } from "../../context/ForskuddContext";

const LeggTilPeriodeButton = ({ addPeriode }: { addPeriode: () => void }) => {
    const { lesemodus } = useForskudd();
    if (lesemodus) return null;
    return (
        <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
            + Legg til periode
        </Button>
    );
};

export default LeggTilPeriodeButton;
