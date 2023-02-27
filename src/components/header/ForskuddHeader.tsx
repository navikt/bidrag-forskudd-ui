import { Heading } from "@navikt/ds-react";
import { CopyToClipboard } from "@navikt/ds-react-internal";
import React, { memo } from "react";

import { useApiData } from "../../hooks/useApiData";
import { RolleDetaljer } from "../RolleDetaljer";

export const ForskuddHeader = memo(({ saksnummer }: { saksnummer: string }) => {
    const { api } = useApiData();
    const { sak, roller } = api.getSakAndRoller(saksnummer);

    return (
        <div className="bg-[var(--a-gray-50)] border-[var(--a-border-divider)] border-solid border-b">
            <Heading
                level="1"
                size="xlarge"
                className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
            >
                Søknad om forskudd{" "}
                <span className="text-base flex items-center font-normal">
                    Saksnr. {sak?.saksnummer}{" "}
                    <CopyToClipboard size="small" copyText={sak?.saksnummer} popoverText="Kopierte saksnummer" />
                </span>
            </Heading>
            <div className="grid grid-cols-[max-content_auto]">
                {roller?.map((rolle, i) => (
                    <RolleDetaljer key={rolle.fodselsnummer + i} rolle={rolle} withBorder={false} />
                ))}
            </div>
        </div>
    );
});
