import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

import {
    BehandlingDto,
    BoforholdResponse,
    ForskuddBeregningRespons,
    InntekterResponse,
    OpplysningerDto,
    OpplysningerType,
    RolleDto,
    RolleType,
    UpdateBoforholdRequest,
    UpdateInntekterRequest,
    UpdateVirkningsTidspunktRequest,
    VirkningsTidspunktResponse,
} from "../api/BidragBehandlingApi";
import {
    HentGrunnlagspakkeDto,
    OppdaterGrunnlagspakkeDto,
    OppdaterGrunnlagspakkeRequestDto,
} from "../api/BidragGrunnlagApi";
import { PersonDto } from "../api/PersonApi";
import { BEHANDLING_API, BIDRAG_GRUNNLAG_API, PERSON_API } from "../constants/api";
import { deductMonths, toISODateString } from "../utils/date-utils";

export const useGetBehandlings = () =>
    useQuery({
        queryKey: ["behandlings"],
        queryFn: (): Promise<AxiosResponse<BehandlingDto[]>> => BEHANDLING_API.api.hentBehandlinger(),
        staleTime: 0,
        suspense: true,
    });

export const useBeregnForskudd = (behandlingId: number) =>
    useQuery({
        queryFn: (): Promise<AxiosResponse<ForskuddBeregningRespons>> =>
            BEHANDLING_API.api.beregnForskudd(behandlingId),
        suspense: true,
    });

export const useGetBehandling = (behandlingId: number) =>
    useQuery({
        queryKey: ["behandling", behandlingId],
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API.api.hentBehandling(behandlingId);
            return data;
        },
        staleTime: Infinity,
        suspense: true,
    });

export const useGetVirkningstidspunkt = (behandlingId: number) =>
    useQuery({
        queryKey: ["virkningstidspunkt", behandlingId],
        queryFn: async (): Promise<VirkningsTidspunktResponse> => {
            const { data } = await BEHANDLING_API.api.hentVirkningsTidspunkt(behandlingId);
            return data;
        },
        staleTime: Infinity,
        suspense: true,
    });

export const useUpdateVirkningstidspunkt = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: async (payload: UpdateVirkningsTidspunktRequest): Promise<VirkningsTidspunktResponse> => {
            const { data } = await BEHANDLING_API.api.oppdaterVirkningsTidspunkt(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["virkningstidspunkt", behandlingId], data);
            setError(undefined);
        },
        onError: (error) => {
            console.log("onError", error);
            setError(error);
        },
    });

    return { mutation, error };
};

export const useGetBoforhold = (behandlingId: number) =>
    useQuery({
        queryKey: ["boforhold", behandlingId],
        queryFn: async (): Promise<BoforholdResponse> => {
            const { data } = await BEHANDLING_API.api.hentBoforhold(behandlingId);
            return data;
        },
        staleTime: Infinity,
        suspense: true,
    });

export const useGetBoforoholdOpplysninger = (behandlingId: number) =>
    useQuery({
        queryKey: ["boforoholdOpplysninger", behandlingId],
        queryFn: async (): Promise<OpplysningerDto> => {
            try {
                const { data } = await BEHANDLING_API.api.hentAktiv(behandlingId, OpplysningerType.BOFORHOLD);
                return data;
            } catch (e) {
                if (e.response.status === 404) return null;
                else throw e;
            }
        },
        staleTime: Infinity,
        suspense: true,
    });

export const useUpdateBoforhold = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: async (payload: UpdateBoforholdRequest): Promise<BoforholdResponse> => {
            const { data } = await BEHANDLING_API.api.oppdatereBoforhold(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["boforhold", behandlingId], data);
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
        mutationFn: async (payload: UpdateInntekterRequest): Promise<InntekterResponse> => {
            const { data } = await BEHANDLING_API.api.oppdaterInntekter(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["inntekter", behandlingId], data);
            setError(undefined);
        },
        onError: (error) => {
            console.log("onError", error);
            setError(error);
        },
    });

    return { mutation, error };
};

export const useHentInntekter = (behandlingId: number) =>
    useQuery({
        queryKey: ["inntekter", behandlingId],
        queryFn: async (): Promise<InntekterResponse> => {
            const { data } = await BEHANDLING_API.api.hentInntekter(behandlingId);
            return data;
        },
        staleTime: Infinity,
        suspense: true,
    });

export const useHentBoforhold = (behandlingId: number) =>
    useQuery({
        queryKey: ["boforhold", behandlingId],
        queryFn: (): Promise<AxiosResponse<BoforholdResponse>> => BEHANDLING_API.api.hentBoforhold(behandlingId),
        staleTime: Infinity,
        suspense: true,
    });

