import { RolleTypeFullName } from "@navikt/bidrag-ui-common/src/types/roller/RolleType";
import { useMutation, useQuery, useQueryClient, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { useCallback } from "react";

import {
    AddOpplysningerRequest,
    BehandlingDto,
    BehandlingDtoV2,
    GrunnlagsdataDto,
    OppdaterBehandlingRequest,
    OppdaterBehandlingRequestV2,
    OpplysningerType,
    RolleDto,
    Rolletype,
    SivilstandBeregnet,
    SivilstandBeregnetStatusEnum,
} from "../api/BidragBehandlingApiV1";
import { NotatDto as NotatPayload } from "../api/BidragDokumentProduksjonApi";
import {
    ArbeidsforholdGrunnlagDto,
    GrunnlagRequestType,
    HentGrunnlagDto,
    HentGrunnlagRequestDto,
} from "../api/BidragGrunnlagApi";
import { PersonDto } from "../api/PersonApi";
import { BEHANDLING_API_V1, BIDRAG_DOKUMENT_PRODUKSJON_API, BIDRAG_GRUNNLAG_API, PERSON_API } from "../constants/api";
import { useForskudd } from "../context/ForskuddContext";
import { FantIkkeVedtakEllerBehandlingError } from "../types/apiStatus";
import { VedtakBeregningResult } from "../types/vedtakTypes";
import { deductMonths, toISODateString } from "../utils/date-utils";
export const MutationKeys = {
    oppdaterBehandling: (behandlingId: number) => ["mutation", "behandling", behandlingId],
    oppdaterBehandlingV2: (behandlingId: number) => ["mutation", "behandlingV2", behandlingId],
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
    behandling: (behandlingId: number, vedtakId?: number) => [
        "behandling",
        QueryKeys.behandlingVersion,
        behandlingId,
        vedtakId,
    ],
    behandlingV2: (behandlingId: number, vedtakId?: number) => [
        "behandlingV2",
        QueryKeys.behandlingVersion,
        behandlingId,
        vedtakId,
    ],
    sivilstandBeregning: (behandlingId: number, virkningstidspunkt: string) => [
        "behandling",
        QueryKeys.behandlingVersion,
        behandlingId,
        "sivilstandBeregning",
        virkningstidspunkt,
    ],
    grunnlag: () => ["grunnlag", QueryKeys.behandlingVersion],
    arbeidsforhold: (behandlingId: number) => ["arbeidsforhold", behandlingId, QueryKeys.behandlingVersion],
    person: (ident: string) => ["person", ident],
    personMulti: (ident: string) => ["persons", ident],
};

export const useGetOpplysninger = <T extends object>(opplysningerType: OpplysningerType): T | null => {
    const behandling = useGetBehandling();
    const opplysninger = behandling.opplysninger?.find(
        (opplysning) => opplysning.grunnlagsdatatype == opplysningerType
    );
    return opplysninger != null ? JSON.parse(opplysninger.data) : null;
};

export const useGetOpplysningerHentetdato = (opplysningerType: OpplysningerType): string | undefined => {
    const behandling = useGetBehandling();
    return behandling.opplysninger.find((opplysning) => opplysning.grunnlagsdatatype == opplysningerType)?.innhentet;
};

export const useOppdaterBehandling = () => {
    const { behandlingId } = useForskudd();

    const mutation = oppdaterBehandlingMutation(behandlingId);

    return { mutation, error: mutation.isError };
};

export const useOppdaterBehandlingV2 = () => {
    const { behandlingId } = useForskudd();

    const mutation = oppdaterBehandlingMutationV2(behandlingId);

    return { mutation, error: mutation.isError };
};
export const oppdaterBehandlingMutation = (behandlingId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: MutationKeys.oppdaterBehandling(behandlingId),
        mutationFn: async (payload: OppdaterBehandlingRequest): Promise<BehandlingDto> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereBehandling(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.behandling(behandlingId), data);
            queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
        },
        onError: (error) => {
            console.log("onError", error);
        },
    });
};
export const oppdaterBehandlingMutationV2 = (behandlingId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: MutationKeys.oppdaterBehandling(behandlingId),
        mutationFn: async (payload: OppdaterBehandlingRequestV2): Promise<BehandlingDtoV2> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereBehandlingV2(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onSuccess: (data) => {
            queryClient.setQueryData(QueryKeys.behandlingV2(behandlingId), data);
            queryClient.refetchQueries({ queryKey: QueryKeys.behandling(behandlingId) });
        },
        onError: (error) => {
            console.log("onError", error);
        },
    });
};

export const useAddOpplysningerData = () => {
    const { behandlingId } = useForskudd();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (payload: AddOpplysningerRequest): Promise<GrunnlagsdataDto> =>
            (await BEHANDLING_API_V1.api.leggTilOpplysninger(behandlingId, payload))?.data,
        onSuccess: (data) => {
            queryClient.setQueryData<BehandlingDto>(QueryKeys.behandling(behandlingId), (prevData) => {
                const prevDataExists = prevData.opplysninger.some(
                    (opplysning) => opplysning.grunnlagsdatatype == data.grunnlagsdatatype
                );

                const opplysninger = prevDataExists
                    ? prevData.opplysninger.map((saved) => {
                          if (saved.grunnlagsdatatype == data.grunnlagsdatatype) {
                              return data;
                          }
                          return saved;
                      })
                    : [...prevData.opplysninger, data];
                return {
                    ...prevData,
                    opplysninger,
                };
            });
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
        queryFn: (): Promise<AxiosResponse<Record<string, string>>> => BEHANDLING_API_V1.api.hentVisningsnavn(),
        staleTime: 0,
    });

