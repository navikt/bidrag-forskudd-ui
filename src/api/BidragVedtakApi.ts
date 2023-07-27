/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Innholdet i grunnlaget */
export type JsonNode = object;

/** Liste med referanser til alle behandlinger som ligger som grunnlag til vedtaket */
export interface OpprettBehandlingsreferanseRequestDto {
    /** Kilde/type for en behandlingsreferanse */
    kilde: OpprettBehandlingsreferanseRequestDtoKilde;
    /** Kildesystemets referanse til behandlingen */
    referanse: string;
}

/** Liste over alle engangsbeløp som inngår i vedtaket */
export interface OpprettEngangsbelopRequestDto {
    /** Beløpstype. Saertilskudd, gebyr m.m. */
    type: OpprettEngangsbelopRequestDtoType;
    /** Referanse til sak */
    sakId: string;
    /** Id til den som skal betale engangsbeløpet */
    skyldnerId: string;
    /** Id til den som krever engangsbeløpet */
    kravhaverId: string;
    /** Id til den som mottar engangsbeløpet */
    mottakerId: string;
    /**
     * Beregnet engangsbeløp
     * @min 0
     */
    belop?: number;
    /** Valutakoden tilhørende engangsbeløpet */
    valutakode: string;
    /** Resultatkoden tilhørende engangsbeløpet */
    resultatkode: string;
    /** Angir om engangsbeløpet skal innkreves */
    innkreving: OpprettEngangsbelopRequestDtoInnkreving;
    /** Angir om et engangsbeløp skal endres som følge av vedtaket */
    endring: boolean;
    /**
     * VedtakId for vedtaket det er klaget på. Utgjør sammen med referanse en unik id for et engangsbeløp
     * @format int32
     */
    omgjorVedtakId?: number;
    /** Referanse, brukes for å kunne omgjøre engangsbeløp senere i et klagevedtak. Unik innenfor et vedtak */
    referanse: string;
    /** Referanse - delytelsesId/beslutningslinjeId -> bidrag-regnskap. Skal fjernes senere */
    delytelseId?: string;
    /** Referanse som brukes i utlandssaker */
    eksternReferanse?: string;
    /** Liste over alle grunnlag som inngår i engangsbeløpet */
    grunnlagReferanseListe: string[];
}

/** Liste over alle grunnlag som inngår i vedtaket */
export interface OpprettGrunnlagRequestDto {
    /** Referanse til grunnlaget */
    referanse: string;
    /** Grunnlagstype */
    type: OpprettGrunnlagRequestDtoType;
    /** Innholdet i grunnlaget */
    innhold: JsonNode;
}

/** Liste over alle stønadsendringer som inngår i vedtaket */
export interface OpprettStonadsendringRequestDto {
    /** Stønadstype */
    type: OpprettStonadsendringRequestDtoType;
    /** Referanse til sak */
    sakId: string;
    /** Id til den som skal betale bidraget */
    skyldnerId: string;
    /** Id til den som krever bidraget */
    kravhaverId: string;
    /** Id til den som mottar bidraget */
    mottakerId: string;
    /** Angir første år en stønad skal indeksreguleres */
    indeksreguleringAar?: string;
    /** Angir om stønaden skal innkreves */
    innkreving: OpprettStonadsendringRequestDtoInnkreving;
    /** Angir om en stønad skal endres som følge av vedtaket */
    endring: boolean;
    /**
     * VedtakId for vedtaket det er klaget på
     * @format int32
     */
    omgjorVedtakId?: number;
    /** Referanse som brukes i utlandssaker */
    eksternReferanse?: string;
    /** Liste over alle perioder som inngår i stønadsendringen */
    periodeListe: OpprettVedtakPeriodeRequestDto[];
}

/** Liste over alle perioder som inngår i stønadsendringen */
export interface OpprettVedtakPeriodeRequestDto {
    /**
     * Periode fra-og-med-dato
     * @format date
     */
    fomDato: string;
    /**
     * Periode til-dato
     * @format date
     */
    tilDato?: string;
    /**
     * Beregnet stønadsbeløp
     * @min 0
     */
    belop?: number;
    /** Valutakoden tilhørende stønadsbeløpet */
    valutakode: string;
    /** Resultatkoden tilhørende stønadsbeløpet */
    resultatkode: string;
    /** Referanse - delytelsesId/beslutningslinjeId -> bidrag-regnskap. Skal fjernes senere */
    delytelseId?: string;
    /** Liste over alle grunnlag som inngår i perioden */
    grunnlagReferanseListe: string[];
}

