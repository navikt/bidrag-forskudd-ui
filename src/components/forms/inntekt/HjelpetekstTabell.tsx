import { ReadMore } from "@navikt/ds-react";
import { ReactNode } from "react";

type HjelpetekstTabellProps = {
    innhold: string | ReactNode;
};
export default function HjelpetekstTabell({ innhold }: HjelpetekstTabellProps) {
    return (
        <ReadMore size="small" header="Brukerveiledning">
            {typeof innhold == "string" ? <div dangerouslySetInnerHTML={{ __html: innhold }}></div> : innhold}
        </ReadMore>
    );
}
