import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { ArbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { BehandlingData } from "../testdata/behandlingTestData";
import { BoforholdData } from "../testdata/boforholdTestData";
import { InntektData } from "../testdata/inntektTestData";

export const useMockApi = () => {
    const queryClient = useQueryClient();
    const [networkError, setNetworkError] = useState<string>(null);

    const fakeFetch = (result): Promise<any> =>
        new Promise((resolve) => {
            setTimeout(() => resolve(result), 1000);
        });

    const getBehandling = (saksnummer: string) =>
        useQuery({
            queryKey: `behandling-${saksnummer}`,
            queryFn: (): Promise<BehandlingData> =>
                fakeFetch(JSON.parse(localStorage.getItem(`behandling-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const postBehandling = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: BehandlingData): Promise<BehandlingData> => {
                localStorage.setItem(`behandling-${saksnummer}`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`behandling-${saksnummer}`, data);
            },
        });

    const getInntekt = (saksnummer: string) =>
        useQuery({
            queryKey: `inntekt-${saksnummer}`,
            queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(localStorage.getItem(`inntekt-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const postInntekt = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: InntektData): Promise<InntektData> => {
                localStorage.setItem(`inntekt-${saksnummer}`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`inntekt-${saksnummer}`, data);
            },
        });

    const getArbeidsforhold = (saksnummer: string) =>
        useQuery({
            queryKey: `arbeidsforhold-${saksnummer}`,
            queryFn: (): Promise<ArbeidsforholdData[]> =>
                fakeFetch(JSON.parse(localStorage.getItem(`arbeidsforhold-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getSkattegrunlag = (saksnummer: string) =>
        useQuery({
            queryKey: `skattegrunlag-${saksnummer}`,
            queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
                fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getBoforhold = (saksnummer: string) =>
        useQuery({
            queryKey: `boforhold-${saksnummer}`,
            queryFn: (): Promise<BoforholdData> =>
                fakeFetch(JSON.parse(localStorage.getItem(`boforhold-${saksnummer}`))),
            staleTime: Infinity,
            suspense: true,
        });

    const postBoforhold = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: BoforholdData): Promise<BehandlingData> => {
                localStorage.setItem(`boforhold-${saksnummer}`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`boforhold-${saksnummer}`, data);
            },
        });

    const api = {
        getBehandling,
        postBehandling,
        getInntekt,
        postInntekt,
        getArbeidsforhold,
        getSkattegrunlag,
        getBoforhold,
        postBoforhold,
    };

    return { api, networkError };
};