export interface OpprettVedtakRequestDto {
    /** Hva er kilden til vedtaket. Automatisk eller manuelt */
    kilde: OpprettVedtakRequestDtoKilde;
    /** Type vedtak */
    type: OpprettVedtakRequestDtoType;
    /**
     * Id til saksbehandler/batchjobb evt. annet som oppretter vedtaket
     * @minLength 5
     * @maxLength 2147483647
     */
    opprettetAv: string;
    /** Saksbehandlers navn */
    opprettetAvNavn?: string;
    /**
     * Tidspunkt/timestamp når vedtaket er fattet
     * @format date-time
     */
    vedtakTidspunkt: string;
    /** Id til enheten som er ansvarlig for vedtaket */
    enhetId: string;
    /**
     * Settes hvis overføring til Elin skal utsettes
     * @format date
     */
    utsattTilDato?: string;
    /** Liste over alle grunnlag som inngår i vedtaket */
    grunnlagListe: OpprettGrunnlagRequestDto[];
    /** Liste over alle stønadsendringer som inngår i vedtaket */
    stonadsendringListe?: OpprettStonadsendringRequestDto[];
    /** Liste over alle engangsbeløp som inngår i vedtaket */
    engangsbelopListe?: OpprettEngangsbelopRequestDto[];
    /** Liste med referanser til alle behandlinger som ligger som grunnlag til vedtaket */
    behandlingsreferanseListe?: OpprettBehandlingsreferanseRequestDto[];
}

/** Liste med referanser til alle behandlinger som ligger som grunnlag til vedtaket */
export interface BehandlingsreferanseDto {
    /** Kilde/type for en behandlingsreferanse */
    kilde: BehandlingsreferanseDtoKilde;
    /** Kildesystemets referanse til behandlingen */
    referanse: string;
}

/** Liste over alle engangsbeløp som inngår i vedtaket */
export interface EngangsbelopDto {
    /** Type Engangsbeløp. Saertilskudd, gebyr m.m. */
    type: EngangsbelopDtoType;
    /** Referanse til sak */
    sakId: string;
    /** Id til den som skal betale engangsbeløpet */
    skyldnerId: string;
    /** Id til den som krever engangsbeløpet */
    kravhaverId: string;
    /** Id til den som mottar engangsbeløpet */
    mottakerId: string;
    /** Beregnet engangsbeløp */
    belop?: number;
    /** Valutakoden tilhørende engangsbeløpet */
    valutakode?: string;
    /** Resultatkoden tilhørende engangsbeløpet */
    resultatkode: string;
    /** Angir om engangsbeløpet skal innkreves */
    innkreving: EngangsbelopDtoInnkreving;
    /** Angir om et engangsbeløp skal endres som følge av vedtaket */
    endring: boolean;
    /**
     * VedtakId for vedtaket det er klaget på. Utgjør sammen med referanse en unik id for et engangsbeløp
     * @format int32
     */
    omgjorVedtakId?: number;
    /** Referanse, brukes for å kunne omgjøre engangsbeløp senere i et klagevedtak. Unik innenfor et vedtak */
    referanse: string;
    /** Referanse - delytelsesId/beslutningslinjeId -> bidrag-regnskap. Skal fjernes senere */
    delytelseId?: string;
    /** Referanse som brukes i utlandssaker */
    eksternReferanse?: string;
    /** Liste over alle grunnlag som inngår i beregningen */
    grunnlagReferanseListe: string[];
}

/** Liste over alle grunnlag som inngår i vedtaket */
export interface GrunnlagDto {
    /** Referanse til grunnlaget */
    referanse: string;
    /** Grunnlagstype */
    type: GrunnlagDtoType;
    /** Innholdet i grunnlaget */
    innhold: JsonNode;
}

