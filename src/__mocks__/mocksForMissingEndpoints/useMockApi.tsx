import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ArbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { InntektData } from "../testdata/inntektTestData";

const fakeFetch = (result, success = true): Promise<any> =>
    new Promise((resolve, reject) => {
        if (success) {
            setTimeout(() => resolve(result), 1000);
        } else {
            setTimeout(() => reject(new Error("Fetch failed")), 1000);
        }
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
