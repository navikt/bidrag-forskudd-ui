import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

import {
    BehandlingDto,
    BoforholdResponse,
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
import { TransformerInntekterRequestDto, TransformerInntekterResponseDto } from "../api/BidragInntektApi";
import { PersonDto } from "../api/PersonApi";
import { BEHANDLING_API, BIDRAG_GRUNNLAG_API, BIDRAG_INNTEKT_API, PERSON_API } from "../constants/api";
import { deductMonths, toISODateString } from "../utils/date-utils";

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
            select: useCallback((data) => ({ ...rolle, navn: data.navn, kortnavn: data.kortnavn }), []),
            suspense: true,
            enabled: !!rolle,
        })),
    });

const createGrunnlagRequest = (behandling: BehandlingDto) => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleType.BIDRAGSMOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    const today = new Date();
    const periodeFra = toISODateString(deductMonths(today, 36));

    const skattegrunnlagBarnRequests = barn?.map((b) => ({
        type: "SKATTEGRUNNLAG",
        personId: b.ident,
        periodeFra,
        periodeTil: toISODateString(today),
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
            type === "AINNTEKT" ? toISODateString(deductMonths(today, today.getDate() > 6 ? 12 : 13)) : periodeFra,
        periodeTil:
            type === "AINNTEKT"
                ? toISODateString(deductMonths(today, today.getDate() > 6 ? 0 : 1))
                : toISODateString(today),
    }));

    const grunnlagRequest: OppdaterGrunnlagspakkeRequestDto = {
        // @ts-ignore
        grunnlagRequestDtoListe: bmRequests.concat(skattegrunnlagBarnRequests),
    };

    return grunnlagRequest;
};

const createBidragIncomeRequest = (behandling: BehandlingDto, grunnlagspakke: HentGrunnlagspakkeDto) => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleType.BIDRAGSMOTTAKER).ident;
    const barnIdenter = behandling?.roller
        ?.filter((rolle) => rolle.rolleType === RolleType.BARN)
        .map((barn) => barn.ident);

    const requests: { ident: string; request: TransformerInntekterRequestDto }[] = barnIdenter
        .concat(bmIdent)
        .map((ident) => ({
            ident,
            request: {
                ainntektListe: grunnlagspakke.ainntektListe.filter((ainntekt) => ainntekt.personId === ident),
                skattegrunnlagListe: grunnlagspakke.skattegrunnlagListe.filter(
                    (skattegrunnlag) => skattegrunnlag.personId === ident
                ),
                overgangsstonadListe: grunnlagspakke.overgangsstonadListe.filter(
                    (overgangsstonad) => overgangsstonad.partPersonId === ident
                ),
                kontantstotteListe: grunnlagspakke.kontantstotteListe.filter(
                    (kontantstotte) => kontantstotte.partPersonId === ident
                ),
                ubstListe: grunnlagspakke.ubstListe.filter((ubst) => ubst.personId === ident),
            },
        }));

    return requests;
};

export const useGrunnlagspakke = (behandling: BehandlingDto) => {
    const { data: grunnlagspakkeId } = useQuery({
        queryKey: ["grunnlagspakkeId"],
        queryFn: async (): Promise<number> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.opprettNyGrunnlagspakke({
                formaal: "FORSKUDD",
                opprettetAv: "saksbehandler",
            });
            return data;
        },
        staleTime: Infinity,
        enabled: !!behandling,
    });

    const grunnlagRequest: OppdaterGrunnlagspakkeRequestDto = createGrunnlagRequest(behandling);

    const { isSuccess: updateIsSuccess } = useQuery({
        queryKey: ["grunnlagspakke", grunnlagspakkeId, "update"],
        queryFn: async (): Promise<OppdaterGrunnlagspakkeDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.oppdaterGrunnlagspakke(
                grunnlagspakkeId,
                grunnlagRequest
            );
            return data;
        },
        staleTime: Infinity,
        enabled: !!grunnlagspakkeId,
    });

    return useQuery({
        queryKey: ["grunnlagspakke", grunnlagspakkeId],
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;
        },
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
    const bidragIncomeRequests = createBidragIncomeRequest(behandling, grunnlagspakke);

    bidragIncomeRequests.forEach((request) => {
        queryClient.prefetchQuery({
            queryKey: ["bidraginntekt", request.ident],
            queryFn: async () => {
                const { data } = await BIDRAG_INNTEKT_API.transformer.transformerInntekter(request.request);
                return data;
            },
            staleTime: Infinity,
        });
    });
};

export const useGetBidragInntektQueries = (behandling: BehandlingDto, grunnlagspakke: HentGrunnlagspakkeDto) => {
    const requests = createBidragIncomeRequest(behandling, grunnlagspakke);

    return useQueries({
        queries: requests.map((request) => {
            return {
                queryKey: ["bidragInntekt", request.ident],
                queryFn: async (): Promise<{ ident: string; data: TransformerInntekterResponseDto }> => {
                    const { data } = await BIDRAG_INNTEKT_API.transformer.transformerInntekter(request.request);
                    return { ident: request.ident, data: data };
                },
                staleTime: Infinity,
                suspense: true,
                enabled: !!behandling && !!grunnlagspakke,
            };
        }),
    });
};
