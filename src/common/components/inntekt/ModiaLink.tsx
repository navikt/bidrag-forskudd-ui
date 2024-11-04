import { faro } from "@grafana/faro-react";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";

import environment from "../../../environment";

type ModiaLinkProps = {
    ident: string;
};
export default function ModiaLink({ ident }: ModiaLinkProps) {
    const modiaLenke = `${environment.url.modia}/person?sokFnr=${ident}`;

    return (
        <Link
            href={modiaLenke}
            target="_blank"
            className="font-bold"
            onClick={() => faro.api.pushEvent("click.link.modia")}
        >
            Modia <ExternalLinkIcon aria-hidden />
        </Link>
    );
}
