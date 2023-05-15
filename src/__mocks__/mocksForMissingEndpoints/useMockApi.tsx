import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { RolleDto } from "../../api/BidragBehandlingApi";
import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { AndreInntekter } from "../testdata/aInntektTestData";
import { ArbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { BoforholdData, getBoforholdMockData } from "../testdata/boforholdTestData";
import { InntektData } from "../testdata/inntektTestData";
import { inntektMockData } from "./mockData";

const fakeFetch = (result, success = true): Promise<any> =>
    new Promise((resolve, reject) => {
        if (success) {
            setTimeout(() => resolve(result), 1000);
        } else {
            setTimeout(() => reject(new Error("Fetch failed")), 1000);
        }
    });

export const useGetInntekt = (behandlingId: string, roller: RolleDto[], success = true) =>
    useQuery({
        queryKey: ["inntekt", behandlingId],
        queryFn: (): Promise<InntektData> => fakeFetch(inntektMockData(behandlingId, roller), success),
        staleTime: Infinity,
        suspense: true,
    });

export const usePostInntekt = (behandlingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: InntektData): Promise<InntektData> => {
            localStorage.setItem(`inntekt-${behandlingId}`, JSON.stringify(payload));
            return fakeFetch(payload);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["inntekt", behandlingId], data);
        },
    });
};

export const useGetArbeidsforhold = (behandlingId: string, success = true) =>
    useQuery({
        queryKey: ["arbeidsforhold"],
        queryFn: (): Promise<ArbeidsforholdData[]> =>
            fakeFetch(JSON.parse(localStorage.getItem(`arbeidsforhold`)), success),
        staleTime: Infinity,
        suspense: true,
    });

export const useGetSkattegrunlag = (behandlingId: string) =>
    useQuery({
        queryKey: ["skattegrunlag"],
        queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
            fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag`))),
        staleTime: Infinity,
        suspense: true,
    });

export const useGetAndreTyperInntekt = (behandlingId: string) =>
    useQuery({
        queryKey: ["ainntekt"],
        queryFn: (): Promise<AndreInntekter[]> => fakeFetch(JSON.parse(localStorage.getItem(`ainntekt`))),
        staleTime: Infinity,
        suspense: true,
    });

export const useGetBoforhold = (behandlingId: string) =>
    useQuery({
        queryKey: ["boforhold", behandlingId],
        queryFn: (): Promise<BoforholdData> => fakeFetch(JSON.parse(getBoforholdMockData(behandlingId))),
        staleTime: Infinity,
        suspense: true,
    });

export const usePostBoforhold = (behandlingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: BoforholdData): Promise<BoforholdData> => {
            localStorage.setItem(`boforhold-${behandlingId}`, JSON.stringify(payload));
            return fakeFetch(payload);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["boforhold", behandlingId], data);
        },
    });
};

export const useGetInntektAInntektAndGrunnlag = (behandlingId: string) =>
    useQueries({
        queries: [
            {
                queryKey: ["skattegrunlag"],
                queryFn: (): Promise<HentSkattegrunnlagResponse[]> =>
                    fakeFetch(JSON.parse(localStorage.getItem(`skattegrunlag`))),
                staleTime: Infinity,
                suspense: true,
            },
            {
                queryKey: ["ainntekt"],
                queryFn: (): Promise<AndreInntekter[]> => fakeFetch(JSON.parse(localStorage.getItem(`ainntekt`))),
                staleTime: Infinity,
                suspense: true,
            },
            {
                queryKey: ["inntekt"],
                queryFn: (): Promise<InntektData> => fakeFetch(JSON.parse(localStorage.getItem(`inntekt`))),
                staleTime: Infinity,
                suspense: true,
            },
        ],
    });
