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

export enum BehandlingType {
    FORSKUDD = "FORSKUDD",
}

export interface CreateBehandlingRequest {
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    saksnummer: string;
    behandlerEnhet: string;
    /** @uniqueItems true */
    roller: CreateRolleDto[];
}

export interface CreateRolleDto {
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

export interface CreateBehandlingResponse {
    /** @format int64 */
    id: number;
}

export interface Behandling {
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    saksnummer: string;
    behandlerEnhet: string;
    /** @format date-time */
    virkningsDato?: string;
    aarsak?: ForskuddBeregningKodeAarsakType;
    avslag?: string;
    begrunnelseMedIVedtakNotat?: string;
    begrunnelseKunINotat?: string;
    /** @format int64 */
    id?: number;
    /** @uniqueItems true */
    roller: Rolle[];
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

export interface Rolle {
    behandling: Behandling;
    rolleType: RolleType;
    ident: string;
    /** @format date-time */
    opprettetDato: string;
    /** @format int64 */
    id?: number;
}

export interface BehandlingDto {
    /** @format int64 */
    id: number;
    behandlingType: BehandlingType;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    saksnummer: string;
    behandlerEnhet: string;
    /** @uniqueItems true */
    roller: RolleDto[];
    /** @format date-time */
    virkningsDato?: string;
    aarsak?: ForskuddBeregningKodeAarsakType;
    avslag?: string;
    begrunnelseMedIVedtakNotat?: string;
    begrunnelseKunINotat?: string;
}

export interface RolleDto {
    /** @format int64 */
    id: number;
    rolleType: RolleType;
    ident: string;
    /** @format date-time */
    opprettetDato: string;
    navn: string;
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
            baseURL: axiosConfig.baseURL || "https://bidrag-behandling-feature.dev.intern.nav.no",
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
 * @baseUrl https://bidrag-behandling-feature.dev.intern.nav.no
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    api = {
        /**
         * @description Henter en behandlinger
         *
         * @tags behandling-controller
         * @name HentBehandlinger
         * @request GET:/api/behandling
         * @secure
         */
        hentBehandlinger: (params: RequestParams = {}) =>
            this.request<Behandling[], Behandling[]>({
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
            this.request<CreateBehandlingResponse, CreateBehandlingResponse>({
                path: `/api/behandling`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Henter en behandling
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
                ...params,
            }),
    };
}
