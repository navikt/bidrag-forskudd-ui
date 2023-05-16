import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

import {
    BehandlingDto,
    BoforholdResponse,
    InntekterResponse,
    OpplysningerType,
    RolleDto,
    UpdateBehandlingRequestExtended,
    UpdateBoforholdRequest,
    UpdateInntekterRequest,
    UpdateVirkningsTidspunktRequest,
    VirkningsTidspunktResponse,
} from "../api/BidragBehandlingApi";
import { HusstandsmedlemmerDto, PersonDto } from "../api/PersonApi";
import { BEHANDLING_API, PERSON_API } from "../constants/api";

export const useGetBehandlings = () =>
    useQuery({
        queryKey: ["behandlings"],
        queryFn: (): Promise<AxiosResponse<BehandlingDto[]>> => BEHANDLING_API.api.hentBehandlinger(),
        staleTime: 0,
        suspense: true,
    });

export const useGetBehandling = (behandlingId: number) =>
    useQuery({
        queryKey: ["behandling", behandlingId],
        queryFn: (): Promise<AxiosResponse<BehandlingDto>> => BEHANDLING_API.api.hentBehandling(behandlingId),
        staleTime: Infinity,
        suspense: true,
    });

export const useUpdateVirkningstidspunkt = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: (payload: UpdateVirkningsTidspunktRequest): Promise<AxiosResponse<VirkningsTidspunktResponse>> =>
            BEHANDLING_API.api.oppdaterVirkningsTidspunkt(behandlingId, payload),
        onSuccess: (data) => {
            queryClient.setQueryData(["virkningstidspunkt-", behandlingId], data);
            setError(undefined);
        },
        onError: (error) => {
            console.log("onError", error);
            setError(error);
        },
    });

    return { mutation, error };
};

export const useUpdateBoforhold = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: (payload: UpdateBoforholdRequest): Promise<AxiosResponse<BoforholdResponse>> =>
            BEHANDLING_API.api.oppdatereBoforhold(behandlingId, payload),
        onSuccess: (data) => {
            queryClient.setQueryData(["boforhold-", behandlingId], data);
            setError(undefined);
        },
        onError: (error) => {
            console.log("onError", error);
            setError(error);
        },
    });

    return { mutation, error };
};

export const useUpdateInntekter = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: (payload: UpdateInntekterRequest): Promise<AxiosResponse<InntekterResponse>> =>
            BEHANDLING_API.api.oppdaterInntekter(behandlingId, payload),
        onSuccess: (data) => {
            queryClient.setQueryData(["inntekter-", behandlingId], data);
            setError(undefined);
        },
        onError: (error) => {
            console.log("onError", error);
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
    useQueries({
        queries: roller.map((rolle) => ({
            queryKey: ["persons", rolle.ident],
            queryFn: (): Promise<AxiosResponse<PersonDto>> =>
                PERSON_API.informasjon.hentPersonPost({ ident: rolle.ident }),
            staleTime: Infinity,
            select: useCallback(({ data }) => ({ ...rolle, navn: data.navn }), []),
            suspense: true,
            enabled: !!rolle,
        })),
    });

export const useGetHusstandsmedlemmer = (ident: string) =>
    useQuery({
        queryKey: ["husstandsmedlemmer", ident],
        queryFn: (): Promise<AxiosResponse<HusstandsmedlemmerDto>> =>
            PERSON_API.husstandsmedlemmer.hentHusstandsmedlemmer({ ident: ident }),
        staleTime: Infinity,
        suspense: true,
        enabled: !!ident,
    });

export const useGetBoforoholdOpplysninger = (behandlingId: number) =>
    useQuery({
        queryKey: ["boforoholdOpplysninger", behandlingId],
        queryFn: async (): Promise<AxiosResponse<HusstandsmedlemmerDto>> => {
            try {
                const res = await BEHANDLING_API.api.hentAktiv(behandlingId, OpplysningerType.BOFORHOLD);
                return res;
            } catch (e) {
                if (e.response.status === 404) return null;
                else throw e;
            }
        },
        staleTime: Infinity,
        suspense: true,
    });

export const _updateBehandlingExtended = (behandlingId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateBehandlingRequestExtended): Promise<AxiosResponse<BehandlingDto>> =>
            BEHANDLING_API.api.oppdaterBehandlingExtended(behandlingId, payload),
        onSuccess: (data) => {
            queryClient.setQueryData(["behandling", behandlingId], data);
        },
    });
};
