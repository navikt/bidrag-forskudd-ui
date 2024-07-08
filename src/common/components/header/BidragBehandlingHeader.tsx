import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { SakHeader } from "@navikt/bidrag-ui-common";
import React, { memo } from "react";

import text from "../../constants/texts";
import { useGetBehandlingV2, usePersonsQueries } from "../../hooks/useApiData";

export const Header = memo(() => {
    const { behandlingId, vedtakId } = useBehandlingProvider();
    const { roller, saksnummer } = useGetBehandlingV2();
    const personsQueries = usePersonsQueries(roller);
    const rollerMedPersonNavn = personsQueries.map(({ data }) => data);
    return (
        <SakHeader
            saksnummer={saksnummer}
            roller={rollerMedPersonNavn.map((person) => ({
                ...person,
                ident: person.ident!,
                navn: person.visningsnavn,
            }))}
            skjermbilde={{ navn: text.skjermbildeNavn, referanse: `#${behandlingId ?? vedtakId}` }}
        />
    );
});

export const BidragBehandlingHeader = () => <Header />;
