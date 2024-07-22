import {
    AktivereGrunnlagRequestV2,
    AktivereGrunnlagResponseV2,
    AndreVoksneIHusstandenGrunnlagDto,
    ArbeidsforholdGrunnlagDto,
    BehandlingDtoV2,
    BeregningValideringsfeil,
    HusstandsmedlemGrunnlagDto,
    OppdatereBoforholdRequestV2,
    OppdatereBoforholdResponse,
    OppdatereInntektRequest,
    OppdatereInntektResponse,
    OppdatereUtgiftRequest,
    OppdatereUtgiftResponse,
    OppdatereVirkningstidspunkt,
    OpplysningerType,
    RolleDto,
    SivilstandAktivGrunnlagDto,
    SivilstandIkkeAktivGrunnlagDto,
} from "@api/BidragBehandlingApiV1";
import { NotatDto as NotatPayload } from "@api/BidragDokumentProduksjonApi";
import { PersonDto } from "@api/PersonApi";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { FantIkkeVedtakEllerBehandlingError } from "@commonTypes/apiStatus";
import { VedtakBeregningResult, VedtakSærbidragBeregningResult } from "@commonTypes/vedtakTypes";
import { LoggerService, RolleTypeFullName } from "@navikt/bidrag-ui-common";
import { useMutation, useQuery, useQueryClient, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { BEHANDLING_API_V1, BIDRAG_DOKUMENT_PRODUKSJON_API, PERSON_API } from "../constants/api";
export const MutationKeys = {
    oppdaterBehandling: (behandlingId: string) => ["mutation", "behandling", behandlingId],
    updateBoforhold: (behandlingId: string) => ["mutation", "boforhold", behandlingId],
    updateInntekter: (behandlingId: string) => ["mutation", "inntekter", behandlingId],
    updateVirkningstidspunkt: (behandlingId: string) => ["mutation", "virkningstidspunkt", behandlingId],
    updateUtgifter: (behandlingId: string) => ["mutation", "utgifter", behandlingId],
};

export const QueryKeys = {
    behandlingVersion: "V1",
    virkningstidspunkt: (behandlingId: string) => ["virkningstidspunkt", QueryKeys.behandlingVersion, behandlingId],
    visningsnavn: () => ["visningsnavn", QueryKeys.behandlingVersion],
    beregningForskudd: () => ["beregning_forskudd", QueryKeys.behandlingVersion],
    beregningSærbidrag: () => ["beregning_særbidrag", QueryKeys.behandlingVersion],
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
                    return (await BEHANDLING_API_V1.api.vedtakLesemodus(Number(vedtakId))).data;
                }
                return (
                    await BEHANDLING_API_V1.api.henteBehandlingV2(Number(behandlingId), {
                        inkluderHistoriskeInntekter: false,
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
