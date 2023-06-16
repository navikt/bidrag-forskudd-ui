import { CopyButton, Heading, Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { RolleDto, RolleType } from "../../api/BidragBehandlingApi";
import { useForskudd } from "../../context/ForskuddContext";
import { useGetBehandling, usePersonsQueries } from "../../hooks/useApiData";
import { RolleDetaljer } from "../RolleDetaljer";

export const Header = memo(() => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);

    return (
        <>
            <div className="bg-[var(--a-gray-50)] border-[var(--a-border-divider)] border-solid border-b">
                <Heading
                    level="1"
                    size="xlarge"
                    className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
                >
                    Søknad om forskudd <Saksnummer saksnummer={behandling.saksnummer} />
                </Heading>
                <div className="grid grid-cols-[max-content_auto]">
                    <Roller roller={behandling.roller} />
                </div>
            </div>
        </>
    );
});

const Roller = memo(({ roller }: { roller: RolleDto[] }) => {
    const personsQueries = usePersonsQueries(roller);
    const personsQueriesFinished = personsQueries.every((query) => query.isSuccess);
    const rollerMedPersonNavn = personsQueries.map(({ data }) => data);

    return (
        personsQueriesFinished && (
            <>
                {rollerMedPersonNavn
                    .sort((a, b) => {
                        if (a.rolleType === RolleType.BIDRAGS_MOTTAKER || b.rolleType === RolleType.BARN) return -1;
                        if (b.rolleType === RolleType.BIDRAGS_MOTTAKER || a.rolleType === RolleType.BARN) return 1;
                        return 0;
                    })
                    .map((rolle, i) => (
                        <RolleDetaljer key={rolle.ident + i} rolle={rolle} withBorder={false} />
                    ))}
            </>
        )
    );
});

const Saksnummer = memo(({ saksnummer }: { saksnummer: string }) => (
    <span className="text-base flex items-center font-normal">
        Saksnr. {saksnummer} <CopyButton size="small" copyText={saksnummer} />
    </span>
));

export const ForskuddHeader = () => (
    <Suspense
        fallback={
            <div className="flex justify-center">
                <Loader size="3xlarge" title="venter..." variant="interaction" />
            </div>
        }
    >
        <Header />
    </Suspense>
);
