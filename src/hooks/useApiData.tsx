import { RolleTypeFullName } from "@navikt/bidrag-ui-common/src/types/roller/RolleType";
import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
    useSuspenseQueries,
    useSuspenseQuery,
    UseSuspenseQueryResult,
} from "@tanstack/react-query";
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
    UpdateBoforholdRequest,
    UpdateInntekterRequest,
} from "../api/BidragBehandlingApi";
import {
    OppdatereVirkningstidspunktRequest,
    VirkningstidspunktResponse as VirkningstidspunktResponseV1,
} from "../api/BidragBehandlingApiV1";
import { NotatDto as NotatPayload } from "../api/BidragDokumentProduksjonApi";
import {
    GrunnlagRequestType,
    HentGrunnlagDto,
    HentGrunnlagRequestDto,
    HentGrunnlagspakkeDto,
    OppdaterGrunnlagspakkeDto,
    OppdaterGrunnlagspakkeRequestDto,
} from "../api/BidragGrunnlagApi";
import { TransformerInntekterRequest, TransformerInntekterResponse } from "../api/BidragInntektApi";
import { PersonDto } from "../api/PersonApi";
import {
    BEHANDLING_API,
    BEHANDLING_API_V1,
    BIDRAG_DOKUMENT_PRODUKSJON_API,
    BIDRAG_GRUNNLAG_API,
    BIDRAG_INNTEKT_API,
    PERSON_API,
} from "../constants/api";
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
    notat: (behandlingId) => ["notat_payload", behandlingId],
    behandling: (behandlingId: number) => ["behandling", behandlingId],
    boforhold: (behandlingId: number) => ["boforhold", behandlingId],
    inntekter: (behandlingId: number) => ["inntekter", behandlingId],
    grunnlagspakkeUpdate: (grunnlagspakkeId: number) => ["grunnlagspakke", grunnlagspakkeId, "update"],
    grunnlagspakke: (grunnlagspakkeId: number) => ["grunnlagspakke", grunnlagspakkeId],
    arbeidsforhold: (behandlingId: number) => ["arbeidsforhold", behandlingId],
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
    useSuspenseQuery({
        queryKey: ["behandlings"],
        queryFn: (): Promise<AxiosResponse<BehandlingDto[]>> => BEHANDLING_API.api.hentBehandlinger(),
        staleTime: 0,
    });

