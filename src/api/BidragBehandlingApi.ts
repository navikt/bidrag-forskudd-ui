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

export interface AbstractJsonSchemaPropertyObject {
    title?: string;
    readOnly?: boolean;
}

export interface Item {
    type?: string;
    properties?: Record<string, AbstractJsonSchemaPropertyObject>;
    requiredProperties?: string[];
}

export interface JsonSchema {
    title?: string;
    description?: string;
    properties?: Record<string, AbstractJsonSchemaPropertyObject>;
    requiredProperties?: string[];
    definitions?: Record<string, Item>;
    type?: string;
    $schema?: string;
}

export type Links = Record<string, Link>;

export interface RepresentationModelObject {
    _links?: Links;
}

export enum BehandlingType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

export enum BoStatusType {
    IKKE_REGISTRERT_PA_ADRESSE = "IKKE_REGISTRERT_PA_ADRESSE",
    REGISTRERT_PA_ADRESSE = "REGISTRERT_PA_ADRESSE",
}

export interface CollectionModelEntityModelOpplysninger {
    _embedded?: {
        opplysningers?: EntityModelOpplysninger[];
    };
    _links?: Links;
}

export interface EntityModelOpplysninger {
    aktiv: boolean;
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date-time */
    hentetDato: string;
    _links?: Links;
}

export enum ForskuddAarsakType {
    SF = "SF",
    NF = "NF",
    OF = "OF",
    AF = "AF",
    CF = "CF",
    DF = "DF",
    LF = "LF",
    GF = "GF",
    HF = "HF",
    BF = "BF",
    KF = "KF",
    QF = "QF",
    MF = "MF",
    PF = "PF",
    EF = "EF",
    FF = "FF",
    ANNET_AVSLAG = "ANNET_AVSLAG",
    PGA_BARNEPENSJ = "PGA_BARNEPENSJ",
    BARNS_EKTESKAP = "BARNS_EKTESKAP",
    BARNS_INNTEKT = "BARNS_INNTEKT",
    PGA_YTELSE_FTRL = "PGA_YTELSE_FTRL",
    FULLT_UNDERH_OFF = "FULLT_UNDERH_OFF",
    IKKE_OMSORG = "IKKE_OMSORG",
    IKKE_OPPH_I_RIKET = "IKKE_OPPH_I_RIKET",
    MANGL_DOK = "MANGL_DOK",
    PGA_SAMMENFL = "PGA_SAMMENFL",
    OPPH_UTLAND = "OPPH_UTLAND",
    UTENL_YTELSE = "UTENL_YTELSE",
}

export enum OpplysningerType {
    INNTEKTSOPPLYSNINGER = "INNTEKTSOPPLYSNINGER",
    BOFORHOLD = "BOFORHOLD",
}

export enum RolleType {
    BIDRAGS_PLIKTIG = "BIDRAGS_PLIKTIG",
    BIDRAGS_MOTTAKER = "BIDRAGS_MOTTAKER",
    BARN = "BARN",
    REELL_MOTTAKER = "REELL_MOTTAKER",
    FEILREGISTRERT = "FEILREGISTRERT",
}

export enum SivilstandType {
    ENKE_ELLER_ENKEMANN = "ENKE_ELLER_ENKEMANN",
    GIFT = "GIFT",
    GJENLEVENDE_PARTNER = "GJENLEVENDE_PARTNER",
    REGISTRERT_PARTNER = "REGISTRERT_PARTNER",
    SEPARERT = "SEPARERT",
    SEPARERT_PARTNER = "SEPARERT_PARTNER",
    SKILT = "SKILT",
    SKILT_PARTNER = "SKILT_PARTNER",
    UGIFT = "UGIFT",
    UOPPGITT = "UOPPGITT",
}

export enum SoknadFraType {
    BM_I_ANNEN_SAK = "BM_I_ANNEN_SAK",
    BARN18AAR = "BARN_18_AAR",
    NAV_BIDRAG = "NAV_BIDRAG",
    FYLKESNEMDA = "FYLKESNEMDA",
    NAV_INTERNASJONAL = "NAV_INTERNASJONAL",
    KOMMUNE = "KOMMUNE",
    KONVERTERING = "KONVERTERING",
    BIDRAGSMOTTAKER = "BIDRAGSMOTTAKER",
    NORSKE_MYNDIGHET = "NORSKE_MYNDIGHET",
    BIDRAGSPLIKTIG = "BIDRAGSPLIKTIG",
    UTENLANDSKE_MYNDIGHET = "UTENLANDSKE_MYNDIGHET",
    VERGE = "VERGE",
    TRYGDEETATEN_INNKREVING = "TRYGDEETATEN_INNKREVING",
    KLAGE_ANKE = "KLAGE_ANKE",
}

