import SakHeader from "@navikt/bidrag-ui-common/esm/react_components/header/SakHeader";
import { Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { useGetBehandling, usePersonsQueries } from "../../hooks/useApiData";

export const Header = memo(() => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const personsQueries = usePersonsQueries(behandling.roller);
    const rollerMedPersonNavn = personsQueries.map(({ data }) => data);
    return (
        <SakHeader
            saksnummer={behandling.saksnummer}
            roller={rollerMedPersonNavn}
            skjermbilde={{ navn: "Forskudd", referanse: behandlingId }}
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
