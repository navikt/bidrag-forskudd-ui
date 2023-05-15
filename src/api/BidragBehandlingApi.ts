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

export interface CustomFieldError {
    objectName: string;
    field: string;
    message: string;
}

export interface Error {
    /** @format int32 */
    status: number;
    message: string;
    fieldErrors: CustomFieldError[];
}

export enum AvslagType {
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

export interface BehandlingBarnDto {
    /** @format int64 */
    id?: number;
    medISaken: boolean;
    /** @uniqueItems true */
    perioder: BehandlingBarnPeriodeDto[];
    ident?: string;
    navn?: string;
    /** @format date */
    foedselsDato?: string;
}

export interface BehandlingBarnPeriodeDto {
    /** @format int64 */
    id?: number;
    /** @format date */
    fraDato: string;
    /** @format date */
    tilDato: string;
    boStatus: BoStatusType;
    kilde: string;
}

export enum BoStatusType {
    IKKE_REGISTRERT_PA_ADRESSE = "IKKE_REGISTRERT_PA_ADRESSE",
    DOKUMENTERT_SKOLEGANG = "DOKUMENTERT_SKOLEGANG",
    DOKUMENTERT_BOENDE_HOS_BM = "DOKUMENTERT_BOENDE_HOS_BM",
    BARN_BOR_ALENE = "BARN_BOR_ALENE",
}

export enum ForskuddBeregningKodeAarsakType {
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
}

export interface UpdateBehandlingRequest {
    /** @uniqueItems true */
    behandlingBarn?: BehandlingBarnDto[];
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
    avslag?: AvslagType;
    aarsak?: ForskuddBeregningKodeAarsakType;
    /** @format date */
    virkningsDato?: string;
}

export interface BehandlingDto {
    /** @format int64 */
    id: number;
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date */
    datoFom: string;
    /** @format date */
    datoTom: string;
    /** @format date */
    mottatDato: string;
    soknadFraType: SoknadFraType;
    saksnummer: string;
    behandlerEnhet: string;
    /** @uniqueItems true */
    roller: RolleDto[];
    /** @uniqueItems true */
    behandlingBarn: BehandlingBarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    /** @format date */
    virkningsDato?: string;
    aarsak?: ForskuddBeregningKodeAarsakType;
    avslag?: AvslagType;
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
}

export enum BehandlingType {
    FORSKUDD = "FORSKUDD",
}

export interface RolleDto {
    /** @format int64 */
    id: number;
    rolleType: RolleType;
    ident: string;
    /** @format date-time */
    opprettetDato: string;
}

export enum RolleType {
    BIDRAGS_PLIKTIG = "BIDRAGS_PLIKTIG",
    BIDRAGS_MOTTAKER = "BIDRAGS_MOTTAKER",
    BARN = "BARN",
    REELL_MOTTAKER = "REELL_MOTTAKER",
    FEILREGISTRERT = "FEILREGISTRERT",
}

export interface SivilstandDto {
    /** @format int64 */
    id?: number;
    /** @format date */
    gyldigFraOgMed: string;
    /** @format date */
    bekreftelsesdato: string;
    sivilstandType: SivilstandType;
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
    BARN18 = "BARN_18",
    TK = "TK",
    FTK = "FTK",
    FYLKESNEMDA = "FYLKESNEMDA",
    KONVERTERING = "KONVERTERING",
    BM = "BM",
    NORSKE_MYNDIGH = "NORSKE_MYNDIGH",
    BP = "BP",
    TI = "TI",
    UTENLANDSKE_MYNDIGH = "UTENLANDSKE_MYNDIGH",
    VERGE = "VERGE",
    KOMMUNE = "KOMMUNE",
}

export enum SoknadType {
    ENDRING = "ENDRING",
    EGET_TILTAK = "EGET_TILTAK",
    SOKNAD = "SOKNAD",
    INNKREVET_GRUNNLAG = "INNKREVET_GRUNNLAG",
    INDEKSREGULERING = "INDEKSREGULERING",
    KLAGE_BEGR_SATS = "KLAGE_BEGR_SATS",
    KLAGE = "KLAGE",
    FOLGER_KLAGE = "FOLGER_KLAGE",
    KORRIGERING = "KORRIGERING",
    KONVERTERING = "KONVERTERING",
    OPPHOR = "OPPHOR",
    PRIVAT_AVTALE = "PRIVAT_AVTALE",
    BEGR_REVURD = "BEGR_REVURD",
    REVURDERING = "REVURDERING",
    KONVERTERT = "KONVERTERT",
    MANEDLIG_PALOP = "MANEDLIG_PALOP",
}

export interface UpdateBehandlingSivilstandRequest {
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
}

export interface UpdateBehandlingSivilstandResponse {
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
}

export interface InntektDto {
    /** @format int64 */
    id?: number;
    taMed: boolean;
    beskrivelse: string;
    beløp: number;
    /** @format date */
    datoTom: string;
    /** @format date */
    datoFom: string;
    ident: string;
}

export interface UpdateBehandlingInntekterRequest {
    /** @uniqueItems true */
    inntekter: InntektDto[];
}

export interface UpdateBehandlingInntekterResponse {
    /** @uniqueItems true */
    inntekter: InntektDto[];
}

export interface UpdateBehandlingBarnRequest {
    /** @uniqueItems true */
    behandlingBarn: BehandlingBarnDto[];
}

export interface UpdateBehandlingRequestExtended {
    soknadType: SoknadType;
    soknadFraType: SoknadFraType;
    /** @format date */
    datoFom: string;
    /** @format date */
    mottatDato: string;
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
}

/** Rolle beskrivelse som er brukte til å opprette nye roller */
export interface CreateRolleDto {
    rolleType: RolleType;
    /** Fødselsdato */
    ident: string;
    /** @format date-time */
    opprettetDato: string;
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
    /** @format date */
    hentetDato: string;
}

export enum OpplysningerType {
    INNTEKTSOPPLYSNINGER = "INNTEKTSOPPLYSNINGER",
    BOFORHOLD = "BOFORHOLD",
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
    api = {
        /**
         * @description Henter en behandling
         *
         * @tags behandling-controller
         * @name HentBehandling
         * @request GET:/api/behandling/{behandlingId}
         * @secure
         */
        hentBehandling: (behandlingId: number, params: RequestParams = {}) =>
            this.request<BehandlingDto, Error | BehandlingDto>({
                path: `/api/behandling/${behandlingId}`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * @description Oppdaterer en behandling
         *
         * @tags behandling-controller
         * @name OppdaterBehandling
         * @request PUT:/api/behandling/{behandlingId}
         * @secure
         */
        oppdaterBehandling: (behandlingId: number, data: UpdateBehandlingRequest, params: RequestParams = {}) =>
            this.request<BehandlingDto, Error | BehandlingDto>({
                path: `/api/behandling/${behandlingId}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Oppdaterer en behandling inntekter
         *
         * @tags sivilstand-controller
         * @name OppdaterSivilstand
         * @request PUT:/api/behandling/{behandlingId}/sivilstand
         * @secure
         */
        oppdaterSivilstand: (
            behandlingId: number,
            data: UpdateBehandlingSivilstandRequest,
            params: RequestParams = {}
        ) =>
            this.request<UpdateBehandlingSivilstandResponse, Error | UpdateBehandlingSivilstandResponse>({
                path: `/api/behandling/${behandlingId}/sivilstand`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Oppdaterer en behandling inntekter
         *
         * @tags inntekter-controller
         * @name OppdaterInntekter
         * @request PUT:/api/behandling/{behandlingId}/inntekter
         * @secure
         */
        oppdaterInntekter: (behandlingId: number, data: UpdateBehandlingInntekterRequest, params: RequestParams = {}) =>
            this.request<UpdateBehandlingInntekterResponse, Error | UpdateBehandlingInntekterResponse>({
                path: `/api/behandling/${behandlingId}/inntekter`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Oppdaterer en behandling barn
         *
         * @tags behandling-barn-perioder-controller
         * @name OppdaterBehandlingBarn
         * @request PUT:/api/behandling/{behandlingId}/barn
         * @secure
         */
        oppdaterBehandlingBarn: (behandlingId: number, data: UpdateBehandlingBarnRequest, params: RequestParams = {}) =>
            this.request<BehandlingBarnDto[], Error | BehandlingBarnDto[]>({
                path: `/api/behandling/${behandlingId}/barn`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Oppdaterer en behandling
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
            this.request<BehandlingDto, Error | BehandlingDto>({
                path: `/api/behandling/ext/${behandlingId}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Henter en behandlinger
         *
         * @tags behandling-controller
         * @name HentBehandlinger
         * @request GET:/api/behandling
         * @secure
         */
        hentBehandlinger: (params: RequestParams = {}) =>
            this.request<BehandlingDto[], Error | BehandlingDto[]>({
                path: `/api/behandling`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * @description Legger til en ny behandling
         *
         * @tags behandling-controller
         * @name CreateBehandling
         * @request POST:/api/behandling
         * @secure
         */
        createBehandling: (data: CreateBehandlingRequest, params: RequestParams = {}) =>
            this.request<CreateBehandlingResponse, Error | CreateBehandlingResponse>({
                path: `/api/behandling`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Legger til nye opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name AddOpplysningerData
         * @request POST:/api/behandling/{behandlingId}/opplysninger
         * @secure
         */
        addOpplysningerData: (behandlingId: string, data: AddOpplysningerRequest, params: RequestParams = {}) =>
            this.request<OpplysningerDto, Error | OpplysningerDto>({
                path: `/api/behandling/${behandlingId}/opplysninger`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Henter aktive opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name HentAktiv
         * @request GET:/api/behandling/{behandlingId}/opplysninger/{opplysningerType}/aktiv
         * @secure
         */
        hentAktiv: (behandlingId: number, opplysningerType: OpplysningerType, params: RequestParams = {}) =>
            this.request<any, Error | OpplysningerDto>({
                path: `/api/behandling/${behandlingId}/opplysninger/${opplysningerType}/aktiv`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
}
