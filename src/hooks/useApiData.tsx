import { AxiosResponse } from "axios";
import { useState } from "react";
import { useInfiniteQuery, useQuery } from "react-query";

import { BidragSakDto } from "../api/BidragSakApi";
import { BIDRAG_GRUNNLAG_API, BIDRAG_SAK_API, PERSON_API } from "../constants/api";
import { getFullYear } from "../utils/date-utils";
import { mapPersonsToRoles } from "../utils/roles-utils";

export const useApiData = () => {
    const [networkError, setNetworkError] = useState<string>(null);

    const fetchSak = async (saksnummer: string) => {
        const sak = await BIDRAG_SAK_API.bidragSak.findMetadataForSak(saksnummer);
        return sak.data;
    };

    const fetchPersons = async (sak: BidragSakDto, signal: AbortSignal) =>
        getDataFromPromises(createPersonPromises(sak, signal));

    const getDataFromPromises = async (promises: Promise<AxiosResponse<any, any>>[]) =>
        await Promise.all([...promises]).then((results) => results.map((result) => result.data));

    const createPersonPromises = (sak: BidragSakDto, signal: AbortSignal) =>
        sak.roller.map((rolle) =>
            PERSON_API.informasjon.hentPersonPost(
                { ident: rolle.fodselsnummer, verdi: rolle.fodselsnummer },
                { signal }
            )
        );

    const createSkattegrunnlagePromises = (signal: AbortSignal) =>
        [getFullYear() - 1, getFullYear() - 2, getFullYear() - 3].map((year) =>
            BIDRAG_GRUNNLAG_API.integrasjoner.hentSkattegrunnlag(
                {
                    inntektsAar: year.toString(),
                    inntektsFilter: "",
                    personId: "123",
                },
                { signal }
            )
        );

    const fetchSkattegrunnlager = async (signal: AbortSignal) =>
        getDataFromPromises(createSkattegrunnlagePromises(signal));

    const getSakAndRoller = (saksnummer: string) => {
        const { data: sak } = useQuery({
            queryKey: `sak-${saksnummer}`,
            queryFn: () => fetchSak(saksnummer),
            staleTime: Infinity,
        });

        const { data: roller } = useQuery(
            "roller",
            ({ signal }) => fetchPersons(sak, signal).then((personer) => mapPersonsToRoles(sak, personer)),
            {
                staleTime: Infinity,
                enabled: !!sak,
            }
        );

        return { sak: sak, roller: roller };
    };
    const getSkattegrunnlager = () => {
        const { data } = useInfiniteQuery({
            queryKey: "skattegrunlager",
            queryFn: ({ signal }) => fetchSkattegrunnlager(signal),
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
