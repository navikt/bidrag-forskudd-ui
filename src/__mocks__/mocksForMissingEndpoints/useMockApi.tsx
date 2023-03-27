import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";

import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { AndreInntekter } from "../testdata/aInntektTestData";
import { ArbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { BoforholdData, getBoforholdMockData } from "../testdata/boforholdTestData";
import { InntektData } from "../testdata/inntektTestData";

export const useMockApi = () => {
    const queryClient = useQueryClient();

    const fakeFetch = (result, success = true): Promise<any> =>
        new Promise((resolve, reject) => {
            if (success) {
                setTimeout(() => resolve(result), 1000);
            } else {
                setTimeout(() => reject(new Error("Fetch failed")), 1000);
            }
        });

    const getInntekt = (behandlingId: string, success = true) =>
        useQuery({
            queryKey: `inntekt`,
            queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(localStorage.getItem(`inntekt`)), success),
            staleTime: Infinity,
            suspense: true,
        });

    const postInntekt = (behandlingId: string) =>
        useMutation({
            mutationFn: (payload: InntektData): Promise<InntektData> => {
                localStorage.setItem(`inntekt`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`inntekt`, data);
            },
        });

    const getArbeidsforhold = (behandlingId: string, success = true) =>
        useQuery({
            queryKey: `arbeidsforhold`,
            queryFn: (): Promise<ArbeidsforholdData[]> =>
                fakeFetch(JSON.parse(localStorage.getItem(`arbeidsforhold`)), success),
            staleTime: Infinity,
            suspense: true,
        });

    const getSkattegrunlag = (behandlingId: string) =>
        useQuery({
            queryKey: `skattegrunlag`,
            queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
                fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getAndreTyperInntekt = (behandlingId: string) =>
        useQuery({
            queryKey: `ainntekt`,
            queryFn: (): Promise<AndreInntekter[]> => fakeFetch(JSON.parse(localStorage.getItem(`ainntekt`))),
            staleTime: Infinity,
            suspense: true,
        });

    const getBoforhold = (behandlingId: string, identer: string[], enabled = false) =>
        useQuery({
            queryKey: `boforhold-${behandlingId}`,
            queryFn: (): Promise<BoforholdData> => fakeFetch(JSON.parse(getBoforholdMockData(behandlingId, identer))),
            staleTime: Infinity,
            suspense: true,
            enabled,
        });

    const postBoforhold = (behandlingId: string) =>
        useMutation({
            mutationFn: (payload: BoforholdData): Promise<BoforholdData> => {
                localStorage.setItem(`boforhold-${behandlingId}`, JSON.stringify(payload));
                return fakeFetch(payload);
            },
            onSuccess: (data) => {
                queryClient.setQueryData(`boforhold-${behandlingId}`, data);
            },
        });

    const getInntektAInntektAndGrunnlag = (behandlingId: string) =>
        useQueries([
            {
                queryKey: "skattegrunlag",
                queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
                    fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag`))),
                staleTime: Infinity,
                suspense: true,
            },
            {
                queryKey: "ainntekt",
                queryFn: (): Promise<AndreInntekter[]> => fakeFetch(JSON.parse(localStorage.getItem(`ainntekt`))),
                staleTime: Infinity,
                suspense: true,
            },
            {
                queryKey: "inntekt",
                queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(localStorage.getItem(`inntekt`))),
                staleTime: Infinity,
                suspense: true,
            },
        ]);

    const api = {
        getInntekt,
        postInntekt,
        getAndreTyperInntekt,
        getArbeidsforhold,
        getSkattegrunlag,
        getBoforhold,
        postBoforhold,
        getInntektAInntektAndGrunnlag,
    };

    return { api };
};
