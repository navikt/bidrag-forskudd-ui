import { Button } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";

import PersonService from "../../service/PersonService";
import PageWrapper from "../PageWrapper";

interface ForskuddPageProps {
    personId: string;
}
export default function ForskuddPage({ personId }: ForskuddPageProps) {
    const [personNavn, setPersonNavn] = useState<string>();

    useEffect(() => {
        new PersonService().hentPerson(personId).then((res) => setPersonNavn(res.navn));
    }, []);

    return (
        <PageWrapper name={"Forskudd"}>
            Navnet på personen er {personNavn}
            <Button>Knapp test</Button>
        </PageWrapper>
    );
}
