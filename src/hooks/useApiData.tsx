import { RolleTypeFullName } from "@navikt/bidrag-ui-common/src/types/roller/RolleType";
import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
    useSuspenseQueries,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { useCallback } from "react";

import {
    AddOpplysningerRequest,
    BehandlingDto,
    OppdaterBehandlingRequest,
    OppdatereVirkningstidspunktRequest,
    OpplysningerDto,
    OpplysningerType,
    RolleDto,
    Rolletype,
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
    BEHANDLING_API_V1,
    BIDRAG_DOKUMENT_PRODUKSJON_API,
    BIDRAG_GRUNNLAG_API,
    BIDRAG_INNTEKT_API,
    PERSON_API,
} from "../constants/api";
import { useForskudd } from "../context/ForskuddContext";
import { VedtakBeregningResult } from "../types/vedtakTypes";
import { deductMonths, toISODateString } from "../utils/date-utils";
import useFeatureToogle from "./useFeatureToggle";
export const MutationKeys = {
    oppdaterBehandling: (behandlingId: number) => ["mutation", "behandling", behandlingId],
    updateBoforhold: (behandlingId: number) => ["mutation", "boforhold", behandlingId],
    updateInntekter: (behandlingId: number) => ["mutation", "inntekter", behandlingId],
    updateVirkningstidspunkt: (behandlingId: number) => ["mutation", "virkningstidspunkt", behandlingId],
};

export const QueryKeys = {
    behandlingVersion: "V1",
    virkningstidspunkt: (behandlingId: number) => ["virkningstidspunkt", QueryKeys.behandlingVersion, behandlingId],
    visningsnavn: () => ["visningsnavn", QueryKeys.behandlingVersion],
    beregningForskudd: () => ["beregning_forskudd", QueryKeys.behandlingVersion],
    notat: (behandlingId) => ["notat_payload", QueryKeys.behandlingVersion, behandlingId],
    behandling: (behandlingId: number) => ["behandling", QueryKeys.behandlingVersion, behandlingId],
    grunnlagspakkeUpdate: (grunnlagspakkeId: number) => [
        "grunnlagspakke",
        grunnlagspakkeId,
        "update",
        QueryKeys.behandlingVersion,
    ],
    grunnlagspakke: (grunnlagspakkeId: number) => ["grunnlagspakke", grunnlagspakkeId, QueryKeys.behandlingVersion],
    arbeidsforhold: (behandlingId: number) => ["arbeidsforhold", behandlingId, QueryKeys.behandlingVersion],
    grunnlagspakkeId: () => ["grunnlagspakkeId", QueryKeys.behandlingVersion],
    person: (ident: string) => ["person", ident],
    personMulti: (ident: string) => ["persons", ident],
};

export const useGetOpplysninger = (opplysningerType: OpplysningerType) => {
    const behandling = useGetBehandling();
    return behandling.opplysninger.find((opplysning) => opplysning.type == opplysningerType);
};

export const useOppdaterBehandling = () => {
    const { behandlingId } = useForskudd();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: MutationKeys.oppdaterBehandling(behandlingId),
        mutationFn: async (payload: OppdaterBehandlingRequest): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereBehandling(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.behandling(behandlingId), data);
        },
        onError: (error) => {
            console.log("onError", error);
        },
    });

    return { mutation, error: mutation.isError };
};

export const usePrefetchBehandlingAndGrunnlagspakke = async (behandlingId) => {
    const { isInntektSkjermbildeEnabled } = useFeatureToogle();

    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
        queryKey: QueryKeys.behandling(behandlingId),
        queryFn: async (): Promise<BehandlingDto> => (await BEHANDLING_API_V1.api.hentBehandling(behandlingId)).data,
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
        await BEHANDLING_API_V1.api.oppdatereBehandling(behandlingId, { grunnlagspakkeId });
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

export const useAddOpplysningerData = () => {
    const { behandlingId } = useForskudd();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (payload: AddOpplysningerRequest): Promise<OpplysningerDto> => {
            const { data } = await BEHANDLING_API_V1.api.addOpplysningerData(behandlingId, payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData<BehandlingDto>(QueryKeys.behandling(behandlingId), (prevData) => ({
                ...prevData,
                opplysninger: prevData.opplysninger.map((saved) => {
                    if (saved.type == data.type) {
                        return data;
                    }
                    return saved;
                }),
            }));
        },
    });

    return { mutation, error: mutation.isError };
};

/**
 *
 * V1
 *
 */

export const useGetVisningsnavn = () =>
    useSuspenseQuery({
        queryKey: QueryKeys.visningsnavn(),
        queryFn: (): Promise<AxiosResponse<Record<string, string>>> => BEHANDLING_API_V1.api.hentVisningsnavn1(),
        staleTime: 0,
    });

