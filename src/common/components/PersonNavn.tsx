import React from "react";

import { useHentPersonData } from "../hooks/useApiData";

export const PersonNavn = ({ ident, navn }: { ident?: string; navn?: string }) => {
    const { data: personData } = useHentPersonData(navn ? undefined : ident);

    return <span className="personnavn">{navn ?? personData.visningsnavn}</span>;
};
