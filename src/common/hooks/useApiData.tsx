import {
    AktivereGrunnlagRequestV2,
    AktivereGrunnlagResponseV2,
    AndreVoksneIHusstandenGrunnlagDto,
    ArbeidsforholdGrunnlagDto,
    BarnDto,
    BehandlingDtoV2,
    BeregningValideringsfeil,
    DelberegningSamvaersklasse,
    FaktiskTilsynsutgiftDto,
    HusstandsmedlemGrunnlagDto,
    OppdatereBoforholdRequestV2,
    OppdatereBoforholdResponse,
    OppdatereInntektRequest,
    OppdatereInntektResponse,
    OppdatereUnderholdRequest,
    OppdatereUnderholdResponse,
    OppdatereUtgiftRequest,
    OppdatereUtgiftResponse,
    OppdatereVirkningstidspunkt,
    OppdaterSamvaerDto,
    OppdaterSamvaerResponsDto,
    OpplysningerType,
    RolleDto,
    SamvaerskalkulatorDetaljer,
    SivilstandAktivGrunnlagDto,
    SivilstandIkkeAktivGrunnlagDto,
    SletteSamvaersperiodeElementDto,
    SletteUnderholdselement,
    StonadTilBarnetilsynDto,
    TilleggsstonadDto,
    UnderholdDto,
} from "@api/BidragBehandlingApiV1";
import { VedtakNotatDto as NotatPayload } from "@api/BidragDokumentProduksjonApi";
import { PersonDto } from "@api/PersonApi";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { FantIkkeVedtakEllerBehandlingError } from "@commonTypes/apiStatus";
import {
    VedtakBarnebidragBeregningResult,
    VedtakBeregningResult,
    VedtakSærbidragBeregningResult,
} from "@commonTypes/vedtakTypes";
import { LoggerService, RolleTypeFullName } from "@navikt/bidrag-ui-common";
import { useMutation, useQuery, useQueryClient, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { BEHANDLING_API_V1, BIDRAG_DOKUMENT_PRODUKSJON_API, PERSON_API } from "../constants/api";
export const MutationKeys = {
    oppdaterBehandling: (behandlingId: string) => ["mutation", "behandling", behandlingId],
    oppdatereTilsynsordning: (behandlingId: string) => ["mutation", "oppdatereTilsynsordning", behandlingId],
    oppdatereUnderhold: (behandlingId: string) => ["mutation", "oppdatereUnderhold", behandlingId],
    oppretteUnderholdForBarn: (behandlingId: string) => ["mutation", "oppretteUnderholdForBarn", behandlingId],
    updateBoforhold: (behandlingId: string) => ["mutation", "boforhold", behandlingId],
    updateSamvær: (behandlingId: string) => ["mutation", "samvær", behandlingId],
    updateSamværskalkulator: (behandlingId: string) => ["mutation", "updateSamværskalkulator", behandlingId],
    slettSamværskalkulator: (behandlingId: string) => ["mutation", "slettSamværskalkulator", behandlingId],
    beregnSamværsklasse: () => ["mutation", "beregnSamværsklasse"],
    updateInntekter: (behandlingId: string) => ["mutation", "inntekter", behandlingId],
    updateVirkningstidspunkt: (behandlingId: string) => ["mutation", "virkningstidspunkt", behandlingId],
    updateUtgifter: (behandlingId: string) => ["mutation", "utgifter", behandlingId],
    updateStonadTilBarnetilsyn: (behandlingId: string) => ["mutation", "stonadTilBarnetilsyn", behandlingId],
    updateFaktiskeTilsynsutgifter: (behandlingId: string) => ["mutation", "faktiskeTilsynsutgifter", behandlingId],
    updateTilleggstønad: (behandlingId: string) => ["mutation", "tilleggstønad", behandlingId],
};

export const QueryKeys = {
    behandlingVersion: "V1",
    virkningstidspunkt: (behandlingId: string) => ["virkningstidspunkt", QueryKeys.behandlingVersion, behandlingId],
    visningsnavn: () => ["visningsnavn", QueryKeys.behandlingVersion],
    beregningForskudd: () => ["beregning_forskudd", QueryKeys.behandlingVersion],
    beregningSærbidrag: () => ["beregning_særbidrag", QueryKeys.behandlingVersion],
    beregnBarnebidrag: () => ["beregning_barnebidrag", QueryKeys.behandlingVersion],
    beregningInnteksgrenseSærbidrag: () => ["beregning_særbidrag_innteksgrense", QueryKeys.behandlingVersion],
    notat: (behandlingId: string) => ["notat_payload", QueryKeys.behandlingVersion, behandlingId],
    notatPdf: (behandlingId: string) => ["notat_payload_pdf", QueryKeys.behandlingVersion, behandlingId],
    behandlingV2: (behandlingId: string, vedtakId?: string) => [
        "behandlingV2",
        QueryKeys.behandlingVersion,
        behandlingId,
        vedtakId,
    ],
    grunnlag: () => ["grunnlag", QueryKeys.behandlingVersion],
    arbeidsforhold: (behandlingId: string) => ["arbeidsforhold", behandlingId, QueryKeys.behandlingVersion],
    person: (ident: string) => ["person2", ident],
};
export const useGetArbeidsforhold = (): ArbeidsforholdGrunnlagDto[] => {
    const behandling = useGetBehandlingV2();
    return behandling.aktiveGrunnlagsdata?.arbeidsforhold;
};
export const useGetOpplysningerBoforhold = (): {
    aktiveOpplysninger: HusstandsmedlemGrunnlagDto[];
    ikkeAktiverteOpplysninger: HusstandsmedlemGrunnlagDto[];
} => {
    const behandling = useGetBehandlingV2();
    return {
        aktiveOpplysninger: behandling.aktiveGrunnlagsdata?.husstandsbarn,
        ikkeAktiverteOpplysninger: behandling.ikkeAktiverteEndringerIGrunnlagsdata?.husstandsbarn,
    };
};

export const useGetOpplysningeAndreVoksneIHusstand = (): {
    aktiveOpplysninger: AndreVoksneIHusstandenGrunnlagDto;
    ikkeAktiverteOpplysninger: AndreVoksneIHusstandenGrunnlagDto;
} => {
    const behandling = useGetBehandlingV2();
    return {
        aktiveOpplysninger: behandling.aktiveGrunnlagsdata?.andreVoksneIHusstanden,
        ikkeAktiverteOpplysninger: behandling.ikkeAktiverteEndringerIGrunnlagsdata?.andreVoksneIHusstanden,
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
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateInntekter(behandlingId),
        mutationFn: async (payload: OppdatereInntektRequest): Promise<OppdatereInntektResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereInntekt(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av inntekter", error);
        },
    });
};
export const useDeleteSamværsperiode = () => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateSamvær(behandlingId),
        mutationFn: async (payload: SletteSamvaersperiodeElementDto): Promise<OppdaterSamvaerResponsDto> => {
            const { data } = await BEHANDLING_API_V1.api.slettSamvaersperiode(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved sletting av samværsperiode", error);
        },
    });
};