/** Liste over alle stønadsendringer som inngår i vedtaket */
export interface StonadsendringDto {
    /** Stønadstype */
    type: StonadsendringDtoType;
    /** Referanse til sak */
    sakId: string;
    /** Id til den som skal betale bidraget */
    skyldnerId: string;
    /** Id til den som krever bidraget */
    kravhaverId: string;
    /** Id til den som mottar bidraget */
    mottakerId: string;
    /** Angir første år en stønad skal indeksreguleres */
    indeksreguleringAar?: string;
    /** Angir om stønaden skal innkreves */
    innkreving: StonadsendringDtoInnkreving;
    /** Angir om en stønad skal endres som følge av vedtaket */
    endring: boolean;
    /**
     * VedtakId for vedtaket det er klaget på
     * @format int32
     */
    omgjorVedtakId?: number;
    /** Referanse som brukes i utlandssaker */
    eksternReferanse?: string;
    /** Liste over alle perioder som inngår i stønadsendringen */
    periodeListe: VedtakPeriodeDto[];
}

export interface VedtakDto {
    /** Hva er kilden til vedtaket. Automatisk eller manuelt */
    kilde: VedtakDtoKilde;
    /** Type vedtak */
    type: VedtakDtoType;
    /** Id til saksbehandler/batchjobb evt annet som opprettet vedtaket */
    opprettetAv: string;
    /** Saksbehandlers navn */
    opprettetAvNavn?: string;
    /**
     * Tidspunkt/timestamp når vedtaket er fattet
     * @format date-time
     */
    vedtakTidspunkt: string;
    /** Id til enheten som er ansvarlig for vedtaket */
    enhetId: string;
    /**
     * Settes hvis overføring til Elin skal utsettes
     * @format date
     */
    utsattTilDato?: string;
    /**
     * Tidspunkt vedtaket er fattet
     * @format date-time
     */
    opprettetTidspunkt: string;
    /** Liste over alle grunnlag som inngår i vedtaket */
    grunnlagListe: GrunnlagDto[];
    /** Liste over alle stønadsendringer som inngår i vedtaket */
    stonadsendringListe: StonadsendringDto[];
    /** Liste over alle engangsbeløp som inngår i vedtaket */
    engangsbelopListe: EngangsbelopDto[];
    /** Liste med referanser til alle behandlinger som ligger som grunnlag til vedtaket */
    behandlingsreferanseListe: BehandlingsreferanseDto[];
}

/** Liste over alle perioder som inngår i stønadsendringen */
export interface VedtakPeriodeDto {
    /**
     * Periode fra-og-med-dato
     * @format date
     */
    fomDato: string;
    /**
     * Periode til-dato
     * @format date
     */
    tilDato?: string;
    /** Beregnet stønadsbeløp */
    belop?: number;
    /** Valutakoden tilhørende stønadsbeløpet */
    valutakode?: string;
    /** Resultatkoden tilhørende  stønadsbeløpet */
    resultatkode: string;
    /** Referanse - delytelsesId/beslutningslinjeId -> bidrag-regnskap. Skal fjernes senere */
    delytelseId?: string;
    /** Liste over alle grunnlag som inngår i perioden */
    grunnlagReferanseListe: string[];
}

/** Kilde/type for en behandlingsreferanse */
export enum OpprettBehandlingsreferanseRequestDtoKilde {
    BISYS_SOKNAD = "BISYS_SOKNAD",
    BISYS_KLAGE_REF_SOKNAD = "BISYS_KLAGE_REF_SOKNAD",
}

/** Beløpstype. Saertilskudd, gebyr m.m. */
export enum OpprettEngangsbelopRequestDtoType {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    TILBAKEKREVING = "TILBAKEKREVING",
    SAERTILSKUDD = "SAERTILSKUDD",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
}

/** Angir om engangsbeløpet skal innkreves */
export enum OpprettEngangsbelopRequestDtoInnkreving {
    JA = "JA",
    NEI = "NEI",
}

