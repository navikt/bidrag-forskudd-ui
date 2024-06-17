import {
    AktivereGrunnlagRequestV2,
    AktivereGrunnlagResponseV2,
    ArbeidsforholdGrunnlagDto,
    BehandlingDtoV2,
    BeregningValideringsfeil,
    HusstandsbarnGrunnlagDto,
    OppdatereBoforholdRequestV2,
    OppdatereBoforholdResponse,
    OppdatereInntektRequest,
    OppdatereInntektResponse,
    OppdatereVirkningstidspunkt,
    OpplysningerType,
    RolleDto,
    Rolletype,
    SivilstandAktivGrunnlagDto,
    SivilstandIkkeAktivGrunnlagDto,
} from "@api/BidragBehandlingApiV1";
import { NotatDto as NotatPayload } from "@api/BidragDokumentProduksjonApi";
import { GrunnlagRequestType, HentGrunnlagDto, HentGrunnlagRequestDto } from "@api/BidragGrunnlagApi";
import { PersonDto } from "@api/PersonApi";
import { FantIkkeVedtakEllerBehandlingError } from "@commonTypes/apiStatus";
import { VedtakBeregningResult } from "@commonTypes/vedtakTypes";
import { LoggerService, RolleTypeFullName } from "@navikt/bidrag-ui-common";
import { useMutation, useQuery, useQueryClient, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { deductMonths, toISODateString } from "@utils/date-utils";
import { AxiosResponse } from "axios";
import { AxiosError } from "axios";

import { useForskudd } from "../../forskudd/context/ForskuddContext";
import { BEHANDLING_API_V1, BIDRAG_DOKUMENT_PRODUKSJON_API, BIDRAG_GRUNNLAG_API, PERSON_API } from "../constants/api";
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
    notatPdf: (behandlingId) => ["notat_payload_pdf", QueryKeys.behandlingVersion, behandlingId],
    behandlingV2: (behandlingId: number, vedtakId?: number) => [
        "behandlingV2",
        QueryKeys.behandlingVersion,
        behandlingId,
        vedtakId,
    ],
    grunnlag: () => ["grunnlag", QueryKeys.behandlingVersion],
    arbeidsforhold: (behandlingId: number) => ["arbeidsforhold", behandlingId, QueryKeys.behandlingVersion],
    person: (ident: string) => ["person", ident],
    personMulti: (ident: string) => ["persons", ident],
};
export const useGetArbeidsforhold = (): ArbeidsforholdGrunnlagDto[] => {
    const behandling = useGetBehandlingV2();
    return behandling.aktiveGrunnlagsdata?.arbeidsforhold;
};
export const useGetOpplysningerBoforhold = (): {
    aktiveOpplysninger: HusstandsbarnGrunnlagDto[];
    ikkeAktiverteOpplysninger: HusstandsbarnGrunnlagDto[];
} => {
    const behandling = useGetBehandlingV2();
    return {
        aktiveOpplysninger: behandling.aktiveGrunnlagsdata?.husstandsbarn,
        ikkeAktiverteOpplysninger: behandling.ikkeAktiverteEndringerIGrunnlagsdata?.husstandsbarn,
    };
};
export const useGetOpplysningerSivilstandV2 = (): {
    aktiveOpplysninger: SivilstandAktivGrunnlagDto;
    ikkeAktiverteOpplysninger: SivilstandIkkeAktivGrunnlagDto;
} => {
    const behandling = useGetBehandlingV2();
    return {
        aktiveOpplysninger: behandling.aktiveGrunnlagsdata?.sivilstand,
        ikkeAktiverteOpplysninger: behandling.ikkeAktiverteEndringerIGrunnlagsdata?.sivilstand,
    };
};
export const useGetOpplysningerSivilstand = (): SivilstandAktivGrunnlagDto => {
    const behandling = useGetBehandlingV2();
    return behandling.aktiveGrunnlagsdata?.sivilstand;
};

export const useUpdateInntekt = () => {
    const { behandlingId } = useForskudd();

    return useMutation({
        mutationKey: MutationKeys.updateInntekter(behandlingId),
        mutationFn: async (payload: OppdatereInntektRequest): Promise<OppdatereInntektResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereInntekt(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av inntekter", error);
        },
    });
};

export const useUpdateBoforhold = () => {
    const { behandlingId } = useForskudd();

    return useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: OppdatereBoforholdRequestV2): Promise<OppdatereBoforholdResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereBoforhold(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av boforhold", error);
        },
    });
};

export const useGetVisningsnavn = () =>
    useSuspenseQuery({
        queryKey: QueryKeys.visningsnavn(),
        queryFn: (): Promise<AxiosResponse<Record<string, string>>> => BEHANDLING_API_V1.api.hentVisningsnavn(),
        staleTime: 0,
    });

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
                    return (await BEHANDLING_API_V1.api.vedtakLesemodus(vedtakId)).data;
                }
                return (
                    await BEHANDLING_API_V1.api.henteBehandlingV2(behandlingId, {
                        inkluderHistoriskeInntekter: false,
                    })
                ).data;
            } catch (e) {
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
            queryFn: async (): Promise<PersonDto & { rolleType: RolleTypeFullName }> => {
                if (!rolle.ident)
                    return { ident: "", visningsnavn: rolle.navn, rolleType: RolleTypeFullName.FEILREGISTRERT };
                const { data } = await PERSON_API.informasjon.hentPersonPost({ ident: rolle.ident });
                return {
                    ...rolle,
                    ident: rolle.ident!,
                    rolleType: rolle.rolletype as unknown as RolleTypeFullName,
                    navn: data.navn,
                    kortnavn: data.kortnavn,
                    visningsnavn: data.visningsnavn,
                };
            },
            staleTime: Infinity,

            enabled: !!rolle,
        })),
    });