export const useHentPersonData = (ident: string) =>
    useQuery({
        queryKey: ["persons", ident],
        queryFn: async (): Promise<PersonDto> => {
            const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: ident });
            return data;
        },
        staleTime: Infinity,
        suspense: true,
    });

export const usePersonsQueries = (roller: RolleDto[]) =>
    useQueries({
        queries: roller.map((rolle) => ({
            queryKey: ["persons", rolle.ident],
            queryFn: async (): Promise<PersonDto> => {
                const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: rolle.ident });
                return data;
            },
            staleTime: Infinity,
            select: useCallback((data) => ({ ...rolle, navn: data.navn }), []),
            suspense: true,
            enabled: !!rolle,
        })),
    });

const createGrunnlagRequest = (behandling) => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    const periodeFra = toISODateString(deductMonths(new Date(), 36));
    const today = toISODateString(new Date());
    const skattegrunnlagBarnRequests = barn?.map((b) => ({
        type: "SKATTEGRUNNLAG",
        personId: b.ident,
        periodeFra,
        periodeTil: today,
    }));
    const bmRequests = [
        "AINNTEKT",
        "SKATTEGRUNNLAG",
        "UTVIDET_BARNETRYGD_OG_SMAABARNSTILLEGG",
        "BARNETILLEGG",
        "HUSSTANDSMEDLEMMER_OG_EGNE_BARN",
        "SIVILSTAND",
    ].map((type) => ({
        type,
        personId: bmIdent,
        periodeFra:
            type === "AINNTEKT"
                ? toISODateString(deductMonths(new Date(), Number(today.split("-")[2]) > 6 ? 12 : 13))
                : periodeFra,
        periodeTil:
            type === "AINNTEKT"
                ? toISODateString(deductMonths(new Date(), Number(today.split("-")[2]) > 6 ? 0 : 1))
                : today,
    }));

    const grunnlagRequest: OppdaterGrunnlagspakkeRequestDto = {
        // @ts-ignore
        grunnlagRequestDtoListe: bmRequests.concat(skattegrunnlagBarnRequests),
    };

    return grunnlagRequest;
};

export const useGrunnlagspakke = (behandling) => {
    const { data: grunnlagspakkeId } = useQuery({
        queryKey: ["grunnlagspakkeId", behandlingId],
        queryFn: async (): Promise<number> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.opprettNyGrunnlagspakke({
                formaal: "FORSKUDD",
                opprettetAv: "saksbehandler",
            });

            const grunnlagRequest: OppdaterGrunnlagspakkeRequestDto = createGrunnlagRequest(behandling);

            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.oppdaterGrunnlagspakke(
                grunnlagspakkeId,
                grunnlagRequest
            );

            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;

            return data;
        },
        staleTime: Infinity,
        enabled: !!behandling,
    });

    const { isSuccess: updateIsSuccess } = useQuery({
        queryKey: ["grunnlagspakke", grunnlagspakkeId, "update"],
        queryFn: async (): Promise<OppdaterGrunnlagspakkeDto> => {
            return data;
        },
        staleTime: Infinity,
        enabled: !!grunnlagspakkeId,
    });

    return useQuery({
        queryKey: ["grunnlagspakke", grunnlagspakkeId],
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {},
        staleTime: Infinity,
        enabled: !!updateIsSuccess,
    });
};

export const usePrefetchBehandlingAndGrunnlagspakke = async (behandlingId) => {
    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["behandling", behandlingId],
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API.api.hentBehandling(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

    await queryClient.prefetchQuery({
        queryKey: ["grunnlagspakkeId"],
        queryFn: async (): Promise<number> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.opprettNyGrunnlagspakke({
                formaal: "FORSKUDD",
                opprettetAv: "saksbehandler",
            });
            return data;
        },
        staleTime: Infinity,
    });
    const grunnlagspakkeId: number = queryClient.getQueryData(["grunnlagspakkeId"]);
    const behandling: BehandlingDto = queryClient.getQueryData(["behandling", behandlingId]);
    const grunnlagRequest: OppdaterGrunnlagspakkeRequestDto = createGrunnlagRequest(behandling);

    await queryClient.prefetchQuery({
        queryKey: ["grunnlagspakke", grunnlagspakkeId, "update"],
        queryFn: async (): Promise<OppdaterGrunnlagspakkeDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.oppdaterGrunnlagspakke(
                grunnlagspakkeId,
                grunnlagRequest
            );
            return data;
        },
        staleTime: Infinity,
    });
    await queryClient.prefetchQuery({
        queryKey: ["grunnlagspakke", grunnlagspakkeId],
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;
        },
        staleTime: Infinity,
    });

    const grunnlagspakke: HentGrunnlagspakkeDto = queryClient.getQueryData(["grunnlagspakke", grunnlagspakkeId]);
    return grunnlagspakke;
};
