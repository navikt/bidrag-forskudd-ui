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

export interface EntityModelRolle {
    rolleType: EntityModelRolleRolleType;
    ident: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
    deleted: boolean;
    /** @format int32 */
    soknadsLinje: number;
    _links?: Links;
}

export interface CollectionModelEntityModelRolle {
    _embedded?: {
        rolles?: EntityModelRolle[];
    };
    _links?: Links;
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
    /** @format int64 */
    grunnlagspakkeId?: number;
    deleted: boolean;
    _links?: Links;
}

export interface CollectionModelObject {
    _embedded?: {
        objects?: object[];
    };
    _links?: Links;
}

export enum OpplysningerType {
    INNTEKTSOPPLYSNINGER = "INNTEKTSOPPLYSNINGER",
    BOFORHOLD = "BOFORHOLD",
}

export interface EntityModelOpplysninger {
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date-time */
    hentetDato: string;
    /** @format date-time */
    ts?: string;
    _links?: Links;
}

export interface CollectionModelEntityModelOpplysninger {
    _embedded?: {
        opplysningers?: EntityModelOpplysninger[];
    };
    _links?: Links;
}

export interface CollectionModelEntityModelBehandling {
    _embedded?: {
        behandlings?: EntityModelBehandling[];
    };
    _links?: Links;
}

export interface CollectionModelRolle {
    _embedded?: {
        rolles?: RolleResponse[];
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
    /** @format int64 */
    grunnlagspakkeId?: number;
    roller: string[];
    husstandsBarn: string[];
    inntekter: string[];
    sivilstand: string[];
    barnetillegg: string[];
    utvidetbarnetrygd: string[];
    deleted: boolean;
}

export interface RolleRequestBody {
    behandling: string;
    rolleType: RolleRequestBodyRolleType;
    ident: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
    /** @format int64 */
    id?: number;
    deleted: boolean;
    /** @format int32 */
    soknadsLinje: number;
}

export interface RolleResponse {
    rolleType: RolleResponseRolleType;
    ident: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
    deleted: boolean;
    /** @format int32 */
    soknadsLinje: number;
}

export interface OpplysningerRequestBody {
    behandling: string;
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date-time */
    hentetDato: string;
    /** @format date-time */
    ts?: string;
    /** @format int64 */
    id?: number;
}

export interface UpdateBehandlingRequest {
    /** @format int64 */
    grunnlagspakkeId?: number;
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

/** Rolle beskrivelse som er brukte til å opprette nye roller */
export interface CreateRolleDto {
    rolleType: CreateRolleRolleType;
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
    erSlettet: boolean;
}

export enum CreateRolleRolleType {
    BIDRAGS_PLIKTIG = "BIDRAGS_PLIKTIG",
    BIDRAGS_MOTTAKER = "BIDRAGS_MOTTAKER",
    BARN = "BARN",
    REELL_MOTTAKER = "REELL_MOTTAKER",
    FEILREGISTRERT = "FEILREGISTRERT",
}

export interface SyncRollerRequest {
    roller: CreateRolleDto[];
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
    /** @uniqueItems true */
    inntektPostListe: InntektPost[];
}

export interface InntektPost {
    /**
     * Kode for inntektspost
     * @example "bonus"
     */
    kode: string;
    /**
     * Visningsnavn for kode
     * @example "Bonus"
     */
    visningsnavn: string;
    /**
     * Beløp som utgør inntektsposten
     * @example 60000
     */
    beløp: number;
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

export interface BehandlingInfoDto {
    /** @format int64 */
    vedtakId?: number;
    /** @format int64 */
    behandlingId?: number;
    /** @format int64 */
    soknadId: number;
    erFattetBeregnet?: boolean;
    erVedtakIkkeTilbakekreving: boolean;
    stonadType?: BehandlingInfoDtoStonadType;
    engangsBelopType?: BehandlingInfoDtoEngangsBelopType;
    behandlingType?: string;
    soknadType?: string;
    soknadFra?: SoknadFraType;
    vedtakType?: BehandlingInfoDtoVedtakType;
    barnIBehandling: string[];
}

export interface ForsendelseRolleDto {
    fødselsnummer?: string;
    type: ForsendelseRolleDtoType;
}

export interface InitalizeForsendelseRequest {
    /**
     * @minLength 0
     * @maxLength 7
     */
    saksnummer: string;
    behandlingInfo: BehandlingInfoDto;
    enhet: string;
    tema?: string;
    roller: ForsendelseRolleDto[];
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
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date */
    hentetDato: string;
}

export interface ForskuddBeregningPerBarn {
    ident: string;
    beregnetForskuddPeriodeListe: ResultatPeriode[];
    grunnlagListe?: Grunnlag[];
}

export interface ForskuddBeregningRespons {
    resultat?: ForskuddBeregningPerBarn[];
    feil?: string[];
}

/** Grunnlag */
export interface Grunnlag {
    /** Referanse */
    referanse?: string;
    /** Type */
    type?: string;
    /** Innhold */
    innhold?: JsonNode;
}

/** Innhold */
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
    /** @format int64 */
    grunnlagspakkeId?: number;
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
    rolleType: RolleDtoRolleType;
    ident: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
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

export enum EntityModelRolleRolleType {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
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

export enum RolleRequestBodyRolleType {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
}

export enum RolleResponseRolleType {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
}

export enum BehandlingInfoDtoStonadType {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
}

export enum BehandlingInfoDtoEngangsBelopType {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    TILBAKEKREVING = "TILBAKEKREVING",
    SAERTILSKUDD = "SAERTILSKUDD",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
}

export enum BehandlingInfoDtoVedtakType {
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

export enum ForsendelseRolleDtoType {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
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

export enum RolleDtoRolleType {
    BARN = "BARN",
    BIDRAGSMOTTAKER = "BIDRAGSMOTTAKER",
    BIDRAGSPLIKTIG = "BIDRAGSPLIKTIG",
    FEILREGISTRERT = "FEILREGISTRERT",
    REELMOTTAKER = "REELMOTTAKER",
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
            baseURL: axiosConfig.baseURL || "https://bidrag-behandling.intern.dev.nav.no",
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
 * @baseUrl https://bidrag-behandling.intern.dev.nav.no
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