/** Grunnlagstype */
export enum OpprettGrunnlagRequestDtoType {
    SAERFRADRAG = "SAERFRADRAG",
    SOKNADSBARN_INFO = "SOKNADSBARN_INFO",
    SKATTEKLASSE = "SKATTEKLASSE",
    BARN_I_HUSSTAND = "BARN_I_HUSSTAND",
    BOSTATUS = "BOSTATUS",
    BOSTATUS_BP = "BOSTATUS_BP",
    INNTEKT = "INNTEKT",
    INNTEKT_BARN = "INNTEKT_BARN",
    INNTEKT_UTVIDET_BARNETRYGD = "INNTEKT_UTVIDET_BARNETRYGD",
    NETTO_SAERTILSKUDD = "NETTO_SAERTILSKUDD",
    SAMVAERSKLASSE = "SAMVAERSKLASSE",
    BIDRAGSEVNE = "BIDRAGSEVNE",
    SAMVAERSFRADRAG = "SAMVAERSFRADRAG",
    SJABLON = "SJABLON",
    LOPENDE_BIDRAG = "LOPENDE_BIDRAG",
    FAKTISK_UTGIFT = "FAKTISK_UTGIFT",
    BARNETILSYN_MED_STONAD = "BARNETILSYN_MED_STONAD",
    FORPLEINING_UTGIFT = "FORPLEINING_UTGIFT",
    BARN = "BARN",
    SIVILSTAND = "SIVILSTAND",
    BARNETILLEGG = "BARNETILLEGG",
    BARNETILLEGG_FORSVARET = "BARNETILLEGG_FORSVARET",
    DELT_BOSTED = "DELT_BOSTED",
    NETTO_BARNETILSYN = "NETTO_BARNETILSYN",
    UNDERHOLDSKOSTNAD = "UNDERHOLDSKOSTNAD",
    BPS_ANDEL_UNDERHOLDSKOSTNAD = "BPS_ANDEL_UNDERHOLDSKOSTNAD",
    TILLEGGSBIDRAG = "TILLEGGSBIDRAG",
    MAKS_BIDRAG_PER_BARN = "MAKS_BIDRAG_PER_BARN",
    BPS_ANDEL_SAERTILSKUDD = "BPS_ANDEL_SAERTILSKUDD",
    MAKSGRENSE25INNTEKT = "MAKS_GRENSE_25_INNTEKT",
    GEBYRFRITAK = "GEBYRFRITAK",
    SOKNAD_INFO = "SOKNAD_INFO",
    BARN_INFO = "BARN_INFO",
    PERSON_INFO = "PERSON_INFO",
    SAKSBEHANDLER_INFO = "SAKSBEHANDLER_INFO",
    VEDTAK_INFO = "VEDTAK_INFO",
    INNBETALT_BELOP = "INNBETALT_BELOP",
    FORHOLDSMESSIG_FORDELING = "FORHOLDSMESSIG_FORDELING",
    SLUTTBEREGNING_BBM = "SLUTTBEREGNING_BBM",
    KLAGE_STATISTIKK = "KLAGE_STATISTIKK",
}

/** Stønadstype */
export enum OpprettStonadsendringRequestDtoType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

/** Angir om stønaden skal innkreves */
export enum OpprettStonadsendringRequestDtoInnkreving {
    JA = "JA",
    NEI = "NEI",
}

/** Hva er kilden til vedtaket. Automatisk eller manuelt */
export enum OpprettVedtakRequestDtoKilde {
    MANUELT = "MANUELT",
    AUTOMATISK = "AUTOMATISK",
}

/** Type vedtak */
export enum OpprettVedtakRequestDtoType {
    INDEKSREGULERING = "INDEKSREGULERING",
    ALDERSJUSTERING = "ALDERSJUSTERING",
    OPPHOR = "OPPHØR",
    ALDERSOPPHOR = "ALDERSOPPHØR",
    REVURDERING = "REVURDERING",
    FASTSETTELSE = "FASTSETTELSE",
    INNKREVING = "INNKREVING",
    KLAGE = "KLAGE",
    ENDRING = "ENDRING",
    ENDRING_MOTTAKER = "ENDRING_MOTTAKER",
}

/** Kilde/type for en behandlingsreferanse */
export enum BehandlingsreferanseDtoKilde {
    BISYS_SOKNAD = "BISYS_SOKNAD",
    BISYS_KLAGE_REF_SOKNAD = "BISYS_KLAGE_REF_SOKNAD",
}