export const useBeregnSamværsklasse = () => {
    return useMutation({
        mutationKey: MutationKeys.beregnSamværsklasse(),
        mutationFn: async (payload: SamvaerskalkulatorDetaljer): Promise<DelberegningSamvaersklasse> => {
            const { data } = await BEHANDLING_API_V1.api.beregnSamvaersklasse(payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av boforhold", error);
        },
    });
};

export const useUpdateSamvær = () => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateSamvær(behandlingId),
        mutationFn: async (payload: OppdaterSamvaerDto): Promise<OppdaterSamvaerResponsDto> => {
            const { data } = await BEHANDLING_API_V1.api.oppdaterSamvaer(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av samvær", error);
        },
    });
};
export const useUpdateBoforhold = () => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: OppdatereBoforholdRequestV2): Promise<OppdatereBoforholdResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereBoforhold(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av boforhold", error);
        },
    });
};

export const useGetBehandlingV2 = (): BehandlingDtoV2 => {
    const { behandlingId, vedtakId } = useBehandlingProvider();
    return useBehandlingV2(behandlingId, vedtakId);
};

export const useBehandlingV2 = (behandlingId?: string, vedtakId?: string): BehandlingDtoV2 => {
    const { data: behandling } = useSuspenseQuery({
        queryKey: QueryKeys.behandlingV2(behandlingId, vedtakId),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    return (
                        await BEHANDLING_API_V1.api.vedtakLesemodus(Number(vedtakId), {
                            inkluderHistoriskeInntekter: true,
                        })
                    ).data;
                }
                return (
                    await BEHANDLING_API_V1.api.henteBehandlingV2(Number(behandlingId), {
                        inkluderHistoriskeInntekter: true,
                    })
                ).data;
            } catch (e) {
                if (e instanceof AxiosError && e.response.status === 404) {
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
        })),
    });