        /**
         * @description get-rolle-by-behandling-Id
         *
         * @tags behandling-property-reference-controller
         * @name FollowPropertyReferenceBehandlingGet1
         * @request GET:/behandlings/{id}/roller
         * @secure
         */
        followPropertyReferenceBehandlingGet1: (id: string, params: RequestParams = {}) =>
            this.request<CollectionModelRolle, void>({
                path: `/behandlings/${id}/roller`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description update-rolle-by-behandling-Id
         *
         * @tags behandling-property-reference-controller
         * @name CreatePropertyReferenceBehandlingPut
         * @request PUT:/behandlings/{id}/roller
         * @secure
         */
        createPropertyReferenceBehandlingPut: (id: string, data: CollectionModelObject, params: RequestParams = {}) =>
            this.request<CollectionModelRolle, any>({
                path: `/behandlings/${id}/roller`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-rolle-by-behandling-Id
         *
         * @tags behandling-property-reference-controller
         * @name DeletePropertyReferenceBehandlingDelete
         * @request DELETE:/behandlings/{id}/roller
         * @secure
         */
        deletePropertyReferenceBehandlingDelete: (id: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/behandlings/${id}/roller`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description patch-rolle-by-behandling-Id
         *
         * @tags behandling-property-reference-controller
         * @name CreatePropertyReferenceBehandlingPatch
         * @request PATCH:/behandlings/{id}/roller
         * @secure
         */
        createPropertyReferenceBehandlingPatch: (id: string, data: CollectionModelObject, params: RequestParams = {}) =>
            this.request<CollectionModelRolle, any>({
                path: `/behandlings/${id}/roller`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description get-rolle-by-behandling-Id
         *
         * @tags behandling-property-reference-controller
         * @name FollowPropertyReferenceBehandlingGet
         * @request GET:/behandlings/{id}/roller/{propertyId}
         * @secure
         */
        followPropertyReferenceBehandlingGet: (id: string, propertyId: string, params: RequestParams = {}) =>
            this.request<CollectionModelRolle, void>({
                path: `/behandlings/${id}/roller/${propertyId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-rolle-by-behandling-Id
         *
         * @tags behandling-property-reference-controller
         * @name DeletePropertyReferenceIdBehandlingDelete
         * @request DELETE:/behandlings/{id}/roller/{propertyId}
         * @secure
         */
        deletePropertyReferenceIdBehandlingDelete: (id: string, propertyId: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/behandlings/${id}/roller/${propertyId}`,
                method: "DELETE",
                secure: true,
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
         * @request GET:/opplysningers/search/findTopByBehandlingIdAndOpplysningerTypeOrderByTsDescIdDesc
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
                path: `/opplysningers/search/findTopByBehandlingIdAndOpplysningerTypeOrderByTsDescIdDesc`,
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

        /**
         * No description
         *
         * @tags profile-controller
         * @name Descriptor113
         * @request GET:/profile/rolles
         * @secure
         */
        descriptor113: (params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/profile/rolles`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),
    };
    rolles = {
        /**
         * @description get-rolle
         *
         * @tags rolle-entity-controller
         * @name GetCollectionResourceRolleGet1
         * @request GET:/rolles
         * @secure
         */
        getCollectionResourceRolleGet1: (params: RequestParams = {}) =>
            this.request<CollectionModelEntityModelRolle, any>({
                path: `/rolles`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description create-rolle
         *
         * @tags rolle-entity-controller
         * @name PostCollectionResourceRollePost
         * @request POST:/rolles
         * @secure
         */
        postCollectionResourceRollePost: (data: RolleRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelRolle, any>({
                path: `/rolles`,
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
         * @tags rolle-search-controller
         * @name ExecuteSearchRolleGet
         * @request GET:/rolles/search/findRollerByBehandlingId
         * @secure
         */
        executeSearchRolleGet: (
            query?: {
                /** @format int64 */
                behandlingId?: number;
            },
            params: RequestParams = {}
        ) =>
            this.request<CollectionModelEntityModelRolle, void>({
                path: `/rolles/search/findRollerByBehandlingId`,
                method: "GET",
                query: query,
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description get-rolle
         *
         * @tags rolle-entity-controller
         * @name GetItemResourceRolleGet
         * @request GET:/rolles/{id}
         * @secure
         */
        getItemResourceRolleGet: (id: string, params: RequestParams = {}) =>
            this.request<EntityModelRolle, void>({
                path: `/rolles/${id}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description update-rolle
         *
         * @tags rolle-entity-controller
         * @name PutItemResourceRollePut
         * @request PUT:/rolles/{id}
         * @secure
         */
        putItemResourceRollePut: (id: string, data: RolleRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelRolle, any>({
                path: `/rolles/${id}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-rolle
         *
         * @tags rolle-entity-controller
         * @name DeleteItemResourceRolleDelete
         * @request DELETE:/rolles/{id}
         * @secure
         */
        deleteItemResourceRolleDelete: (id: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/rolles/${id}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description patch-rolle
         *
         * @tags rolle-entity-controller
         * @name PatchItemResourceRollePatch
         * @request PATCH:/rolles/{id}
         * @secure
         */
        patchItemResourceRollePatch: (id: string, data: RolleRequestBody, params: RequestParams = {}) =>
            this.request<EntityModelRolle, any>({
                path: `/rolles/${id}`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description get-behandling-by-rolle-Id
         *
         * @tags rolle-property-reference-controller
         * @name FollowPropertyReferenceRolleGet1
         * @request GET:/rolles/{id}/behandling
         * @secure
         */
        followPropertyReferenceRolleGet1: (id: string, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, void>({
                path: `/rolles/${id}/behandling`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description update-behandling-by-rolle-Id
         *
         * @tags rolle-property-reference-controller
         * @name CreatePropertyReferenceRollePut
         * @request PUT:/rolles/{id}/behandling
         * @secure
         */
        createPropertyReferenceRollePut: (id: string, data: CollectionModelObject, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, any>({
                path: `/rolles/${id}/behandling`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-behandling-by-rolle-Id
         *
         * @tags rolle-property-reference-controller
         * @name DeletePropertyReferenceRolleDelete
         * @request DELETE:/rolles/{id}/behandling
         * @secure
         */
        deletePropertyReferenceRolleDelete: (id: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/rolles/${id}/behandling`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description patch-behandling-by-rolle-Id
         *
         * @tags rolle-property-reference-controller
         * @name CreatePropertyReferenceRollePatch
         * @request PATCH:/rolles/{id}/behandling
         * @secure
         */
        createPropertyReferenceRollePatch: (id: string, data: CollectionModelObject, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, any>({
                path: `/rolles/${id}/behandling`,
                method: "PATCH",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description get-behandling-by-rolle-Id
         *
         * @tags rolle-property-reference-controller
         * @name FollowPropertyReferenceRolleGet
         * @request GET:/rolles/{id}/behandling/{propertyId}
         * @secure
         */
        followPropertyReferenceRolleGet: (id: string, propertyId: string, params: RequestParams = {}) =>
            this.request<EntityModelBehandling, void>({
                path: `/rolles/${id}/behandling/${propertyId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description delete-behandling-by-rolle-Id
         *
         * @tags rolle-property-reference-controller
         * @name DeletePropertyReferenceIdRolleDelete
         * @request DELETE:/rolles/{id}/behandling/{propertyId}
         * @secure
         */
        deletePropertyReferenceIdRolleDelete: (id: string, propertyId: string, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/rolles/${id}/behandling/${propertyId}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),
    };
    api = {
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
         * @description Oppdatere behandling
         *
         * @tags behandling-controller
         * @name UpdateBehandling
         * @request PUT:/api/behandling/{behandlingId}
         * @secure
         */
        updateBehandling: (behandlingId: number, data: UpdateBehandlingRequest, params: RequestParams = {}) =>
            this.request<void, any>({
                path: `/api/behandling/${behandlingId}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

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
         * @description Sync fra behandling
         *
         * @tags behandling-controller
         * @name SyncRoller
         * @request PUT:/api/behandling/{behandlingId}/roller/sync
         * @secure
         */
        syncRoller: (behandlingId: number, data: SyncRollerRequest, params: RequestParams = {}) =>
            this.request<void, any>({
                path: `/api/behandling/${behandlingId}/roller/sync`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
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
         * @description Oppretter forsendelse for behandling eller vedtak. Skal bare benyttes hvis vedtakId eller behandlingId mangler for behandling (Søknad som behandles gjennom Bisys)
         *
         * @tags forsendelse-controller
         * @name OpprettForsendelse
         * @request POST:/api/forsendelse/init
         * @secure
         */
        opprettForsendelse: (data: InitalizeForsendelseRequest, params: RequestParams = {}) =>
            this.request<string[], any>({
                path: `/api/forsendelse/init`,
                method: "POST",
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
