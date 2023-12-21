import { SakHeader } from "@navikt/bidrag-ui-common";
import { Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { useGetBehandling, usePersonsQueries } from "../../hooks/useApiData";

export const Header = memo(() => {
    const { behandlingId } = useForskudd();
    const { roller, saksnummer } = useGetBehandling();
    const personsQueries = usePersonsQueries(roller);
    const rollerMedPersonNavn = personsQueries.map(({ data }) => data);
    return (
        <SakHeader
            saksnummer={saksnummer}
            roller={rollerMedPersonNavn.map((person) => ({
                ...person,
                ident: person.ident!,
                navn: person.visningsnavn ?? person.kortnavn,
            }))}
            skjermbilde={{ navn: "Søknad om forskudd", referanse: `#${behandlingId}` }}
        />
    );
});

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