export enum SoknadType {
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

export interface EntityModelBehandling {
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    /** @format date-time */
    mottatDato: string;
    saksnummer: string;
    /** @format int64 */
    soknadId: number;
    /** @format int64 */
    soknadRefId?: number;
    behandlerEnhet: string;
    soknadFra: SoknadFraType;
    stonadType?: EntityModelBehandlingStonadType;
    engangsbelopType?: EntityModelBehandlingEngangsbelopType;
    /** @format int64 */
    vedtakId?: number;
    /** @format date-time */
    virkningsDato?: string;
    aarsak?: ForskuddAarsakType;
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
    _links?: Links;
}

export interface CollectionModelObject {
    _embedded?: {
        objects?: object[];
    };
    _links?: Links;
}

export interface CollectionModelEntityModelBehandling {
    _embedded?: {
        behandlings?: EntityModelBehandling[];
    };
    _links?: Links;
}

export interface BehandlingRequestBody {
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    /** @format date-time */
    mottatDato: string;
    saksnummer: string;
    /** @format int64 */
    soknadId: number;
    /** @format int64 */
    soknadRefId?: number;
    behandlerEnhet: string;
    soknadFra: SoknadFraType;
    stonadType?: BehandlingRequestBodyStonadType;
    engangsbelopType?: BehandlingRequestBodyEngangsbelopType;
    /** @format int64 */
    vedtakId?: number;
    /** @format date-time */
    virkningsDato?: string;
    aarsak?: ForskuddAarsakType;
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
    /** @format int64 */
    id?: number;
    roller: string[];
    husstandsBarn: string[];
    inntekter: string[];
    sivilstand: string[];
    barnetillegg: string[];
    utvidetbarnetrygd: string[];
}

export interface OpplysningerRequestBody {
    behandling: string;
    aktiv: boolean;
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date-time */
    hentetDato: string;
    /** @format int64 */
    id?: number;
}

export interface UpdateVirkningsTidspunktRequest {
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    aarsak?: ForskuddAarsakType;
    /**
     * @format date
     * @example "2025-01-25"
     */
    virkningsDato?: string;
}

export interface VirkningsTidspunktResponse {
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    aarsak?: ForskuddAarsakType;
    /**
     * @format date
     * @example "2025-01-25"
     */
    virkningsDato?: string;
}

export interface BarnetilleggDto {
    /** @format int64 */
    id?: number;
    ident: string;
    barnetillegg: number;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoFom?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoTom?: string;
}

export interface InntektDto {
    /** @format int64 */
    id?: number;
    taMed: boolean;
    inntektType?: string;
    belop: number;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoFom?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoTom?: string;
    ident: string;
    fraGrunnlag: boolean;
}

export interface UpdateInntekterRequest {
    /** @uniqueItems true */
    inntekter: InntektDto[];
    /** @uniqueItems true */
    barnetillegg: BarnetilleggDto[];
    /** @uniqueItems true */
    utvidetbarnetrygd: UtvidetbarnetrygdDto[];
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
}

export interface UtvidetbarnetrygdDto {
    /** @format int64 */
    id?: number;
    deltBoSted: boolean;
    belop: number;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoFom?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoTom?: string;
}

export interface InntekterResponse {
    /** @uniqueItems true */
    inntekter: InntektDto[];
    /** @uniqueItems true */
    barnetillegg: BarnetilleggDto[];
    /** @uniqueItems true */
    utvidetbarnetrygd: UtvidetbarnetrygdDto[];
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
}

export interface HusstandsBarnDto {
    /** @format int64 */
    id?: number;
    medISaken: boolean;
    /** @uniqueItems true */
    perioder: HusstandsBarnPeriodeDto[];
    ident?: string;
    navn?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    foedselsDato?: string;
}

export interface HusstandsBarnPeriodeDto {
    /** @format int64 */
    id?: number;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoFom?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoTom?: string;
    boStatus: BoStatusType;
    kilde: string;
}

export interface SivilstandDto {
    /** @format int64 */
    id?: number;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoFom?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoTom?: string;
    sivilstandType: SivilstandType;
}

export interface UpdateBoforholdRequest {
    /** @uniqueItems true */
    husstandsBarn: HusstandsBarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
}

export interface BoforholdResponse {
    /** @uniqueItems true */
    husstandsBarn: HusstandsBarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
}

export interface UpdateBehandlingRequestExtended {
    soknadType: SoknadType;
    soknadFraType: SoknadFraType;
    /**
     * @format date
     * @example "2025-01-25"
     */
    datoFom: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    mottatDato: string;
}

export interface BehandlingDto {
    /** @format int64 */
    id: number;
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    erVedtakFattet: boolean;
    /** @format date */
    datoFom: string;
    /** @format date */
    datoTom: string;
    /** @format date */
    mottatDato: string;
    soknadFraType: SoknadFraType;
    saksnummer: string;
    /** @format int64 */
    soknadId: number;
    behandlerEnhet: string;
    /** @uniqueItems true */
    roller: RolleDto[];
    /** @uniqueItems true */
    husstandsBarn: HusstandsBarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    /** @format date */
    virkningsDato?: string;
    /** @format int64 */
    soknadRefId?: number;
    aarsak?: ForskuddAarsakType;
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
}

export interface RolleDto {
    /** @format int64 */
    id: number;
    rolleType: RolleType;
    ident: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
}

export interface CreateBehandlingRequest {
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    /** @format date-time */
    mottatDato: string;
    soknadFra: SoknadFraType;
    /**
     * @minLength 0
     * @maxLength 7
     */
    saksnummer: string;
    /**
     * @minLength 4
     * @maxLength 4
     */
    behandlerEnhet: string;
    /**
     * @maxItems 2147483647
     * @minItems 2
     * @uniqueItems true
     */
    roller: CreateRolleDto[];
    stonadType: CreateBehandlingRequestStonadType;
    engangsbelopType: CreateBehandlingRequestEngangsbelopType;
    /** @format int64 */
    soknadId: number;
    /** @format int64 */
    soknadRefId?: number;
}

/** Rolle beskrivelse som er brukte til å opprette nye roller */
export interface CreateRolleDto {
    rolleType: RolleType;
    /** F.eks fødselsnummer */
    ident: string;
    /**
     * F.eks fødselsdato
     * @format date
     */
    fodtDato?: string;
    /**
     * Opprettet dato
     * @format date
     */
    opprettetDato?: string;
}

export interface CreateBehandlingResponse {
    /** @format int64 */
    id: number;
}

export interface AddOpplysningerRequest {
    /** @format int64 */
    behandlingId: number;
    aktiv: boolean;
    opplysningerType: OpplysningerType;
    /** data */
    data: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    hentetDato: string;
}

export interface OpplysningerDto {
    /** @format int64 */
    id: number;
    /** @format int64 */
    behandlingId: number;
    aktiv: boolean;
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date */
    hentetDato: string;
}

export interface ForskuddBeregningPerBarn {
    ident: string;
    beregnetForskuddPeriodeListe: ResultatPeriode[];
    grunnlagListe?: GrunnlagDto[];
}

export interface ForskuddBeregningRespons {
    resultat?: ForskuddBeregningPerBarn[];
    feil?: string[];
}

export interface GrunnlagDto {
    /** Referanse til grunnlaget */
    referanse: string;
    /** Grunnlagstype */
    type: GrunnlagDtoType;
    /** Innholdet i grunnlaget */
    innhold: JsonNode;
}

/** Innholdet i grunnlaget */
export type JsonNode = object;

/** Periode (fra-til dato */
export interface Periode {
    /**
     * Fra-og-med-dato
     * @format date
     */
    datoFom?: string;
    /**
     * Til-dato
     * @format date
     */
    datoTil?: string;
}

/** Resultatet av en beregning */
export interface ResultatBeregning {
    /** Resultat beløp */
    belop: number;
    /** Resultat kode */
    kode: string;
    /** Resultat regel */
    regel: string;
}

/** Resultatet av en beregning for en gitt periode */
export interface ResultatPeriode {
    /** Periode (fra-til dato */
    periode: Periode;
    /** Resultatet av en beregning */
    resultat: ResultatBeregning;
    /** Beregnet grunnlag innhold */
    grunnlagReferanseListe: string[];
    sivilstandType?: SivilstandType;
}

export interface Link {
    href?: string;
    hreflang?: string;
    title?: string;
    type?: string;
    deprecation?: string;
    profile?: string;
    name?: string;
    templated?: boolean;
}

export enum EntityModelBehandlingStonadType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

export enum EntityModelBehandlingEngangsbelopType {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    TILBAKEKREVING = "TILBAKEKREVING",
    SAERTILSKUDD = "SAERTILSKUDD",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
}

export enum BehandlingRequestBodyStonadType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

export enum BehandlingRequestBodyEngangsbelopType {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    TILBAKEKREVING = "TILBAKEKREVING",
    SAERTILSKUDD = "SAERTILSKUDD",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
}

export enum CreateBehandlingRequestStonadType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

export enum CreateBehandlingRequestEngangsbelopType {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    TILBAKEKREVING = "TILBAKEKREVING",
    SAERTILSKUDD = "SAERTILSKUDD",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
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
    KAPITALINNTEKT = "KAPITALINNTEKT",
    KAPITALINNTEKT_BARN = "KAPITALINNTEKT_BARN",
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
            baseURL: axiosConfig.baseURL || "https://bidrag-behandling-feature.intern.dev.nav.no",
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
 * @title bidrag-behandling
 * @version v1
 * @baseUrl https://bidrag-behandling-feature.intern.dev.nav.no
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    behandlings = {
        /**
         * @description get-behandling
         *
         * @tags behandling-entity-controller
         * @name GetCollectionResourceBehandlingGet1
         * @request GET:/behandlings
         * @secure
         */
        getCollectionResourceBehandlingGet1: (params: RequestParams = {}) =>
            this.request<CollectionModelEntityModelBehandling, any>({
                path: `/behandlings`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description create-behandling
         *
         * @tags behandling-entity-controller
         * @name PostCollectionResourceBehandlingPost
         * @request POST:/behandlings
         * @secure
         */
        postCollectionResourceBehandlingPost: (data: BehandlingRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, any>({
                path: `/behandlings`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags behandling-search-controller
         * @name ExecuteSearchBehandlingGet
         * @request GET:/behandlings/search/findBehandlingById
         * @secure
         */
        executeSearchBehandlingGet: (
            query?: {
                /** @format int64 */
                id?: number;
            },
            params: RequestParams = {}
        ) =>
            this.request<EntityModelBehandling, void>({
                path: `/behandlings/search/findBehandlingById`,
                method: "GET",
                query: query,
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags behandling-search-controller
         * @name ExecuteSearchBehandlingGet1
         * @request GET:/behandlings/search/hentBehandlinger
         * @secure
         */
        executeSearchBehandlingGet1: (params: RequestParams = {}) =>
            this.request<CollectionModelEntityModelBehandling, void>({
                path: `/behandlings/search/hentBehandlinger`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags behandling-search-controller
         * @name ExecuteSearchBehandlingGet2
         * @request GET:/behandlings/search/oppdaterVedtakId
         * @secure
         */
        executeSearchBehandlingGet2: (
            query?: {
                /** @format int64 */
                behandlingId?: number;
                /** @format int64 */
                vedtakId?: number;
            },
            params: RequestParams = {}
        ) =>
            this.request<void, void>({
                path: `/behandlings/search/oppdaterVedtakId`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags behandling-search-controller
         * @name ExecuteSearchBehandlingGet3
         * @request GET:/behandlings/search/updateVirkningsTidspunkt
         * @secure
         */
        executeSearchBehandlingGet3: (
            query?: {
                /** @format int64 */
                behandlingId?: number;
                aarsak?: ForskuddAarsakType;
                /** @format date-time */
                virkningsDato?: string;
                virkningsTidspunktBegrunnelseKunINotat?: string;
                virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<void, void>({
                path: `/behandlings/search/updateVirkningsTidspunkt`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),

        /**
         * @description get-behandling
         *
         * @tags behandling-entity-controller
         * @name GetItemResourceBehandlingGet
         * @request GET:/behandlings/{id}
         * @secure
         */
        getItemResourceBehandlingGet: (id: string, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, void>({
                path: `/behandlings/${id}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description update-behandling
         *
         * @tags behandling-entity-controller
         * @name PutItemResourceBehandlingPut
         * @request PUT:/behandlings/{id}
         * @secure
         */
        putItemResourceBehandlingPut: (id: string, data: BehandlingRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, any>({
                path: `/behandlings/${id}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-behandling
         *
         * @tags behandling-entity-controller
         * @name DeleteItemResourceBehandlingDelete
         * @request DELETE:/behandlings/{id}
         * @secure
         */
        deleteItemResourceBehandlingDelete: (id: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/behandlings/${id}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description patch-behandling
         *
         * @tags behandling-entity-controller
         * @name PatchItemResourceBehandlingPatch
         * @request PATCH:/behandlings/{id}
         * @secure
         */
        patchItemResourceBehandlingPatch: (id: string, data: BehandlingRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, any>({
                path: `/behandlings/${id}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    opplysningers = {
        /**
         * @description get-opplysninger
         *
         * @tags opplysninger-entity-controller
         * @name GetCollectionResourceOpplysningerGet1
         * @request GET:/opplysningers
         * @secure
         */
        getCollectionResourceOpplysningerGet1: (params: RequestParams = {}) =>
            this.request<CollectionModelEntityModelOpplysninger, any>({
                path: `/opplysningers`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description create-opplysninger
         *
         * @tags opplysninger-entity-controller
         * @name PostCollectionResourceOpplysningerPost
         * @request POST:/opplysningers
         * @secure
         */
        postCollectionResourceOpplysningerPost: (data: OpplysningerRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelOpplysninger, any>({
                path: `/opplysningers`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags opplysninger-search-controller
         * @name ExecuteSearchOpplysningerGet
         * @request GET:/opplysningers/search/findActiveByBehandlingIdAndType
         * @secure
         */
        executeSearchOpplysningerGet: (
            query?: {
                /** @format int64 */
                behandlingId?: number;
                opplysningerType?: OpplysningerType;
            },
            params: RequestParams = {}
        ) =>
            this.request<EntityModelOpplysninger, void>({
                path: `/opplysningers/search/findActiveByBehandlingIdAndType`,
                method: "GET",
                query: query,
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description get-opplysninger
         *
         * @tags opplysninger-entity-controller
         * @name GetItemResourceOpplysningerGet
         * @request GET:/opplysningers/{id}
         * @secure
         */
        getItemResourceOpplysningerGet: (id: string, params: RequestParams = {}) =>
            this.request<EntityModelOpplysninger, void>({
                path: `/opplysningers/${id}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description update-opplysninger
         *
         * @tags opplysninger-entity-controller
         * @name PutItemResourceOpplysningerPut
         * @request PUT:/opplysningers/{id}
         * @secure
         */
        putItemResourceOpplysningerPut: (id: string, data: OpplysningerRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelOpplysninger, any>({
                path: `/opplysningers/${id}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-opplysninger
         *
         * @tags opplysninger-entity-controller
         * @name DeleteItemResourceOpplysningerDelete
         * @request DELETE:/opplysningers/{id}
         * @secure
         */
        deleteItemResourceOpplysningerDelete: (id: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/opplysningers/${id}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description patch-opplysninger
         *
         * @tags opplysninger-entity-controller
         * @name PatchItemResourceOpplysningerPatch
         * @request PATCH:/opplysningers/{id}
         * @secure
         */
        patchItemResourceOpplysningerPatch: (id: string, data: OpplysningerRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelOpplysninger, any>({
                path: `/opplysningers/${id}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description get-behandling-by-opplysninger-Id
         *
         * @tags opplysninger-property-reference-controller
         * @name FollowPropertyReferenceOpplysningerGet1
         * @request GET:/opplysningers/{id}/behandling
         * @secure
         */
        followPropertyReferenceOpplysningerGet1: (id: string, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, void>({
                path: `/opplysningers/${id}/behandling`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description update-behandling-by-opplysninger-Id
         *
         * @tags opplysninger-property-reference-controller
         * @name CreatePropertyReferenceOpplysningerPut
         * @request PUT:/opplysningers/{id}/behandling
         * @secure
         */
        createPropertyReferenceOpplysningerPut: (id: string, data: CollectionModelObject, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, any>({
                path: `/opplysningers/${id}/behandling`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-behandling-by-opplysninger-Id
         *
         * @tags opplysninger-property-reference-controller
         * @name DeletePropertyReferenceOpplysningerDelete
         * @request DELETE:/opplysningers/{id}/behandling
         * @secure
         */
        deletePropertyReferenceOpplysningerDelete: (id: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/opplysningers/${id}/behandling`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description patch-behandling-by-opplysninger-Id
         *
         * @tags opplysninger-property-reference-controller
         * @name CreatePropertyReferenceOpplysningerPatch
         * @request PATCH:/opplysningers/{id}/behandling
         * @secure
         */
        createPropertyReferenceOpplysningerPatch: (
            id: string,
            data: CollectionModelObject,
            params: RequestParams = {}
        ) =>
            this.request<EntityModelBehandling, any>({
                path: `/opplysningers/${id}/behandling`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description get-behandling-by-opplysninger-Id
         *
         * @tags opplysninger-property-reference-controller
         * @name FollowPropertyReferenceOpplysningerGet
         * @request GET:/opplysningers/{id}/behandling/{propertyId}
         * @secure
         */
        followPropertyReferenceOpplysningerGet: (id: string, propertyId: string, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, void>({
                path: `/opplysningers/${id}/behandling/${propertyId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-behandling-by-opplysninger-Id
         *
         * @tags opplysninger-property-reference-controller
         * @name DeletePropertyReferenceIdOpplysningerDelete
         * @request DELETE:/opplysningers/{id}/behandling/{propertyId}
         * @secure
         */
        deletePropertyReferenceIdOpplysningerDelete: (id: string, propertyId: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/opplysningers/${id}/behandling/${propertyId}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),
    };
    profile = {
        /**
         * No description
         *
         * @tags profile-controller
         * @name ListAllFormsOfMetadata1
         * @request GET:/profile
         * @secure
         */
        listAllFormsOfMetadata1: (params: RequestParams = {}) =>
            this.request<RepresentationModelObject, any>({
                path: `/profile`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags profile-controller
         * @name Descriptor111
         * @request GET:/profile/behandlings
         * @secure
         */
        descriptor111: (params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/profile/behandlings`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags profile-controller
         * @name Descriptor112
         * @request GET:/profile/opplysningers
         * @secure
         */
        descriptor112: (params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/profile/opplysningers`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),
    };
    api = {
        /**
         * @description Hente virkningstidspunkt data
         *
         * @tags virknings-tidspunkt-controller
         * @name HentVirkningsTidspunkt
         * @request GET:/api/behandling/{behandlingId}/virkningstidspunkt
         * @secure
         */
        hentVirkningsTidspunkt: (behandlingId: number, params: RequestParams = {}) =>
            this.request<VirkningsTidspunktResponse, VirkningsTidspunktResponse>({
                path: `/api/behandling/${behandlingId}/virkningstidspunkt`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere virkningstidspunkt data
         *
         * @tags virknings-tidspunkt-controller
         * @name OppdaterVirkningsTidspunkt
         * @request PUT:/api/behandling/{behandlingId}/virkningstidspunkt
         * @secure
         */
        oppdaterVirkningsTidspunkt: (
            behandlingId: number,
            data: UpdateVirkningsTidspunktRequest,
            params: RequestParams = {}
        ) =>
            this.request<VirkningsTidspunktResponse, VirkningsTidspunktResponse>({
                path: `/api/behandling/${behandlingId}/virkningstidspunkt`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdaterer vedtak id
         *
         * @tags behandling-controller
         * @name OppdaterVedtakId
         * @request PUT:/api/behandling/{behandlingId}/vedtak/{vedtakId}
         * @secure
         */
        oppdaterVedtakId: (behandlingId: number, vedtakId: number, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/api/behandling/${behandlingId}/vedtak/${vedtakId}`,
                method: "PUT",
                secure: true,
                ...params,
            }),

        /**
         * @description Hente inntekter data
         *
         * @tags inntekter-controller
         * @name HentInntekter
         * @request GET:/api/behandling/{behandlingId}/inntekter
         * @secure
         */
        hentInntekter: (behandlingId: number, params: RequestParams = {}) =>
            this.request<InntekterResponse, InntekterResponse>({
                path: `/api/behandling/${behandlingId}/inntekter`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere inntekter data
         *
         * @tags inntekter-controller
         * @name OppdaterInntekter
         * @request PUT:/api/behandling/{behandlingId}/inntekter
         * @secure
         */
        oppdaterInntekter: (behandlingId: number, data: UpdateInntekterRequest, params: RequestParams = {}) =>
            this.request<InntekterResponse, InntekterResponse>({
                path: `/api/behandling/${behandlingId}/inntekter`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Hente boforhold data
         *
         * @tags boforhold-controller
         * @name HentBoforhold
         * @request GET:/api/behandling/{behandlingId}/boforhold
         * @secure
         */
        hentBoforhold: (behandlingId: number, params: RequestParams = {}) =>
            this.request<BoforholdResponse, any>({
                path: `/api/behandling/${behandlingId}/boforhold`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere boforhold data
         *
         * @tags boforhold-controller
         * @name OppdatereBoforhold
         * @request PUT:/api/behandling/{behandlingId}/boforhold
         * @secure
         */
        oppdatereBoforhold: (behandlingId: number, data: UpdateBoforholdRequest, params: RequestParams = {}) =>
            this.request<BoforholdResponse, any>({
                path: `/api/behandling/${behandlingId}/boforhold`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere en behandling
         *
         * @tags behandling-controller
         * @name OppdaterBehandlingExtended
         * @request PUT:/api/behandling/ext/{behandlingId}
         * @secure
         */
        oppdaterBehandlingExtended: (
            behandlingId: number,
            data: UpdateBehandlingRequestExtended,
            params: RequestParams = {}
        ) =>
            this.request<BehandlingDto, BehandlingDto>({
                path: `/api/behandling/ext/${behandlingId}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Hente en liste av alle behandlinger
         *
         * @tags behandling-controller
         * @name HentBehandlinger
         * @request GET:/api/behandling
         * @secure
         */
        hentBehandlinger: (params: RequestParams = {}) =>
            this.request<BehandlingDto[], BehandlingDto[]>({
                path: `/api/behandling`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Legge til en ny behandling
         *
         * @tags behandling-controller
         * @name CreateBehandling
         * @request POST:/api/behandling
         * @secure
         */
        createBehandling: (data: CreateBehandlingRequest, params: RequestParams = {}) =>
            this.request<CreateBehandlingResponse, CreateBehandlingResponse>({
                path: `/api/behandling`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Legge til nye opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name AddOpplysningerData
         * @request POST:/api/behandling/{behandlingId}/opplysninger
         * @secure
         */
        addOpplysningerData: (behandlingId: number, data: AddOpplysningerRequest, params: RequestParams = {}) =>
            this.request<OpplysningerDto, OpplysningerDto>({
                path: `/api/behandling/${behandlingId}/opplysninger`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Beregn forskudd
         *
         * @tags behandling-beregn-forskudd-controller
         * @name BeregnForskudd
         * @request POST:/api/behandling/{behandlingId}/beregn
         * @secure
         */
        beregnForskudd: (behandlingId: number, params: RequestParams = {}) =>
            this.request<ForskuddBeregningRespons, any>({
                path: `/api/behandling/${behandlingId}/beregn`,
                method: "POST",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Hente en behandling
         *
         * @tags behandling-controller
         * @name HentBehandling
         * @request GET:/api/behandling/{behandlingId}
         * @secure
         */
        hentBehandling: (behandlingId: number, params: RequestParams = {}) =>
            this.request<BehandlingDto, BehandlingDto>({
                path: `/api/behandling/${behandlingId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Hente aktive opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name HentAktiv
         * @request GET:/api/behandling/{behandlingId}/opplysninger/{opplysningerType}/aktiv
         * @secure
         */
        hentAktiv: (behandlingId: number, opplysningerType: OpplysningerType, params: RequestParams = {}) =>
            this.request<OpplysningerDto, OpplysningerDto>({
                path: `/api/behandling/${behandlingId}/opplysninger/${opplysningerType}/aktiv`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),
    };
}
