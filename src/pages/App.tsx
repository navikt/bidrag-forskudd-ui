import { useState } from "react";
import { useEffect } from "react";

import PersonService from "../service/PersonService";

interface AppProps {
    personId: string;
}
export default function App({ personId }: AppProps) {
    const [personNavn, setPersonNavn] = useState<string>();

    useEffect(() => {
        new PersonService().hentPerson(personId).then((res) => setPersonNavn(res.navn));
    }, []);

    return <div>Navnet på personen er {personNavn}</div>;
}