/** Type Engangsbeløp. Saertilskudd, gebyr m.m. */
export enum EngangsbelopDtoType {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    TILBAKEKREVING = "TILBAKEKREVING",
    SAERTILSKUDD = "SAERTILSKUDD",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
}

/** Angir om engangsbeløpet skal innkreves */
export enum EngangsbelopDtoInnkreving {
    JA = "JA",
    NEI = "NEI",
}

/** Grunnlagstype */
export enum GrunnlagDtoType {
    SAERFRADRAG = "SAERFRADRAG",
    SOKNADSBARN_INFO = "SOKNADSBARN_INFO",
    SKATTEKLASSE = "SKATTEKLASSE",
    BARN_I_HUSSTAND = "BARN_I_HUSSTAND",
    BOSTATUS = "BOSTATUS",
    BOSTATUS_BP = "BOSTATUS_BP",
    INNTEKT = "INNTEKT",
    INNTEKT_BARN = "INNTEKT_BARN",
    INNTEKT_UTVIDET_BARNETRYGD = "INNTEKT_UTVIDET_BARNETRYGD",
    NETTO_SAERTILSKUDD = "NETTO_SAERTILSKUDD",
    SAMVAERSKLASSE = "SAMVAERSKLASSE",
    BIDRAGSEVNE = "BIDRAGSEVNE",
    SAMVAERSFRADRAG = "SAMVAERSFRADRAG",
    SJABLON = "SJABLON",
    LOPENDE_BIDRAG = "LOPENDE_BIDRAG",
    FAKTISK_UTGIFT = "FAKTISK_UTGIFT",
    BARNETILSYN_MED_STONAD = "BARNETILSYN_MED_STONAD",
    FORPLEINING_UTGIFT = "FORPLEINING_UTGIFT",
    BARN = "BARN",
    SIVILSTAND = "SIVILSTAND",
    BARNETILLEGG = "BARNETILLEGG",
    BARNETILLEGG_FORSVARET = "BARNETILLEGG_FORSVARET",
    DELT_BOSTED = "DELT_BOSTED",
    NETTO_BARNETILSYN = "NETTO_BARNETILSYN",
    UNDERHOLDSKOSTNAD = "UNDERHOLDSKOSTNAD",
    BPS_ANDEL_UNDERHOLDSKOSTNAD = "BPS_ANDEL_UNDERHOLDSKOSTNAD",
    TILLEGGSBIDRAG = "TILLEGGSBIDRAG",
    MAKS_BIDRAG_PER_BARN = "MAKS_BIDRAG_PER_BARN",
    BPS_ANDEL_SAERTILSKUDD = "BPS_ANDEL_SAERTILSKUDD",
    MAKSGRENSE25INNTEKT = "MAKS_GRENSE_25_INNTEKT",
    GEBYRFRITAK = "GEBYRFRITAK",
    SOKNAD_INFO = "SOKNAD_INFO",
    BARN_INFO = "BARN_INFO",
    PERSON_INFO = "PERSON_INFO",
    SAKSBEHANDLER_INFO = "SAKSBEHANDLER_INFO",
    VEDTAK_INFO = "VEDTAK_INFO",
    INNBETALT_BELOP = "INNBETALT_BELOP",
    FORHOLDSMESSIG_FORDELING = "FORHOLDSMESSIG_FORDELING",
    SLUTTBEREGNING_BBM = "SLUTTBEREGNING_BBM",
    KLAGE_STATISTIKK = "KLAGE_STATISTIKK",
}

/** Stønadstype */
export enum StonadsendringDtoType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

/** Angir om stønaden skal innkreves */
export enum StonadsendringDtoInnkreving {
    JA = "JA",
    NEI = "NEI",
}

/** Hva er kilden til vedtaket. Automatisk eller manuelt */
export enum VedtakDtoKilde {
    MANUELT = "MANUELT",
    AUTOMATISK = "AUTOMATISK",
}