export const useGetBehandling = (): BehandlingDto => {
    const { behandlingId, vedtakId } = useForskudd();
    const { data: behandling } = useSuspenseQuery({
        queryKey: QueryKeys.behandling(behandlingId, vedtakId),
        queryFn: async (): Promise<BehandlingDto> => {
            try {
                if (vedtakId) {
                    const { data } = await BEHANDLING_API_V1.api.vedtakLesemodusV1(vedtakId);
                    return data;
                }
                const { data } = await BEHANDLING_API_V1.api.hentBehandling(behandlingId);
                return data;
            } catch (e) {
                console.log(e, e.status == 404);
                if (e instanceof AxiosError && e.response.status == 404) {
                    throw new FantIkkeVedtakEllerBehandlingError(
                        `Fant ikke ${vedtakId ? "vedtak" : "behandling"} med id ${vedtakId ?? behandlingId}`
                    );
                }
                throw e;
            }
        },
        retry: (count, error) => {
            if (error instanceof FantIkkeVedtakEllerBehandlingError) {
                return false;
            }
            return count < 3;
        },
        staleTime: Infinity,
    });
    return behandling;
};

export const useGetBehandlingV2 = (): BehandlingDtoV2 => {
    const { behandlingId, vedtakId } = useForskudd();
    return useBehandlingV2(behandlingId, vedtakId);
};

export const useBehandlingV2 = (behandlingId?: number, vedtakId?: number): BehandlingDtoV2 => {
    const { data: behandling } = useSuspenseQuery({
        queryKey: QueryKeys.behandlingV2(behandlingId, vedtakId),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    return await BEHANDLING_API_V1.api.vedtakLesemodus(vedtakId);
                }
                return await BEHANDLING_API_V1.api.hentBehandlingV2(behandlingId);
            } catch (e) {
                if (e instanceof AxiosError && e.response.status == 404) {
                    throw new FantIkkeVedtakEllerBehandlingError(
                        `Fant ikke ${vedtakId ? "vedtak" : "behandling"} med id ${vedtakId ?? behandlingId}`
                    );
                }
                throw e;
            }
        },
        select: (data): BehandlingDtoV2 => data?.data,
        retry: (count, error) => {
            if (error instanceof FantIkkeVedtakEllerBehandlingError) {
                return false;
            }
            return count < 3;
        },
        staleTime: Infinity,
    });
    return behandling;
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

const createGrunnlagRequest = (behandling: BehandlingDto): HentGrunnlagRequestDto => {
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

    const grunnlagRequest: HentGrunnlagRequestDto = {
        formaal: "FORSKUDD",
        grunnlagRequestDtoListe: bmRequests.concat(skattegrunnlagBarnRequests),
    };

    return grunnlagRequest;
};

export const useSivilstandOpplysningerProssesert = (): SivilstandBeregnet => {
    const behandling = useGetBehandling();
    const { sivilstandListe } = useGrunnlag();

    const { lesemodus } = useForskudd();
    const { data: beregnet } = useSuspenseQuery({
        queryKey: QueryKeys.sivilstandBeregning(behandling.id, behandling.virkningstidspunkt.virkningstidspunkt),
        queryFn: async () => {
            if (lesemodus) {
                return { status: SivilstandBeregnetStatusEnum.OK, sivilstandListe: [] };
            }
            return (await BEHANDLING_API_V1.api.konverterSivilstand(behandling.id, sivilstandListe)).data;
        },
        staleTime: Infinity,
    });
    return beregnet ?? { status: SivilstandBeregnetStatusEnum.OK, sivilstandListe: [] };
};

export const useGrunnlag = (): HentGrunnlagDto | null => {
    const behandling = useGetBehandling();
    const grunnlagRequest = createGrunnlagRequest(behandling);

    const { data: grunnlagspakke } = useSuspenseQuery({
        queryKey: QueryKeys.grunnlag(),
        queryFn: async (): Promise<HentGrunnlagDto> => {
            const { data } = await BIDRAG_GRUNNLAG_API.hentgrunnlag.hentGrunnlag(grunnlagRequest);
            return data;
        },
        staleTime: Infinity,
    });
    return grunnlagspakke;
};

export const useHentArbeidsforhold = (): ArbeidsforholdGrunnlagDto[] => {
    const grunnlag = useGrunnlag();
    return grunnlag?.arbeidsforholdListe ?? [];
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
    const { behandlingId, vedtakId } = useForskudd();

    return useSuspenseQuery<VedtakBeregningResult>({
        queryKey: QueryKeys.beregningForskudd(),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    const response = await BEHANDLING_API_V1.api.hentVedtakBeregningResultat(vedtakId);
                    return { resultat: response.data };
                }
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
