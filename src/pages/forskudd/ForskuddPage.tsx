import { useApi } from "@navikt/bidrag-ui-common";
import { Button } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { Api as PersonApi } from "../../api/PersonApi";
import PageWrapper from "../PageWrapper";

interface ForskuddPageProps {
    personId: string;
}

export default function ForskuddPage({ personId }: ForskuddPageProps) {
    const [personNavn, setPersonNavn] = useState<string>();
    const personApi = useApi(new PersonApi({baseURL: process.env.BIDRAG_PERSON_URL}), "bidrag-person", "fss");

    useEffect(() => {
        personApi.informasjon.hentPerson(personId)
        .then((res) => {
            setPersonNavn(res.data.navn);
        })
    }, [])

    return (
        <PageWrapper name={"Forskudd"}>
            Navnet på personen er {personNavn}
            <Button>Knapp test</Button>
        </PageWrapper>
    );
}
