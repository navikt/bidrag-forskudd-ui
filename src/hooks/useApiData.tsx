import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

import {
    AddOpplysningerRequest,
    BehandlingDto,
    BoforholdResponse,
    InntekterResponse,
    OpplysningerDto,
    OpplysningerType,
    RolleDto,
    RolleDtoRolleType,
    UpdateBehandlingRequest,
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
import { TransformerInntekterRequest, TransformerInntekterResponse } from "../api/BidragInntektApi";
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

export const useGetOpplysninger = (behandlingId: number, opplysningerType: OpplysningerType) =>
    useQuery({
        queryKey: ["opplysninger", behandlingId, opplysningerType],
        queryFn: async (): Promise<OpplysningerDto> => {
            try {
                const { data } = await BEHANDLING_API.api.hentAktiv(behandlingId, opplysningerType);
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
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN);
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
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER).ident;
    const barnIdenter = behandling?.roller
        ?.filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN)
        .map((barn) => barn.ident);

    const requests: { ident: string; request: TransformerInntekterRequest }[] = barnIdenter
        .concat(bmIdent)
        .map((ident) => ({
            ident,
            request: {
                ainntektsposter: grunnlagspakke.ainntektListe
                    .filter((ainntekt) => ainntekt.personId === ident)
                    .flatMap((ainntekt) =>
                        ainntekt.ainntektspostListe.map((ainntekt) => ({
                            ...ainntekt,
                            belop: Math.round(ainntekt.belop),
                        }))
                    ),
                skattegrunnlagsliste: grunnlagspakke.skattegrunnlagListe
                    .filter((skattegrunnlag) => skattegrunnlag.personId === ident)
                    .map((skattegrunnlag) => ({
                        skattegrunnlagsposter: skattegrunnlag.skattegrunnlagListe,
                        ligningsår: new Date(Date.parse(skattegrunnlag.periodeFra)).getFullYear(),
                    })),
                overgangsstonadsliste: grunnlagspakke.overgangsstonadListe.filter(
                    (overgangsstonad) => overgangsstonad.partPersonId === ident
                ),
            } as TransformerInntekterRequest,
        }));

    return requests;
};

const useCreateGrunnlagspakke = (behandling: BehandlingDto) => {
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

    const mutation = useMutation({
        mutationFn: async (payload: UpdateBehandlingRequest): Promise<void> => {
            await BEHANDLING_API.api.updateBehandling(behandling.id, payload);
        },
    });
    mutation.mutate({ grunnlagspakkeId });

    return grunnlagspakkeId;
};

export const useGrunnlagspakke = (behandling: BehandlingDto) => {
    const grunnlagspakkeId = behandling?.grunnlagspakkeId
        ? behandling.grunnlagspakkeId
        : useCreateGrunnlagspakke(behandling);
    const grunnlagRequest = createGrunnlagRequest(behandling);
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

    const behandling: BehandlingDto = queryClient.getQueryData(["behandling", behandlingId]);

    if (behandling?.grunnlagspakkeId) {
        queryClient.setQueryData(["grunnlagspakkeId"], behandling.grunnlagspakkeId);
    } else {
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

        const grunnlagspakkeId = queryClient.getQueryData<number>(["grunnlagspakkeId"]);
        await BEHANDLING_API.api.updateBehandling(behandlingId, { grunnlagspakkeId });
        queryClient.setQueryData(["behandling", behandlingId], { ...behandling, grunnlagspakkeId: grunnlagspakkeId });
    }

    const grunnlagspakkeId = queryClient.getQueryData<number>(["grunnlagspakkeId"]);
    const grunnlagRequest = createGrunnlagRequest(behandling);

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
                queryFn: async (): Promise<{ ident: string; data: TransformerInntekterResponse }> => {
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

export const useAddOpplysningerData = (behandlingId: number, opplysningerType: OpplysningerType) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(undefined);

    const mutation = useMutation({
        mutationFn: async (payload: AddOpplysningerRequest): Promise<OpplysningerDto> => {
            const { data } = await BEHANDLING_API.api.addOpplysningerData(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["opplysninger", behandlingId, opplysningerType], data);
            setError(undefined);
        },
        onError: (error) => {
            console.log("onError", error);
            setError(error);
        },
    });

    return { mutation, error };
};
