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
            <BodyShort className="flex items-center gap-4">
                <BodyShort size="small" className="font-bold">
                    <PersonNavn navn={navn} ident={ident} />
                </BodyShort>
                <BodyShort size="small">
                    <PersonIdent ident={ident} />
                </BodyShort>
            </BodyShort>
        );
    }
    return (
        <BodyShort size="small" className="gap-2">
            <PersonNavn navn={navn} /> / <PersonIdent ident={ident} />
        </BodyShort>
    );
}