export const useGetBehandling = (behandlingId: number) =>
    useSuspenseQuery({
        queryKey: QueryKeys.behandling(behandlingId),
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API.api.hentBehandling(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useGetVirkningstidspunkt = (behandlingId: number) =>
    useSuspenseQuery({
        queryKey: QueryKeys.virkningstidspunkt(behandlingId),
        queryFn: async (): Promise<VirkningstidspunktResponseV1> => {
            const { data } = await BEHANDLING_API_V1.api.hentVirkningsTidspunkt(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useUpdateVirkningstidspunkt = (behandlingId: number) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: MutationKeys.updateVirkningstidspunkt(behandlingId),
        mutationFn: async (payload: OppdatereVirkningstidspunktRequest): Promise<VirkningstidspunktResponseV1> => {
            const { data } = await BEHANDLING_API_V1.api.oppdaterVirkningsTidspunkt(behandlingId, payload);
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
    useSuspenseQuery({
        queryKey: QueryKeys.boforhold(behandlingId),
        queryFn: async (): Promise<BoforholdResponse> => {
            const { data } = await BEHANDLING_API.api.hentBoforhold(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useGetOpplysninger = (behandlingId: number, opplysningerType: OpplysningerType) =>
    useSuspenseQuery({
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
    useSuspenseQuery({
        queryKey: QueryKeys.inntekter(behandlingId),
        queryFn: async (): Promise<InntekterResponse> => {
            const { data } = await BEHANDLING_API.api.hentInntekter(behandlingId);
            return data;
        },
        staleTime: Infinity,
    });

export const useHentPersonData = (ident: string) =>
    useSuspenseQuery({
        queryKey: ["persons", ident],
        queryFn: async (): Promise<PersonDto> => {
            if (!ident) return { ident: "", visningsnavn: "Ukjent" };
            const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: ident });
            return data;
        },
        staleTime: Infinity,
    });

export const usePersonsQueries = (roller: RolleDto[]) =>
    useSuspenseQueries({
        queries: roller.map((rolle) => ({
            queryKey: ["persons", rolle.ident],
            queryFn: async (): Promise<PersonDto> => {
                const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: rolle.ident });
                return data;
            },
            staleTime: Infinity,
            select: useCallback(
                (data) => ({
                    ...rolle,
                    rolleType: rolle.rolleType as unknown as RolleTypeFullName,
                    navn: data.navn,
                    kortnavn: data.kortnavn,
                    visningsnavn: data.visningsnavn,
                }),
                []
            ),
            enabled: !!rolle,
        })),
    });

const createGrunnlagRequest = (behandling: BehandlingDto) => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN);
    const today = new Date();
    const periodeFra = toISODateString(deductMonths(today, 36));

    const skattegrunnlagBarnRequests = barn?.map((b) => ({
        type: GrunnlagRequestType.SKATTEGRUNNLAG,
        personId: b.ident,
        periodeFra,
        periodeTil: toISODateString(today),
    }));

    const bmRequests = [
        GrunnlagRequestType.AINNTEKT,
        GrunnlagRequestType.SKATTEGRUNNLAG,
        GrunnlagRequestType.UTVIDETBARNETRYGDOGSMABARNSTILLEGG,
        GrunnlagRequestType.BARNETILLEGG,
        GrunnlagRequestType.HUSSTANDSMEDLEMMER_OG_EGNE_BARN,
        GrunnlagRequestType.SIVILSTAND,
        GrunnlagRequestType.ARBEIDSFORHOLD,
    ].map((type) => ({
        type,
        personId: bmIdent,
        periodeFra:
            type === GrunnlagRequestType.AINNTEKT
                ? toISODateString(deductMonths(today, today.getDate() > 6 ? 12 : 13))
                : periodeFra,
        periodeTil:
            type === GrunnlagRequestType.AINNTEKT
                ? toISODateString(deductMonths(today, today.getDate() > 6 ? 0 : 1))
                : toISODateString(today),
    }));

    const grunnlagRequest: OppdaterGrunnlagspakkeRequestDto = {
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
    const { data: grunnlagspakkeId } = useSuspenseQuery({
        queryKey: QueryKeys.grunnlagspakkeId(),
        queryFn: async (): Promise<number> => {
            const { data: grunnlagspakkeId } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.opprettNyGrunnlagspakke({
                formaal: "FORSKUDD",
            });
            await BEHANDLING_API.api.updateBehandling(behandling.id, { grunnlagspakkeId });
            return grunnlagspakkeId;
        },
        staleTime: Infinity,
    });

    return grunnlagspakkeId;
};

export const useGrunnlagspakke = (behandling: BehandlingDto): UseSuspenseQueryResult<HentGrunnlagspakkeDto | null> => {
    const grunnlagspakkeId = behandling?.grunnlagspakkeid
        ? behandling.grunnlagspakkeid
        : useCreateGrunnlagspakke(behandling);
    const grunnlagRequest = createGrunnlagRequest(behandling);
    const { isSuccess: updateIsSuccess } = useSuspenseQuery({
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

    return useSuspenseQuery({
        queryKey: QueryKeys.grunnlagspakke(grunnlagspakkeId),
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {
            if (!updateIsSuccess) return null;
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;
        },
        staleTime: Infinity,
    });
};

export const useHentArbeidsforhold = (behandlingId: number): UseSuspenseQueryResult<HentGrunnlagDto | null> => {
    const { data: behandling } = useGetBehandling(behandlingId);
    const grunnlagspakkeId = behandling?.grunnlagspakkeid
        ? behandling.grunnlagspakkeid
        : useCreateGrunnlagspakke(behandling);
    const today = new Date();
    const arbeidsforholdRequest: HentGrunnlagRequestDto = {
        grunnlagRequestDtoListe: behandling.roller
            .filter((rolle) =>
                [RolleDtoRolleType.BIDRAGSMOTTAKER, RolleDtoRolleType.BIDRAGSPLIKTIG].includes(rolle.rolleType)
            )
            .map((rolle) => ({
                type: GrunnlagRequestType.ARBEIDSFORHOLD,
                personId: rolle.ident,
                periodeFra: behandling.datoFom,
                periodeTil: toISODateString(today),
            })),
    };
    return useSuspenseQuery({
        queryKey: QueryKeys.arbeidsforhold(grunnlagspakkeId),
        queryFn: async (): Promise<HentGrunnlagDto> =>
            (await BIDRAG_GRUNNLAG_API.hentgrunnlag.hentGrunnlag(arbeidsforholdRequest)).data,
        staleTime: Infinity,
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

export const useAddOpplysningerData = (behandlingId: number) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (payload: AddOpplysningerRequest): Promise<OpplysningerDto> => {
            const { data } = await BEHANDLING_API.api.addOpplysningerData(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.opplysninger(behandlingId, data.opplysningerType), data);
        },
    });

    return { mutation, error: mutation.isError };
};

export const useNotat = (behandlingId: number) => {
    const resultPayload = useQuery({
        queryKey: QueryKeys.notat(behandlingId),
        queryFn: async () => (await BEHANDLING_API.api.hentNotatOpplysninger(behandlingId)).data,
        refetchOnWindowFocus: false,
        refetchInterval: 0,
    });

    const resultNotatHtml = useQuery({
        queryKey: ["notat_html", behandlingId, resultPayload.data],
        queryFn: () =>
            BIDRAG_DOKUMENT_PRODUKSJON_API.api.generateHtml(
                "forskudd",
                //@ts-ignore
                resultPayload.data as NotatPayload
            ),
        select: (response) => response.data,
        enabled: resultPayload.isFetched,
        refetchOnWindowFocus: false,
        refetchInterval: 0,
        staleTime: Infinity,
        placeholderData: (previousData) => previousData,
    });

    return resultPayload.isError || resultPayload.isLoading ? resultPayload : resultNotatHtml;
};
