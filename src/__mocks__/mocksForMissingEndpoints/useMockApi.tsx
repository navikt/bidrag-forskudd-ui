import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";

import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { AndreInntekter } from "../testdata/aInntektTestData";
import { ArbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { BoforholdData, getBoforholdMockData } from "../testdata/boforholdTestData";
import { InntektData } from "../testdata/inntektTestData";

const fakeFetch = (result, success = true): Promise<any> =>
    new Promise((resolve, reject) => {
        if (success) {
            setTimeout(() => resolve(result), 1000);
        } else {
            setTimeout(() => reject(new Error("Fetch failed")), 1000);
        }
    });

export const useGetInntekt = (behandlingId: string, success = true) =>
    useQuery({
        queryKey: `inntekt`,
        queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(localStorage.getItem(`inntekt`)), success),
        staleTime: Infinity,
        suspense: true,
    });

export const usePostInntekt = (behandlingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: InntektData): Promise<InntektData> => {
            localStorage.setItem(`inntekt`, JSON.stringify(payload));
            return fakeFetch(payload);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(`inntekt`, data);
        },
    });
};

export const useGetArbeidsforhold = (behandlingId: string, success = true) =>
    useQuery({
        queryKey: `arbeidsforhold`,
        queryFn: (): Promise<ArbeidsforholdData[]> =>
            fakeFetch(JSON.parse(localStorage.getItem(`arbeidsforhold`)), success),
        staleTime: Infinity,
        suspense: true,
    });

export const useGetSkattegrunlag = (behandlingId: string) =>
    useQuery({
        queryKey: `skattegrunlag`,
        queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
            fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag`))),
        staleTime: Infinity,
        suspense: true,
    });

export const useGetAndreTyperInntekt = (behandlingId: string) =>
    useQuery({
        queryKey: `ainntekt`,
        queryFn: (): Promise<AndreInntekter[]> => fakeFetch(JSON.parse(localStorage.getItem(`ainntekt`))),
        staleTime: Infinity,
        suspense: true,
    });

export const useGetBoforhold = (behandlingId: string, identer: string[], enabled = false) =>
    useQuery({
        queryKey: `boforhold-${behandlingId}`,
        queryFn: (): Promise<BoforholdData> => fakeFetch(JSON.parse(getBoforholdMockData(behandlingId, identer))),
        staleTime: Infinity,
        suspense: true,
        enabled,
    });

export const usePostBoforhold = (behandlingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: BoforholdData): Promise<BoforholdData> => {
            localStorage.setItem(`boforhold-${behandlingId}`, JSON.stringify(payload));
            return fakeFetch(payload);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(`boforhold-${behandlingId}`, data);
        },
    });
};

export const useGetInntektAInntektAndGrunnlag = (behandlingId: string) =>
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
