import { BodyShort } from "@navikt/ds-react";

import { PersonIdent } from "./PersonIdent";
import { PersonNavn } from "./PersonNavn";

export default function PersonNavnIdent({
    navn,
    ident,
    variant = "default",
}: {
    navn?: string;
    ident: string;
    variant?: "compact" | "default";
}) {
    if (variant === "default") {
        return (
            <BodyShort size="small" className="flex items-center gap-4">
                <PersonNavn bold navn={navn} ident={ident} />
                <PersonIdent ident={ident} />
            </BodyShort>
        );
    }
    return (
        <BodyShort size="small" className="gap-2">
            <PersonNavn navn={navn} /> / <PersonIdent ident={ident} />
        </BodyShort>
    );
}
