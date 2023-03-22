import { Heading, Loader } from "@navikt/ds-react";
import { CopyToClipboard } from "@navikt/ds-react-internal";
import React, { memo, Suspense } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { useApiData } from "../../hooks/useApiData";
import { RolleDetaljer } from "../RolleDetaljer";

export const ForskuddHeader = memo(() => {
    const { behandlingId } = useForskudd();
    const { api } = useApiData();
    const {
        data: { data: behandling },
    } = api.getBehandling(behandlingId);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <div className="bg-[var(--a-gray-50)] border-[var(--a-border-divider)] border-solid border-b">
                <Heading
                    level="1"
                    size="xlarge"
                    className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
                >
                    Søknad om forskudd{" "}
                    <span className="text-base flex items-center font-normal">
                        Saksnr. {behandling.saksnummer}{" "}
                        <CopyToClipboard
                            size="small"
                            copyText={behandling.saksnummer}
                            popoverText="Kopierte saksnummer"
                        />
                    </span>
                </Heading>
                <div className="grid grid-cols-[max-content_auto]">
                    {behandling.roller?.map((rolle, i) => (
                        <RolleDetaljer key={rolle.ident + i} rolle={rolle} withBorder={false} />
                    ))}
                </div>
            </div>
        </Suspense>
    );
});
