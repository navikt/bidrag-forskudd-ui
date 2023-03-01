import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { BehandlingData } from "../testdata/behandlingTestData";
import { InntektData } from "../testdata/inntektTestData";

export const useMockApi = () => {
    const queryClient = useQueryClient();
    const [networkError, setNetworkError] = useState<string>(null);

    const fakeFetch = (result): Promise<any> =>
        new Promise((resolve) => {
            setTimeout(() => resolve(result), 1000);
        });

    const getBehandlingData = (saksnummer: string) =>
        useQuery({
            queryKey: `behandling-${saksnummer}`,
            queryFn: (): Promise<BehandlingData> =>
                fakeFetch(JSON.parse(sessionStorage.getItem(`behandling-${saksnummer}`))),
            staleTime: Infinity,
        });

    const postBehandlingData = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: BehandlingData): Promise<BehandlingData> => {
                sessionStorage.setItem(`behandling-${saksnummer}`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`behandling-${saksnummer}`, data);
            },
        });

    const getInntektData = (saksnummer: string) =>
        useQuery({
            queryKey: `inntekt-${saksnummer}`,
            queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(sessionStorage.getItem(`inntekt-${saksnummer}`))),
            staleTime: Infinity,
        });

    const api = {
        getBehandlingData,
        postBehandlingData,
        getInntektData,
    };

    return { api, networkError };
};
