import { Heading } from "@navikt/ds-react";
import { CopyToClipboard } from "@navikt/ds-react-internal";
import React, { memo } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { RolleDetaljer } from "../RolleDetaljer";

export const ForskuddHeader = memo(() => {
    const { behandling } = useForskudd();

    return (
        <div className="bg-[var(--a-gray-50)] border-[var(--a-border-divider)] border-solid border-b">
            <Heading
                level="1"
                size="xlarge"
                className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
            >
                Søknad om forskudd{" "}
                <span className="text-base flex items-center font-normal">
                    Saksnr. {behandling.saksnummer}{" "}
                    <CopyToClipboard size="small" copyText={behandling.saksnummer} popoverText="Kopierte saksnummer" />
                </span>
            </Heading>
            <div className="grid grid-cols-[max-content_auto]">
                {behandling.roller?.map((rolle, i) => (
                    <RolleDetaljer key={rolle.ident + i} rolle={rolle} withBorder={false} />
                ))}
            </div>
        </div>
    );
});
