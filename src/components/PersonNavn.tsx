import React from "react";

import { useHentPersonData } from "../hooks/useApiData";

export const PersonNavn = ({ ident }: { ident: string }) => {
    const { data: personData } = useHentPersonData(ident);

    return <>{personData.visningsnavn}</>;
};
