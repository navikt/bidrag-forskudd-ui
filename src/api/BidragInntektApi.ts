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

/** Periodisert liste over inntekter fra Ainntekt */
export interface Ainntektspost {
    /** Perioden innteksposten er utbetalt YYYYMM */
    utbetalingsperiode?: string;
    /**
     * Fra-dato for opptjening
     * @format date
     */
    opptjeningsperiodeFra?: string;
    /**
     * Til-dato for opptjening
     * @format date
     */
    opptjeningsperiodeTil?: string;
    /** Beskrivelse av inntekt */
    beskrivelse?: string;
    /** Belop */
    belop: number;
}

/** Periodisert liste over overgangsstønad */
export interface Overgangsstonad {
    /**
     * Periode fra-dato
     * @format date
     */
    periodeFra: string;
    /**
     * Periode til-dato
     * @format date
     */
    periodeTil?: string;
    /**
     * Beløp overgangsstønad
     * @format int32
     */
    belop: number;
}

/** Periodisert liste over inntekter fra Sigrun */
export interface SkattegrunnlagForLigningsar {
    /**
     * Årstall skattegrunnlaget gjelder for
     * @format int32
     */
    ligningsår: number;
    /** Poster med skattegrunnlag */
    skattegrunnlagsposter: SkattegrunnlagspostDto[];
}

/** Poster med skattegrunnlag */
export interface SkattegrunnlagspostDto {
    /** Type skattegrunnlag, ordinær eller Svalbard */
    skattegrunnlagType: string;
    /** Type inntekt, Lonnsinntekt, Naeringsinntekt, Pensjon eller trygd, Ytelse fra offentlig */
    inntektType: string;
    /** Belop */
    belop: number;
}

export interface TransformerInntekterRequest {
    /** Periodisert liste over inntekter fra Ainntekt */
    ainntektsposter: Ainntektspost[];
    /** Periodisert liste over inntekter fra Sigrun */
    skattegrunnlagsliste: SkattegrunnlagForLigningsar[];
    /** Periodisert liste over overgangsstønad */
    overgangsstonadsliste: Overgangsstonad[];
}

/** Liste over inntektsposter (generisk, avhengig av type) som utgjør grunnlaget for summert inntekt */
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

/** Liste over summerte årsinntekter (Ainntekt + Sigrun ++) */
export interface SummertAarsinntekt {
    /**
     * Beskrivelse av inntekt
     * @example "AINNTEKT"
     */
    inntektBeskrivelse: SummertAarsinntektInntektBeskrivelse;
    /**
     * Visningsnavn for inntekt
     * @example "Lønn og trekk 2022"
     */
    visningsnavn: string;
    /**
     * Referanse
     * @example "Referanse"
     */
    referanse: string;
    /**
     * Summert inntekt for perioden, omgjort til årsinntekt
     * @example 600000
     */
    sumInntekt: number;
    /**
     * Periode (YYYYMM) som inntekten gjelder fra
     * @example "2023-01"
     */
    periodeFra: {
        /** @format int32 */
        year?: number;
        month?: SummertAarsinntektMonth;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /**
     * Periode (YYYYMM) som inntekten gjelder til
     * @example "2023-12"
     */
    periodeTil?: {
        /** @format int32 */
        year?: number;
        month?: Ainntektspost4;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** Liste over inntektsposter (generisk, avhengig av type) som utgjør grunnlaget for summert inntekt */
    inntektPostListe: InntektPost[];
}

/** Liste over summerte månedsinntekter (Ainntekt ++)) */
export interface SummertMaanedsinntekt {
    /**
     * Periode (YYYYMM)
     * @example "2023-01"
     */
    periode: {
        /** @format int32 */
        year?: number;
        month?: SummertMaanedsinntektMonth;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /**
     * Summert inntekt for måneden
     * @example 50000
     */
    sumInntekt: number;
    /** Liste over inntektsposter som utgjør grunnlaget for summert inntekt */
    inntektPostListe: InntektPost[];
}

export interface TransformerInntekterResponse {
    /**
     * Dato + commit hash
     * @example "20230705081501_68e71c7"
     */
    versjon: string;
    /** Liste over summerte månedsinntekter (Ainntekt ++)) */
    summertMaanedsinntektListe: SummertMaanedsinntekt[];
    /** Liste over summerte årsinntekter (Ainntekt + Sigrun ++) */
    summertAarsinntektListe: SummertAarsinntekt[];
}

export interface Beskrivelse {
    tekst: string;
    term: string;
}

export interface Betydning {
    /** @format date */
    gyldigFra: string;
    /** @format date */
    gyldigTil: string;
    beskrivelser: Record<string, Beskrivelse>;
}

export interface GetKodeverkKoderBetydningerResponse {
    betydninger: Record<string, Betydning[]>;
}

/**
 * Beskrivelse av inntekt
 * @example "AINNTEKT"
 */
export enum SummertAarsinntektInntektBeskrivelse {
    AINNTEKTBEREGNET3MND = "AINNTEKT_BEREGNET_3MND",
    AINNTEKTBEREGNET12MND = "AINNTEKT_BEREGNET_12MND",
    AINNTEKT = "AINNTEKT",
    LIGNINGSINNTEKT = "LIGNINGSINNTEKT",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    OVERGANGSSTONAD = "OVERGANGSSTØNAD",
    OVERGANGSSTONADBEREGNET3MND = "OVERGANGSSTØNAD_BEREGNET_3MND",
    OVERGANGSSTONADBEREGNET12MND = "OVERGANGSSTØNAD_BEREGNET_12MND",
}

export enum SummertAarsinntektMonth {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum Ainntektspost4 {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
}

export enum SummertMaanedsinntektMonth {
    JANUARY = "JANUARY",
    FEBRUARY = "FEBRUARY",
    MARCH = "MARCH",
    APRIL = "APRIL",
    MAY = "MAY",
    JUNE = "JUNE",
    JULY = "JULY",
    AUGUST = "AUGUST",
    SEPTEMBER = "SEPTEMBER",
    OCTOBER = "OCTOBER",
    NOVEMBER = "NOVEMBER",
    DECEMBER = "DECEMBER",
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
            baseURL: axiosConfig.baseURL || "https://bidrag-inntekt.intern.dev.nav.no",
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
 * @title bidrag-inntekt
 * @version v1
 * @baseUrl https://bidrag-inntekt.intern.dev.nav.no
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    transformer = {
        /**
         * No description
         *
         * @tags inntekt-controller
         * @name TransformerInntekter
         * @summary Transformerer inntekter
         * @request POST:/transformer
         * @secure
         */
        transformerInntekter: (data: TransformerInntekterRequest, params: RequestParams = {}) =>
            this.request<TransformerInntekterResponse, TransformerInntekterResponse>({
                path: `/transformer`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    integrasjoner = {
        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentKodeverk
         * @summary Kaller Felles Kodeverk og henter verdier
         * @request GET:/integrasjoner/kodeverk
         * @secure
         */
        hentKodeverk: (
            query: {
                kodeverk: string;
            },
            params: RequestParams = {}
        ) =>
            this.request<GetKodeverkKoderBetydningerResponse, any>({
                path: `/integrasjoner/kodeverk`,
                method: "GET",
                query: query,
                secure: true,
                ...params,
            }),
    };
}
