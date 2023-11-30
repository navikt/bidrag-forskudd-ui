import { RolleTypeFullName } from "@navikt/bidrag-ui-common/src/types/roller/RolleType";
import { useMutation, useQueries, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useCallback } from "react";

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
import useFeatureToogle from "./useFeatureToggle";
export const MutationKeys = {
    updateBoforhold: (behandlingId: number) => ["mutation", "boforhold", behandlingId],
    updateInntekter: (behandlingId: number) => ["mutation", "inntekter", behandlingId],
    updateVirkningstidspunkt: (behandlingId: number) => ["mutation", "virkningstidspunkt", behandlingId],
};

export const QueryKeys = {
    virkningstidspunkt: (behandlingId: number) => ["virkningstidspunkt", behandlingId],
    visningsnavn: () => ["visningsnavn"],
    behandling: (behandlingId: number) => ["behandling", behandlingId],
    boforhold: (behandlingId: number) => ["boforhold", behandlingId],
    inntekter: (behandlingId: number) => ["inntekter", behandlingId],
    grunnlagspakkeUpdate: (grunnlagspakkeId: number) => ["grunnlagspakke", grunnlagspakkeId, "update"],
    grunnlagspakke: (grunnlagspakkeId: number) => ["grunnlagspakke", grunnlagspakkeId],
    grunnlagspakkeId: () => ["grunnlagspakkeId"],
    opplysninger: (behandlingId: number, opplysningerType: OpplysningerType) => [
        "opplysninger",
        behandlingId,
        opplysningerType,
    ],
};

export const useGetVisningsnavn = () =>
    useSuspenseQuery({
        queryKey: QueryKeys.visningsnavn(),
        queryFn: (): Promise<AxiosResponse<Record<string, string>>> => BEHANDLING_API.api.hentVisningsnavn(),
        staleTime: 0,
    });
export const useGetBehandlings = () =>
    useQuery({
        queryKey: ["behandlings"],
        queryFn: (): Promise<AxiosResponse<BehandlingDto[]>> => BEHANDLING_API.api.hentBehandlinger(),
        staleTime: 0,
    });

export const useGetBehandling = (behandlingId: number) =>
    useQuery({
        queryKey: QueryKeys.behandling(behandlingId),
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API.api.hentBehandling(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useGetVirkningstidspunkt = (behandlingId: number) =>
    useQuery({
        queryKey: QueryKeys.virkningstidspunkt(behandlingId),
        queryFn: async (): Promise<VirkningsTidspunktResponse> => {
            const { data } = await BEHANDLING_API.api.hentVirkningsTidspunkt(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useUpdateVirkningstidspunkt = (behandlingId: number) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: MutationKeys.updateVirkningstidspunkt(behandlingId),
        mutationFn: async (payload: UpdateVirkningsTidspunktRequest): Promise<VirkningsTidspunktResponse> => {
            const { data } = await BEHANDLING_API.api.oppdaterVirkningsTidspunkt(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.virkningstidspunkt(behandlingId), data);
        },
        onError: (error) => {
            console.log("onError", error);
        },
    });

    return { mutation, error: mutation.isError };
};

export const useGetBoforhold = (behandlingId: number) =>
    useQuery({
        queryKey: QueryKeys.boforhold(behandlingId),
        queryFn: async (): Promise<BoforholdResponse> => {
            const { data } = await BEHANDLING_API.api.hentBoforhold(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useGetOpplysninger = (behandlingId: number, opplysningerType: OpplysningerType) =>
    useQuery({
        queryKey: QueryKeys.opplysninger(behandlingId, opplysningerType),
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
    });

export const useUpdateBoforhold = (behandlingId: number) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: UpdateBoforholdRequest): Promise<BoforholdResponse> => {
            const { data } = await BEHANDLING_API.api.oppdatereBoforhold(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.boforhold(behandlingId), data);
        },
        onError: (error) => {
            console.log("onError", error);
        },
    });

    return { mutation, error: mutation.isError };
};

export const useUpdateInntekter = (behandlingId: number) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: MutationKeys.updateInntekter(behandlingId),
        mutationFn: async (payload: UpdateInntekterRequest): Promise<InntekterResponse> => {
            const { data } = await BEHANDLING_API.api.oppdaterInntekter(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.inntekter(behandlingId), data);
        },
        onError: (error) => {
            console.log("onError", error);
        },
    });

    return { mutation, error: mutation.isError };
};

export const useHentInntekter = (behandlingId: number) =>
    useQuery({
        queryKey: QueryKeys.inntekter(behandlingId),
        queryFn: async (): Promise<InntekterResponse> => {
            const { data } = await BEHANDLING_API.api.hentInntekter(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useHentPersonData = (ident: string) =>
    useQuery({
        queryKey: ["persons", ident],
        queryFn: async (): Promise<PersonDto> => {
            const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: ident });
            return data;
        },
        staleTime: Infinity,
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
            select: useCallback(
                (data: PersonDto) => ({
                    ...rolle,
                    rolleType: rolle.rolleType as unknown as RolleTypeFullName,
                    navn: data.navn,
                    kortnavn: data.kortnavn,
                    visningsnavn: data.visningsnavn,
                }),
                []
            ),
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
                            beløp: Math.round(ainntekt.belop),
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
                kontantstøtteliste: grunnlagspakke.kontantstotteListe
                    .filter((kontantstotte) => kontantstotte.barnPersonId === ident)
                    .map((kontantstotte) => ({ ...kontantstotte, beløp: kontantstotte.belop })),
                utvidetBarnetrygdOgSmåbarnstilleggliste: grunnlagspakke.ubstListe
                    .filter((ubst) => ubst.personId === ident)
                    .map((ubst) => ({ ...ubst, beløp: ubst.belop })),
            } as TransformerInntekterRequest,
        }));

    return requests;
};