export const useGetBehandling = (): BehandlingDto => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useSuspenseQuery({
        queryKey: QueryKeys.behandling(behandlingId),
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API_V1.api.hentBehandling(behandlingId);
            return data;
        },
        retry: 3,
        staleTime: Infinity,
    });
    return behandling;
};

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
            queryKey: QueryKeys.person(rolle.ident),
            queryFn: async (): Promise<PersonDto> => {
                if (!rolle.ident) return { ident: "", visningsnavn: rolle.navn };
                const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: rolle.ident });
                return data;
            },
            staleTime: Infinity,
            select: useCallback(
                (data) => ({
                    ...rolle,
                    rolleType: rolle.rolletype as unknown as RolleTypeFullName,
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
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolletype === Rolletype.BM).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolletype === Rolletype.BA);
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
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolletype === Rolletype.BM).ident;
    const barnIdenter = behandling?.roller
        ?.filter((rolle) => rolle.rolletype === Rolletype.BA)
        .map((barn) => barn.ident);

    const requests: { ident: string; request: TransformerInntekterRequest }[] = barnIdenter
        .concat(bmIdent)
        .map((ident) => ({
            ident,
            request: {
                ainntektHentetDato: toISODateString(new Date()),
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

const useGetGrunnlagspakkeId = () => {
    const { behandlingId } = useForskudd();
    const { grunnlagspakkeid } = useGetBehandling();
    const { data: grunnlagspakkeId } = useSuspenseQuery({
        queryKey: QueryKeys.grunnlagspakkeId(),
        queryFn: async (): Promise<number> => {
            if (grunnlagspakkeid) {
                return grunnlagspakkeid;
            }
            const { data: grunnlagspakkeId } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.opprettNyGrunnlagspakke({
                formaal: "FORSKUDD",
            });
            await BEHANDLING_API_V1.api.oppdatereBehandling(behandlingId, { grunnlagspakkeId });
            return grunnlagspakkeId;
        },
        staleTime: Infinity,
    });

    return grunnlagspakkeId;
};

export const useGrunnlagspakke = (): HentGrunnlagspakkeDto | null => {
    const behandling = useGetBehandling();
    const grunnlagRequest = createGrunnlagRequest(behandling);
    const grunnlagspakkeId = useGetGrunnlagspakkeId();
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

    const { data: grunnlagspakke } = useSuspenseQuery({
        queryKey: QueryKeys.grunnlagspakke(grunnlagspakkeId),
        queryFn: async (): Promise<HentGrunnlagspakkeDto> => {
            if (!updateIsSuccess) return null;
            const { data } = await BIDRAG_GRUNNLAG_API.grunnlagspakke.hentGrunnlagspakke(grunnlagspakkeId);
            return data;
        },
        staleTime: Infinity,
    });
    return grunnlagspakke;
};

export const useHentArbeidsforhold = (): HentGrunnlagDto | null => {
    const behandling = useGetBehandling();
    const grunnlagspakkeId = useGetGrunnlagspakkeId();
    const today = new Date();
    const arbeidsforholdRequest: HentGrunnlagRequestDto = {
        grunnlagRequestDtoListe: behandling.roller
            .filter((rolle) => [Rolletype.BM, Rolletype.BP].includes(rolle.rolletype))
            .map((rolle) => ({
                type: GrunnlagRequestType.ARBEIDSFORHOLD,
                personId: rolle.ident,
                periodeFra: behandling.søktFomDato,
                periodeTil: toISODateString(today),
            })),
    };
    const { data: arbeidsforhold } = useSuspenseQuery({
        queryKey: QueryKeys.arbeidsforhold(grunnlagspakkeId),
        queryFn: async (): Promise<HentGrunnlagDto> =>
            (await BIDRAG_GRUNNLAG_API.hentgrunnlag.hentGrunnlag(arbeidsforholdRequest)).data,
        staleTime: Infinity,
    });
    return arbeidsforhold;
};

export const usePrefetchBehandlingAndGrunnlagspakke2 = async (behandlingId) => {
    const { isInntektSkjermbildeEnabled } = useFeatureToogle();

    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
        queryKey: QueryKeys.behandling(behandlingId),
        queryFn: async (): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API_V1.api.hentBehandling(behandlingId);
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
        await BEHANDLING_API_V1.api.oppdatereBehandling(behandlingId, { grunnlagspakkeId });
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

export const useNotat = (behandlingId: number) => {
    const resultPayload = useQuery({
        queryKey: QueryKeys.notat(behandlingId),
        queryFn: async () => (await BEHANDLING_API_V1.api.hentNotatOpplysninger(behandlingId)).data,
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

export const useGetBeregningForskudd = () => {
    const { behandlingId } = useForskudd();

    return useSuspenseQuery<VedtakBeregningResult>({
        queryKey: QueryKeys.beregningForskudd(),
        queryFn: async () => {
            try {
                const response = await BEHANDLING_API_V1.api.beregnForskudd(behandlingId);
                return { resultat: response.data };
            } catch (error) {
                if (error instanceof AxiosError && error.response.status == 400) {
                    console.log(error.response.headers["warning"]);
                    return {
                        feil: error.response.headers["warning"]?.split(",") ?? [],
                    };
                }
            }
        },
    });
};
