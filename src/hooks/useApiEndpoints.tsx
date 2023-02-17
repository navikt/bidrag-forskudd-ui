import { useState } from "react";

import { BidragSakDto } from "../api/BidragSakApi";
import { BIDRAG_GRUNNLAG_API, BIDRAG_SAK_API, PERSON_API } from "../constants/api";
import { PERSON_IKKE_FINNES } from "../constants/error";
import { HentSkattegrunnlagResponse } from "../types/bidragGrunnlagTypes";
import { IRolleUi } from "../types/rolle";
import { getFullYear } from "../utils/date-utils";
import { removePlaceholder } from "../utils/string-utils";

export const useApiEndpoints = () => {
    const [sak, setSak] = useState<BidragSakDto>(null);
    const [skattegrunnlager, setSkattegrunnlager] = useState<HentSkattegrunnlagResponse[]>([]);
    const [roller, setRoller] = useState<IRolleUi[]>([]);

    const getSak = async (saksnummer: string) => {
        const sak = await BIDRAG_SAK_API.bidragSak.findMetadataForSak(saksnummer);
        setSak(sak.data);
    };

    const getPersons = async (sak: BidragSakDto) => {
        const personPromises = sak.roller.map((rolle) =>
            PERSON_API.informasjon.hentPersonPost({ ident: rolle.fodselsnummer, verdi: rolle.fodselsnummer })
        );
        const [...personer] = await Promise.all([...personPromises]);
        const roller = personer.map((person) => {
            const rolle = sak.roller.find((rolle) => rolle.fodselsnummer === person.data.ident);
            if (!rolle) throw new Error(removePlaceholder(PERSON_IKKE_FINNES, person.data.ident));
            return { ...rolle, ...person.data };
        });

        setRoller(roller);
    };

    const getSkattegrunnlager = async () => {
        const skattegrunnlagDtoPromises = [getFullYear() - 1, getFullYear() - 2, getFullYear() - 3].map((year) =>
            BIDRAG_GRUNNLAG_API.integrasjoner.hentSkattegrunnlag({
                inntektsAar: year.toString(),
                inntektsFilter: "",
                personId: "123",
            })
        );
        const [skattegrunnlag1, skattegrunnlag2, skattegrunnlag3] = await Promise.all([...skattegrunnlagDtoPromises]);
        setSkattegrunnlager([skattegrunnlag1.data, skattegrunnlag2.data, skattegrunnlag3.data]);
    };

    const api = {
        getSak,
        getPersons,
        getSkattegrunnlager,
    };

    const data = {
        sak,
        roller,
        skattegrunnlager,
    };

    return { data, api };
};