const useCreateGrunnlagspakke = (behandling: BehandlingDto) => {
    const { data: grunnlagspakkeId } = useQuery({
        queryKey: QueryKeys.grunnlagspakkeId(),
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
    const grunnlagspakkeId = behandling?.grunnlagspakkeid
        ? behandling.grunnlagspakkeid
        : useCreateGrunnlagspakke(behandling);
    const grunnlagRequest = createGrunnlagRequest(behandling);
    const { isSuccess: updateIsSuccess } = useQuery({
        queryKey: QueryKeys.grunnlagspakkeUpdate(grunnlagspakkeId),
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
        queryKey: QueryKeys.grunnlagspakke(grunnlagspakkeId),
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;
        },
        staleTime: Infinity,
        enabled: !!updateIsSuccess,
    });
};

export const usePrefetchBehandlingAndGrunnlagspakke = async (behandlingId) => {
    const { isInntektSkjermbildeEnabled } = useFeatureToogle();

    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
        queryKey: QueryKeys.behandling(behandlingId),
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API.api.hentBehandling(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

    const behandling: BehandlingDto = queryClient.getQueryData(QueryKeys.behandling(behandlingId));

    if (behandling?.grunnlagspakkeid) {
        queryClient.setQueryData(QueryKeys.grunnlagspakkeId(), behandling.grunnlagspakkeid);
    } else {
        await queryClient.prefetchQuery({
            queryKey: QueryKeys.grunnlagspakkeId(),
            queryFn: async (): Promise<number> => {
                const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.opprettNyGrunnlagspakke({
                    formaal: "FORSKUDD",
                    opprettetAv: "saksbehandler",
                });
                return data;
            },
            staleTime: Infinity,
        });

        const grunnlagspakkeId = queryClient.getQueryData<number>(QueryKeys.grunnlagspakkeId());
        await BEHANDLING_API.api.updateBehandling(behandlingId, { grunnlagspakkeId });
        queryClient.setQueryData(QueryKeys.behandling(behandlingId), {
            ...behandling,
            grunnlagspakkeid: grunnlagspakkeId,
        });
    }

    const grunnlagspakkeId = queryClient.getQueryData<number>(QueryKeys.grunnlagspakkeId());
    const grunnlagRequest = createGrunnlagRequest(behandling);

    await queryClient.prefetchQuery({
        queryKey: QueryKeys.grunnlagspakkeUpdate(grunnlagspakkeId),
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
        queryKey: QueryKeys.grunnlagspakke(grunnlagspakkeId),
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;
        },
        staleTime: Infinity,
    });

    if (isInntektSkjermbildeEnabled) {
        const grunnlagspakke: HentGrunnlagspakkeDto = queryClient.getQueryData(
            QueryKeys.grunnlagspakke(grunnlagspakkeId)
        );
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
    }
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
    const mutation = useMutation({
        mutationFn: async (payload: AddOpplysningerRequest): Promise<OpplysningerDto> => {
            const { data } = await BEHANDLING_API.api.addOpplysningerData(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.opplysninger(behandlingId, opplysningerType), data);
        },
    });

    return { mutation, error: mutation.isError };
};
