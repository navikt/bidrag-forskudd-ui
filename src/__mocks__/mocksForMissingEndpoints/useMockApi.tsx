import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { behandlingData } from "../testdata/behandlingTestData";

interface BehandlingPayload {
    saksnummer: string;
    virkningsdato: string;
    avslag?: string;
    aarsak?: string;
    vedtakNotat?: string;
    notat?: string;
}

export const useMockApi = () => {
    const queryClient = useQueryClient();
    const [networkError, setNetworkError] = useState<string>(null);

    const fakeFetch = (result): Promise<any> =>
        new Promise((resolve) => {
            setTimeout(() => resolve(result), 1000);
        });

    const getBehandlingData = (saksnummer: string) => {
        return useQuery({
            queryKey: `behandling-${saksnummer}`,
            queryFn: () => fakeFetch(behandlingData()[saksnummer]),
            staleTime: Infinity,
        });
    };

    const postBehandlingData = (payload: BehandlingPayload) => {
        const { mutate } = useMutation({
            mutationFn: () => fakeFetch(payload),
            onSuccess: (data) => {
                queryClient.setQueryData(`behandling-${data.saksnummer}`, data);
            },
        });
        return { mutate };
    };

    const api = {
        getBehandlingData,
        postBehandlingData,
    };

    return { api, networkError };
};
