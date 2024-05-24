import { HelpText } from "@navikt/ds-react";
import { ReactNode } from "react";

type HjelpetekstTabellProps = {
    innhold: string | ReactNode;
    tittel: string;
};
export default function HjelpetekstTabell({ innhold, tittel }: HjelpetekstTabellProps) {
    return (
        <HelpText title={tittel} placement="right" wrapperClassName="self-center">
            {typeof innhold == "string" ? <div dangerouslySetInnerHTML={{ __html: innhold }}></div> : innhold}
        </HelpText>
    );
}
