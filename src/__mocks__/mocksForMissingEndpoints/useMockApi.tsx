import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { ArbeidsforholdData } from "../testdata/arbeidsforholdTestData";
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
            suspense: true,
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
            suspense: true,
        });

    const postInntektData = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: InntektData): Promise<InntektData> => {
                sessionStorage.setItem(`inntekt-${saksnummer}`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`inntekt-${saksnummer}`, data);
            },
        });

    const getArbeidsforholdData = (saksnummer: string) =>
        useQuery({
            queryKey: `arbeidsforhold-${saksnummer}`,
            queryFn: (): Promise<ArbeidsforholdData[]> =>
                fakeFetch(JSON.parse(sessionStorage.getItem(`arbeidsforhold-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getSkattegrunlag = (saksnummer: string) =>
        useQuery({
            queryKey: `skattegrunlag-${saksnummer}`,
            queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
                fakeFetch(JSON.parse(sessionStorage.getItem(`skattegrunlag-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const api = {
        getBehandlingData,
        postBehandlingData,
        getInntektData,
        postInntektData,
        getArbeidsforholdData,
        getSkattegrunlag,
    };

    return { api, networkError };
};