export const useNotatPdf = (behandlingId?: string, vedtakId?: string) => {
    const resultPayload = useQuery({
        queryKey: QueryKeys.notatPdf(behandlingId ?? vedtakId),
        queryFn: async () => {
            if (vedtakId) {
                return (await BEHANDLING_API_V1.api.hentNotatOpplysningerForVedtak(Number(vedtakId))).data;
            }
            return (await BEHANDLING_API_V1.api.hentNotatOpplysninger(Number(behandlingId))).data;
        },
        refetchOnWindowFocus: false,
        refetchInterval: 0,
    });

    const resultNotatPdf = useQuery({
        queryKey: ["notat_pdf", behandlingId, resultPayload.data],
        queryFn: () =>
            BIDRAG_DOKUMENT_PRODUKSJON_API.api.generatePdf(
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

export const useNotat = (behandlingId?: string, vedtakId?: string) => {
    const resultPayload = useQuery({
        queryKey: QueryKeys.notat(behandlingId ?? vedtakId),
        queryFn: async () => {
            if (vedtakId) {
                return (await BEHANDLING_API_V1.api.hentNotatOpplysningerForVedtak(Number(vedtakId))).data;
            }
            return (await BEHANDLING_API_V1.api.hentNotatOpplysninger(Number(behandlingId))).data;
        },
        refetchOnWindowFocus: false,
        refetchInterval: 0,
    });

    const resultNotatHtml = useQuery({
        queryKey: ["notat_html", behandlingId, resultPayload.data],
        queryFn: () =>
            BIDRAG_DOKUMENT_PRODUKSJON_API.api.generateHtml(
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
    const { behandlingId } = useBehandlingProvider();
    const queryClient = useQueryClient();

    return useMutation<
        { data: AktivereGrunnlagResponseV2; type: OpplysningerType },
        { data: AktivereGrunnlagResponseV2; type: OpplysningerType },
        { personident: string; gjelderIdent?: string; type: OpplysningerType }
    >({
        mutationFn: async ({ personident, gjelderIdent, type }) => {
            const { data } = await BEHANDLING_API_V1.api.aktivereGrunnlag(Number(behandlingId), {
                personident,
                gjelderIdent,
                grunnlagstype: type,
                overskriveManuelleOpplysninger: true,
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
export const useGetBeregningInnteksgrenseSærbidrag = () => {
    const { behandlingId, vedtakId } = useBehandlingProvider();

    return useSuspenseQuery<number>({
        queryKey: QueryKeys.beregningInnteksgrenseSærbidrag(),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    return -1;
                }
                const response = await BEHANDLING_API_V1.api.beregnBPsLavesteInntektForEvne(Number(behandlingId));
                return response.data;
            } catch (error) {
                console.error("error", error);
                return -1;
            }
        },
    });
};
export const useGetBeregningBidrag = () => {
    const { behandlingId, vedtakId } = useBehandlingProvider();

    return useSuspenseQuery<VedtakBarnebidragBeregningResult>({
        queryKey: QueryKeys.beregnBarnebidrag(),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    const response = await BEHANDLING_API_V1.api.hentVedtakBeregningResultatBidrag(Number(vedtakId));
                    return { resultat: response.data };
                }
                const response = await BEHANDLING_API_V1.api.beregnBarnebidrag(Number(behandlingId));
                return { resultat: response.data };
            } catch (error) {
                const feilmelding = error.response.headers["warning"]?.split(",") ?? [];
                if (error instanceof AxiosError && error.response.status === 400) {
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
export const useGetBeregningSærbidrag = () => {
    const { behandlingId, vedtakId } = useBehandlingProvider();

    return useSuspenseQuery<VedtakSærbidragBeregningResult>({
        queryKey: QueryKeys.beregningSærbidrag(),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    const response = await BEHANDLING_API_V1.api.hentVedtakBeregningResultatSaerbidrag(
                        Number(vedtakId)
                    );
                    return { resultat: response.data };
                }
                const response = await BEHANDLING_API_V1.api.beregnSaerbidrag(Number(behandlingId));
                return { resultat: response.data };
            } catch (error) {
                const feilmelding = error.response.headers["warning"]?.split(",") ?? [];
                if (error instanceof AxiosError && error.response.status === 400) {
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
export const useGetBeregningForskudd = () => {
    const { behandlingId, vedtakId } = useBehandlingProvider();

    return useSuspenseQuery<VedtakBeregningResult>({
        queryKey: QueryKeys.beregningForskudd(),
        queryFn: async () => {
            try {
                if (vedtakId) {
                    const response = await BEHANDLING_API_V1.api.hentVedtakBeregningResultat(Number(vedtakId));
                    return { resultat: response.data };
                }
                const response = await BEHANDLING_API_V1.api.beregnForskudd1(Number(behandlingId));
                return { resultat: response.data };
            } catch (error) {
                const feilmelding = error.response.headers["warning"]?.split(",") ?? [];
                if (error instanceof AxiosError && error.response.status === 400) {
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
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: AktivereGrunnlagRequestV2): Promise<AktivereGrunnlagResponseV2> => {
            const { data } = await BEHANDLING_API_V1.api.aktivereGrunnlag(Number(behandlingId), payload);
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
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateBoforhold(behandlingId),
        mutationFn: async (payload: OppdatereVirkningstidspunkt): Promise<BehandlingDtoV2> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereVirkningstidspunktV2(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av virkningstidsdpunkt", error);
        },
    });
};

export const useUpdateUtgifter = () => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateUtgifter(behandlingId),
        mutationFn: async (payload: OppdatereUtgiftRequest): Promise<OppdatereUtgiftResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereUtgift(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av utgifter", error);
        },
    });
};

export const useUpdateStønadTilBarnetilsyn = (underholdsid: string) => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateStonadTilBarnetilsyn(behandlingId),
        mutationFn: async (payload: StonadTilBarnetilsynDto): Promise<OppdatereUnderholdResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereStonadTilBarnetilsyn(
                Number(behandlingId),
                Number(underholdsid),
                payload
            );
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av stønad til barnetilsyn", error);
        },
    });
};

export const useDeleteUnderholdsObjekt = () => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateStonadTilBarnetilsyn(behandlingId),
        mutationFn: async (payload: SletteUnderholdselement): Promise<UnderholdDto> => {
            const { data } = await BEHANDLING_API_V1.api.sletteFraUnderhold(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved sletting av underhold", error);
        },
    });
};

export const useUpdateFaktiskeTilsynsutgifter = (underholdsid: number) => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateFaktiskeTilsynsutgifter(behandlingId),
        mutationFn: async (payload: FaktiskTilsynsutgiftDto): Promise<OppdatereUnderholdResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereFaktiskTilsynsutgift(
                Number(behandlingId),
                underholdsid,
                payload
            );
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av faktiske tilsynsutgifter", error);
        },
    });
};

export const useUpdateTilleggstønad = (underholdsid: number) => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.updateTilleggstønad(behandlingId),
        mutationFn: async (payload: TilleggsstonadDto): Promise<OppdatereUnderholdResponse> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereTilleggsstonad(
                Number(behandlingId),
                underholdsid,
                payload
            );
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av tillegstønad", error);
        },
    });
};

export const useCreateUnderholdForBarn = () => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.oppretteUnderholdForBarn(behandlingId),
        mutationFn: async (payload: BarnDto): Promise<UnderholdDto> => {
            const { data } = await BEHANDLING_API_V1.api.oppretteUnderholdForBarn(Number(behandlingId), payload);
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppretting av underholds barn", error);
        },
    });
};

export const useUpdateUnderhold = (underholdsid: number) => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.oppdatereUnderhold(behandlingId),
        mutationFn: async (payload: OppdatereUnderholdRequest): Promise<UnderholdDto> => {
            const { data } = await BEHANDLING_API_V1.api.oppdatereUnderhold(
                Number(behandlingId),
                underholdsid,
                payload
            );
            return data;
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av underhold", error);
        },
    });
};

export const useUpdateHarTilysnsordning = (underholdsid: number) => {
    const { behandlingId } = useBehandlingProvider();

    return useMutation({
        mutationKey: MutationKeys.oppdatereTilsynsordning(behandlingId),
        mutationFn: async (payload: { harTilsynsordning: boolean }): Promise<void> => {
            await BEHANDLING_API_V1.api.oppdatereTilsynsordning(Number(behandlingId), underholdsid, payload);
        },
        networkMode: "always",
        onError: (error) => {
            console.log("onError", error);
            LoggerService.error("Feil ved oppdatering av tilsynsordning", error);
        },
    });
};
