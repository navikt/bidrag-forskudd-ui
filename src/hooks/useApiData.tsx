import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { useMutation, UseMutationResult, useQueries, useQuery, useQueryClient } from "react-query";

import {
    BehandlingDto,
    RolleDto,
    UpdateBehandlingRequest,
    UpdateBehandlingRequestExtended,
} from "../api/BidragBehandlingApi";
import { PersonDto } from "../api/PersonApi";
import { BEHANDLING_API, PERSON_API } from "../constants/api";

export interface Mutation {
    mutation: UseMutationResult;
    error: any;
}

export const useGetBehandlings = () =>
    useQuery({
        queryKey: `behandlings`,
        queryFn: (): Promise<AxiosResponse<BehandlingDto[]>> => BEHANDLING_API.api.hentBehandlinger(),
        staleTime: 0,
        suspense: true,
    });

export const useGetBehandling = (behandlingId: number) =>
    useQuery({
        queryKey: `behandling-${behandlingId}`,
        queryFn: (): Promise<AxiosResponse<BehandlingDto>> => BEHANDLING_API.api.hentBehandling(behandlingId),
        staleTime: Infinity,
        suspense: true,
    });

export const useUpdateBehandling = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: (payload: UpdateBehandlingRequest): Promise<AxiosResponse<BehandlingDto>> =>
            BEHANDLING_API.api.oppdaterBehandling(behandlingId, payload),
        onSuccess: (data) => {
            queryClient.setQueryData(`behandling-${behandlingId}`, data);
            setError(undefined);
        },
        onError: (error) => {
            setError(error);
        },
    });
    return { mutation, error };
};

export const useHentPersonData = (ident: string) =>
    useQuery({
        queryKey: ["persons", ident],
        queryFn: (): Promise<AxiosResponse<PersonDto>> => PERSON_API.informasjon.hentPersonPost({ ident: ident }),
        staleTime: Infinity,
        suspense: true,
    });

export const usePersonsQueries = (roller: RolleDto[]) =>
    useQueries(
        roller.map((rolle) => ({
            queryKey: ["persons", rolle.ident],
            queryFn: (): Promise<AxiosResponse<PersonDto>> =>
                PERSON_API.informasjon.hentPersonPost({ ident: rolle.ident }),
            staleTime: Infinity,
            select: useCallback(({ data }) => ({ ...rolle, navn: data.navn }), []),
            suspense: true,
            enable: !!rolle,
        }))
    );

export const _updateBehandlingExtended = (behandlingId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateBehandlingRequestExtended): Promise<AxiosResponse<BehandlingDto>> =>
            BEHANDLING_API.api.oppdaterBehandlingExtended(behandlingId, payload),
        onSuccess: (data) => {
            queryClient.setQueryData(`behandling-${behandlingId}`, data);
        },
    });
};
