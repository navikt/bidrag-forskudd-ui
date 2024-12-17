import { BodyShort } from "@navikt/ds-react";

import { ISODateTimeStringToDDMMYYYYString } from "../../utils/date-utils";
import { PersonIdent } from "./PersonIdent";
import { PersonNavn } from "./PersonNavn";

export default function PersonNavnIdent({
    navn,
    ident,
    fødselsdato,
    variant = "default",
}: {
    navn?: string;
    ident?: string;
    fødselsdato?: string;
    variant?: "compact" | "default";
}) {
    if (variant === "default") {
        return (
            <BodyShort size="small" className="flex items-center gap-4">
                <PersonNavn bold navn={navn} ident={ident} />
                {ident ? <PersonIdent ident={ident} /> : <span>{ISODateTimeStringToDDMMYYYYString(fødselsdato)}</span>}
            </BodyShort>
        );
    }
    return (
        <BodyShort size="small" className="gap-2">
            <PersonNavn navn={navn} /> /{" "}
            {ident ? <PersonIdent ident={ident} /> : <span>{ISODateTimeStringToDDMMYYYYString(fødselsdato)}</span>}
        </BodyShort>
    );
}
