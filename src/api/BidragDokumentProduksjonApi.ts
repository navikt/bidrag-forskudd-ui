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

export interface Arbeidsforhold {
    periode: TypeArManedsperiode;
    arbeidsgiver: string;
    stillingProsent: string;
    /** @format date */
    lønnsendringDato: string;
}

export interface Barnetillegg {
    status: string;
    periode: TypeArManedsperiode;
    beløp: number;
}

export interface Boforhold {
    barn: BoforholdBarn[];
    sivilstand: SivilstandPeriode[];
    notat: Notat;
}

export interface BoforholdBarn {
    navn: string;
    fødselsdato: string;
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteret[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregning[];
}

export interface Inntekter {
    inntekterPerRolle: InntekterPerRolle[];
    notat: Notat;
}

export interface InntekterPerRolle {
    rolle: Rolletype;
    arbeidsforhold: Arbeidsforhold[];
    inntekterSomLeggesTilGrunn: InntekterSomLeggesTilGrunn[];
    barnetillegg: Barnetillegg[];
    utvidetBarnetrygd: UtvidetBarnetrygd[];
}

export interface InntekterSomLeggesTilGrunn {
    beskrivelse: string;
    periode?: TypeArManedsperiode;
    beløp: number;
}

export interface Notat {
    medIVedtaket: string;
    intern: string;
}

export interface NotatDto {
    saksnummer: string;
    saksbehandlerNavn: string;
    virkningstidspunkt: Virkningstidspunkt;
    boforhold: Boforhold;
    parterIsøknad: ParterISoknad[];
    inntekter: Inntekter;
    vedtak: Vedtak[];
}

export interface OpplysningerBruktTilBeregning {
    periode: TypeArManedsperiode;
    status: string;
    kilde: string;
}

export interface OpplysningerFraFolkeregisteret {
    periode: TypeArManedsperiode;
    status: string;
}

export interface ParterISoknad {
    rolle: Rolletype;
    navn: string;
    /** @format date */
    fødselsdato: string;
    personident: string;
}

export interface Resultat {
    type: string;
    periode: TypeArManedsperiode;
    inntekt: number;
    sivilstand: string;
    /** @format int32 */
    antallBarn: number;
    resultat: string;
}

export enum Rolletype {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
}

export interface SivilstandPeriode {
    periode: TypeArManedsperiode;
    status: string;
    kode?: Sivilstandskode;
}

export enum Sivilstandskode {
    GIFT_SAMBOER = "GIFT_SAMBOER",
    BOR_ALENE_MED_BARN = "BOR_ALENE_MED_BARN",
    ENSLIG = "ENSLIG",
    SAMBOER = "SAMBOER",
}

export enum SoktAvType {
    BIDRAGSMOTTAKER = "BIDRAGSMOTTAKER",
    BIDRAGSPLIKTIG = "BIDRAGSPLIKTIG",
    BARN18AR = "BARN_18_ÅR",
    BM_I_ANNEN_SAK = "BM_I_ANNEN_SAK",
    NAV_BIDRAG = "NAV_BIDRAG",
    FYLKESNEMDA = "FYLKESNEMDA",
    NAV_INTERNASJONALT = "NAV_INTERNASJONALT",
    KOMMUNE = "KOMMUNE",
    NORSKE_MYNDIGHET = "NORSKE_MYNDIGHET",
    UTENLANDSKE_MYNDIGHET = "UTENLANDSKE_MYNDIGHET",
    VERGE = "VERGE",
    TRYGDEETATEN_INNKREVING = "TRYGDEETATEN_INNKREVING",
    KLAGE_ANKE = "KLAGE_ANKE",
    KONVERTERING = "KONVERTERING",
}

export interface UtvidetBarnetrygd {
    deltBosted: boolean;
    periode: TypeArManedsperiode;
    beløp: number;
}

export interface Vedtak {
    navn: string;
    /** @format date */
    fødselsdato: string;
    resultat: Resultat[];
}

export interface Virkningstidspunkt {
    søknadstype: string;
    søktAv: SoktAvType;
    /** @format date */
    mottattDato: string;
    /** @format date */
    søktFraDato: string;
    virkningstidspunkt: string;
    notat: Notat;
}

export interface TypeArManedsperiode {
    /**
     * @pattern YYYY-MM
     * @example "2023-01"
     */
    fom: string;
    /**
     * @pattern YYYY-MM
     * @example "2023-01"
     */
    til?: string;
}

export interface MediaType {
    type?: string;
    subtype?: string;
    parameters?: Record<string, string>;
    /** @format double */
    qualityValue?: number;
    wildcardType?: boolean;
    charset?: string;
    concrete?: boolean;
    subtypeSuffix?: string;
    wildcardSubtype?: boolean;
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
        this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://0.0.0.0:8580" });
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
 * @title bidrag-dokument-produksjon
 * @version v1
 * @baseUrl http://0.0.0.0:8580
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    api = {
        /**
         * No description
         *
         * @tags produser-notat-api
         * @name GeneratePdf
         * @request POST:/api/notat/pdf/{dokumentmal}
         */
        generatePdf: (dokumentmal: string, data: NotatDto, params: RequestParams = {}) =>
            this.request<object, any>({
                path: `/api/notat/pdf/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-notat-api
         * @name GenerateHtml
         * @request POST:/api/notat/html/{dokumentmal}
         */
        generateHtml: (dokumentmal: string, data: NotatDto, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/notat/html/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-pdf-controller
         * @name Image
         * @request POST:/api/genpdf/image
         */
        image: (data: object, params: RequestParams = {}) =>
            this.request<object, any>({
                path: `/api/genpdf/image`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-pdf-controller
         * @name Html
         * @request POST:/api/genpdf/html
         */
        html: (data: string, params: RequestParams = {}) =>
            this.request<object, any>({
                path: `/api/genpdf/html`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-html-controller
         * @name GenerateHtmlFromSample
         * @request GET:/api/genhtml/{category}/{dokumentmal}
         */
        generateHtmlFromSample: (
            category: string,
            dokumentmal: string,
            query: {
                payload: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<object, any>({
                path: `/api/genhtml/${category}/${dokumentmal}`,
                method: "GET",
                query: query,
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-html-controller
         * @name FromHtml
         * @request POST:/api/genhtml/{category}/{dokumentmal}
         */
        fromHtml: (category: string, dokumentmal: string, data: string, params: RequestParams = {}) =>
            this.request<object, any>({
                path: `/api/genhtml/${category}/${dokumentmal}`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-pdf-controller
         * @name GeneratePdfFromSample
         * @request GET:/api/genpdf/{category}/{dokumentmal}
         */
        generatePdfFromSample: (
            category: string,
            dokumentmal: string,
            query: {
                payload: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<object, any>({
                path: `/api/genpdf/${category}/${dokumentmal}`,
                method: "GET",
                query: query,
                ...params,
            }),
    };
}
