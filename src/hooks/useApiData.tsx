import { useState } from "react";
import { useInfiniteQuery, useQuery } from "react-query";

import { BidragSakDto } from "../api/BidragSakApi";
import { BIDRAG_GRUNNLAG_API, BIDRAG_SAK_API, PERSON_API } from "../constants/api";
import { PERSON_IKKE_FINNES } from "../constants/error";
import { getFullYear } from "../utils/date-utils";
import { removePlaceholder } from "../utils/string-utils";

export const useApiData = () => {
    const [networkError, setNetworkError] = useState<string>(null);

    const fetchSak = async (saksnummer: string) => {
        const sak = await BIDRAG_SAK_API.bidragSak.findMetadataForSak(saksnummer);
        return sak.data;
    };

    const fetchPersons = async (sak: BidragSakDto) => {
        const personPromises = sak.roller.map((rolle) =>
            PERSON_API.informasjon.hentPersonPost({ ident: rolle.fodselsnummer, verdi: rolle.fodselsnummer })
        );
        const [...personer] = await Promise.all([...personPromises]);
        return personer;
    };

    const fetchAndMapPersonsToRoles = async (sak: BidragSakDto) => {
        const personer = await fetchPersons(sak);
        const roller = personer.map((person) => {
            const rolle = sak.roller.find((rolle) => rolle.fodselsnummer === person.data.ident);
            if (!rolle) throw new Error(removePlaceholder(PERSON_IKKE_FINNES, person.data.ident));
            return { ...rolle, ...person.data };
        });
        return roller;
    };

    const fetchSkattegrunnlager = async (signal?: AbortSignal) => {
        const skattegrunnlagDtoPromises = [getFullYear() - 1, getFullYear() - 2, getFullYear() - 3].map((year) =>
            BIDRAG_GRUNNLAG_API.integrasjoner.hentSkattegrunnlag(
                {
                    inntektsAar: year.toString(),
                    inntektsFilter: "",
                    personId: "123",
                },
                { signal }
            )
        );
        const [skattegrunnlag1, skattegrunnlag2, skattegrunnlag3] = await Promise.all([...skattegrunnlagDtoPromises]);

        return [skattegrunnlag1.data, skattegrunnlag2.data, skattegrunnlag3.data];
    };

    const getSakAndRoller = (saksnummer: string) => {
        const { data: sak } = useQuery({
            queryKey: `sak-${saksnummer}`,
            queryFn: () => fetchSak(saksnummer),
            staleTime: Infinity,
        });

        const { data: roller } = useQuery("roller", () => fetchAndMapPersonsToRoles(sak), {
            staleTime: Infinity,
            enabled: !!sak,
        });

        return { sak: sak, roller: roller };
    };

    const getSkattegrunnlager = () => {
        const { data } = useInfiniteQuery({
            queryKey: "skattegrunlager",
            queryFn: () => fetchSkattegrunnlager(),
            staleTime: Infinity,
        });

        return { data };
    };

    const api = {
        getSkattegrunnlager,
        getSakAndRoller,
    };

    return { api, networkError };
};
