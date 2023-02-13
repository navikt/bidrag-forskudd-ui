import { CopyToClipboard } from "@navikt/ds-react-internal";
import React from "react";

import { IRollerUi } from "../types/bidrag-sak";
import { RolleTag } from "./RolleTag";

export const RolleDetaljer = ({ rolle, withBorder = true }: { rolle: IRollerUi; withBorder?: boolean }) => {
    return (
        <div
            className={`px-6 py-2 ${
                withBorder && "border-[var(--a-border-divider)] border-solid border-b"
            } flex items-center`}
        >
            <RolleTag rolleType={rolle.type} />
            <span className="w-64">{rolle.fulltNavn}</span>
            <span className="mx-4">/</span> {rolle.fodselsnummer}
            <CopyToClipboard size="small" copyText={rolle.fodselsnummer} popoverText="Kopierte fødselsnummeret" />
        </div>
    );
};
