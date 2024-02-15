import React from "react";

import text from "../constants/texts";
import { useHentPersonData } from "../hooks/useApiData";

export const PersonNavn = ({ ident }: { ident: string }) => {
    const { data: personData } = useHentPersonData(ident);

    return <>{personData.kortnavn || text.varsel.ukjentNavn}</>;
};