const createGrunnlagRequest = (behandling: BehandlingDtoV2): HentGrunnlagRequestDto => {
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
        GrunnlagRequestType.ARBEIDSFORHOLD,
        GrunnlagRequestType.AINNTEKT,
        GrunnlagRequestType.SKATTEGRUNNLAG,
        GrunnlagRequestType.UTVIDETBARNETRYGDOGSMABARNSTILLEGG,
        GrunnlagRequestType.BARNETILLEGG,
        GrunnlagRequestType.KONTANTSTOTTE,
        GrunnlagRequestType.HUSSTANDSMEDLEMMER_OG_EGNE_BARN,
        GrunnlagRequestType.SIVILSTAND,
        GrunnlagRequestType.OVERGANGSSTONAD,
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

export const useGrunnlag = (): HentGrunnlagDto | null => {
    const behandling = useGetBehandlingV2();
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

export const useNotatPdf = (behandlingId?: number, vedtakId?: number) => {
    const resultPayload = useQuery({
        queryKey: QueryKeys.notatPdf(behandlingId ?? vedtakId),
        queryFn: async () => {
            if (vedtakId) {
                return (await BEHANDLING_API_V1.api.hentNotatOpplysningerForVedtak(vedtakId)).data;
            }
            return (await BEHANDLING_API_V1.api.hentNotatOpplysninger(behandlingId)).data;
        },
        refetchOnWindowFocus: false,
        refetchInterval: 0,
    });

    const resultNotatPdf = useQuery({
        queryKey: ["notat_pdf", behandlingId, resultPayload.data],
        queryFn: () =>
            BIDRAG_DOKUMENT_PRODUKSJON_API.api.generatePdf(
                "forskudd",
                //@ts-ignore
                resultPayload.data as NotatPayload,
                {
                    format: "blob",
                }
            ),
        select: (response) => response.data,
        enabled: resultPayload.isFetched,
        refetchOnWindowFocus: false,
        refetchInterval: 0,
        staleTime: Infinity,
        placeholderData: (previousData) => previousData,
    });

    return resultPayload.isError || resultPayload.isLoading ? resultPayload : resultNotatPdf;
};

export const useNotat = (behandlingId?: number, vedtakId?: number) => {
    const resultPayload = useQuery({
        queryKey: QueryKeys.notat(behandlingId ?? vedtakId),
        queryFn: async () => {
            if (vedtakId) {
                return (await BEHANDLING_API_V1.api.hentNotatOpplysningerForVedtak(vedtakId)).data;
            }
            return (await BEHANDLING_API_V1.api.hentNotatOpplysninger(behandlingId)).data;
        },
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
export const useAktiveGrunnlagsdata = () => {
    const { behandlingId } = useForskudd();
    const queryClient = useQueryClient();

    return useMutation<
        { data: BehandlingDtoV2; type: OpplysningerType },
        { data: BehandlingDtoV2; type: OpplysningerType },
        { personident: string; type: OpplysningerType }
    >({
        mutationFn: async ({ personident, type }) => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereBehandlingV2(behandlingId, {
                aktivereGrunnlagForPerson: {
                    personident,
                    grunnlagsdatatyper: [type],
                },
            });
            return { data, type };
        },
        onSuccess: ({ data, type }) => {
            const opplysningTypeInntektTypeMapper = {
                [OpplysningerType.SMABARNSTILLEGG]: "småbarnstillegg",
                [OpplysningerType.UTVIDET_BARNETRYGD]: "utvidetBarnetrygd",
                [OpplysningerType.BARNETILLEGG]: "barnetillegg",
                [OpplysningerType.KONTANTSTOTTE]: "kontantstøtte",
                [OpplysningerType.SKATTEPLIKTIGE_INNTEKTER]: "årsinntekter",
            };

            queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), (currentData) => {
                const updatedBehandling = {
                    ...currentData,
                    inntekter: {
                        ...currentData.inntekter,
                        [opplysningTypeInntektTypeMapper[type]]: data.inntekter[opplysningTypeInntektTypeMapper[type]],
                        månedsinntekter: data.inntekter.månedsinntekter,
                        beregnetInntekter: data.inntekter.beregnetInntekter,
                        valideringsfeil: data.inntekter.valideringsfeil,
                    },
                    ikkeAktiverteEndringerIGrunnlagsdata: data.ikkeAktiverteEndringerIGrunnlagsdata,
                    aktiveGrunnlagsdata: data.aktiveGrunnlagsdata,
                };
                return updatedBehandling;
            });
        },
    });
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
                const feilmelding = error.response.headers["warning"]?.split(",") ?? [];
                if (error instanceof AxiosError && error.response.status == 400) {
                    if (error.response?.data) {
                        return {
                            feil: {
                                melding: feilmelding,
                                detaljer: error.response.data as BeregningValideringsfeil,
                            },
                        };
                    }
                    return {
                        feil: {
                            melding: feilmelding,
                        },
                    };
                }
            }
        },
    });
};

export const useAktiverGrunnlagsdata = () => {
    const { behandlingId } = useForskudd();

    return useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: AktivereGrunnlagRequestV2): Promise<AktivereGrunnlagResponseV2> => {
            const { data } = await BEHANDLING_API_V1.api.aktivereGrunnlag(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av grunnlag", error);
        },
    });
};

export const useOppdatereVirkningstidspunktV2 = () => {
    const { behandlingId } = useForskudd();

    return useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: OppdatereVirkningstidspunkt): Promise<BehandlingDtoV2> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereVirkningstidspunktV2(behandlingId, payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av virkningstidsdpunkt", error);
        },
    });
};
