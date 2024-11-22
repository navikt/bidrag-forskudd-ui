import { TypeBehandling } from "@api/BidragBehandlingApiV1";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { SakHeader } from "@navikt/bidrag-ui-common";
import React, { memo } from "react";

import text from "../../constants/texts";
import { useGetBehandlingV2, usePersonsQueries } from "../../hooks/useApiData";

const behandlingTypeTextMapper = {
    [TypeBehandling.FORSKUDD]: text.skjermbildeNavn.forskudd,
    [TypeBehandling.SAeRBIDRAG]: text.skjermbildeNavn.særbidrag,
    [TypeBehandling.BIDRAG]: text.skjermbildeNavn.bidrag,
};

export const Header = memo(() => {
    const { behandlingId, vedtakId } = useBehandlingProvider();
    const { roller, saksnummer, type } = useGetBehandlingV2();
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
            skjermbilde={{ navn: behandlingTypeTextMapper[type], referanse: `#${behandlingId ?? vedtakId}` }}
        />
    );
});

export const BidragBehandlingHeader = () => <Header />;