/** Type vedtak */
export enum VedtakDtoType {
    INDEKSREGULERING = "INDEKSREGULERING",
    ALDERSJUSTERING = "ALDERSJUSTERING",
    OPPHOR = "OPPHØR",
    ALDERSOPPHOR = "ALDERSOPPHØR",
    REVURDERING = "REVURDERING",
    FASTSETTELSE = "FASTSETTELSE",
    INNKREVING = "INNKREVING",
    KLAGE = "KLAGE",
    ENDRING = "ENDRING",
    ENDRING_MOTTAKER = "ENDRING_MOTTAKER",
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
    /** set parameter to `true` for call `securityWorker` for this request */
    secure?: boolean;
    /** request path */
    path: string;
    /** content type of request body */
    type?: ContentType;
    /** query params */
    query?: QueryParamsType;
    /** format of response (i.e. response.json() -> format: "json") */
    format?: ResponseType;
    /** request body */
    body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
    securityWorker?: (
        securityData: SecurityDataType | null
    ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
    secure?: boolean;
    format?: ResponseType;
}

export enum ContentType {
    Json = "application/json",
    FormData = "multipart/form-data",
    UrlEncoded = "application/x-www-form-urlencoded",
    Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
    public instance: AxiosInstance;
    private securityData: SecurityDataType | null = null;
    private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
    private secure?: boolean;
    private format?: ResponseType;

    constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
        this.instance = axios.create({
            ...axiosConfig,
            baseURL: axiosConfig.baseURL || "https://bidrag-vedtak-feature.intern.dev.nav.no",
        });
        this.secure = secure;
        this.format = format;
        this.securityWorker = securityWorker;
    }

    public setSecurityData = (data: SecurityDataType | null) => {
        this.securityData = data;
    };

    protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
        const method = params1.method || (params2 && params2.method);

        return {
            ...this.instance.defaults,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }

    protected stringifyFormItem(formItem: unknown) {
        if (typeof formItem === "object" && formItem !== null) {
            return JSON.stringify(formItem);
        } else {
            return `${formItem}`;
        }
    }

    protected createFormData(input: Record<string, unknown>): FormData {
        return Object.keys(input || {}).reduce((formData, key) => {
            const property = input[key];
            const propertyContent: any[] = property instanceof Array ? property : [property];

            for (const formItem of propertyContent) {
                const isFileType = formItem instanceof Blob || formItem instanceof File;
                formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
            }

            return formData;
        }, new FormData());
    }

    public request = async <T = any, _E = any>({
        secure,
        path,
        type,
        query,
        format,
        body,
        ...params
    }: FullRequestParams): Promise<AxiosResponse<T>> => {
        const secureParams =
            ((typeof secure === "boolean" ? secure : this.secure) &&
                this.securityWorker &&
                (await this.securityWorker(this.securityData))) ||
            {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const responseFormat = format || this.format || undefined;

        if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
            body = this.createFormData(body as Record<string, unknown>);
        }

        if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
            body = JSON.stringify(body);
        }

        return this.instance.request({
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
            },
            params: query,
            responseType: responseFormat,
            data: body,
            url: path,
        });
    };
}

/**
 * @title bidrag-vedtak
 * @version v1
 * @baseUrl https://bidrag-vedtak-feature.intern.dev.nav.no
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    vedtak = {
        /**
         * No description
         *
         * @tags vedtak-controller
         * @name OppdaterVedtak
         * @summary Oppdaterer grunnlag på et eksisterende vedtak
         * @request POST:/vedtak/oppdater/{vedtakId}
         * @secure
         */
        oppdaterVedtak: (vedtakId: number, data: OpprettVedtakRequestDto, params: RequestParams = {}) =>
            this.request<number, void>({
                path: `/vedtak/oppdater/${vedtakId}`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags vedtak-controller
         * @name OpprettVedtak
         * @summary Oppretter nytt vedtak
         * @request POST:/vedtak/
         * @secure
         */
        opprettVedtak: (data: OpprettVedtakRequestDto, params: RequestParams = {}) =>
            this.request<number, void>({
                path: `/vedtak/`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags vedtak-controller
         * @name HentVedtak
         * @summary Henter et vedtak
         * @request GET:/vedtak/{vedtakId}
         * @secure
         */
        hentVedtak: (vedtakId: number, params: RequestParams = {}) =>
            this.request<VedtakDto, void>({
                path: `/vedtak/${vedtakId}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
}
