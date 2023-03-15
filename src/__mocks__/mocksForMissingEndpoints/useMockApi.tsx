import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { AndreInntekter } from "../testdata/aInntektTestData";
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
            queryKey: `behandling`,
            queryFn: (): Promise<BehandlingData> => fakeFetch(JSON.parse(localStorage.getItem(`behandling`))),
            staleTime: Infinity,
            suspense: true,
        });

    const postBehandling = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: BehandlingData): Promise<BehandlingData> => {
                localStorage.setItem(`behandling`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`behandling`, data);
            },
        });

    const getInntekt = (saksnummer: string) =>
        useQuery({
            queryKey: `inntekt`,
            queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(localStorage.getItem(`inntekt`))),
            staleTime: Infinity,
            suspense: true,
        });

    const postInntekt = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: InntektData): Promise<InntektData> => {
                localStorage.setItem(`inntekt`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`inntekt`, data);
            },
        });

    const getArbeidsforhold = (saksnummer: string) =>
        useQuery({
            queryKey: `arbeidsforhold`,
            queryFn: (): Promise<ArbeidsforholdData[]> => fakeFetch(JSON.parse(localStorage.getItem(`arbeidsforhold`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getSkattegrunlag = (saksnummer: string) =>
        useQuery({
            queryKey: `skattegrunlag`,
            queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
                fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getAndreTyperInntekt = (saksnummer: string) =>
        useQuery({
            queryKey: `ainntekt`,
            queryFn: (): Promise<AndreInntekter[]> => fakeFetch(JSON.parse(localStorage.getItem(`ainntekt`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getBoforhold = (saksnummer: string) =>
        useQuery({
            queryKey: `boforhold`,
            queryFn: (): Promise<BoforholdData> => fakeFetch(JSON.parse(localStorage.getItem(`boforhold`))),
            staleTime: Infinity,
            suspense: true,
        });

    const postBoforhold = (saksnummer: string) =>
        useMutation({
            mutationFn: (payload: BoforholdData): Promise<BehandlingData> => {
                localStorage.setItem(`boforhold`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`boforhold`, data);
            },
        });

    const api = {
        getBehandling,
        postBehandling,
        getInntekt,
        postInntekt,
        getAndreTyperInntekt,
        getArbeidsforhold,
        getSkattegrunlag,
        getBoforhold,
        postBoforhold,
    };

    return { api, networkError };
};
