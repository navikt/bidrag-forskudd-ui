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
    /** Beløp */
    beløp: number;
}

/** Periodisert liste over kontantstøtte */
export interface Kontantstotte {
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
    /** Beløp kontantstøtte */
    beløp: number;
    /** Id til barnet kontantstøtten mottas for */
    barnPersonId: string;
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
    /**
     * Dato ainntektene er hentet i bidrag-grunnlag, kommer fra hentetTidspunkti responsen fra bidrag-grunnlag
     * @format date
     */
    ainntektHentetDato: string;
    /** Periodisert liste over inntekter fra Ainntekt */
    ainntektsposter: Ainntektspost[];
    /** Periodisert liste over inntekter fra Sigrun */
    skattegrunnlagsliste: SkattegrunnlagForLigningsar[];
    /** Periodisert liste over kontantstøtte */
    kontantstøtteliste: Kontantstotte[];
    /** Periodisert liste over utvidet barnetrygd og småbarnstillegg */
    utvidetBarnetrygdOgSmåbarnstilleggliste: UtvidetBarnetrygdOgSmabarnstillegg[];
}

/** Periodisert liste over utvidet barnetrygd og småbarnstillegg */
export interface UtvidetBarnetrygdOgSmabarnstillegg {
    /** Type stønad, utvidet barnetrygd eller småbarnstillegg */
    type: string;
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
    /** Beløp utvidet barnetrygd eller småbarnstillegg */
    beløp: number;
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

/**
 * Type inntektrapportering
 * @example "AINNTEKT"
 */
export enum Inntektsrapportering {
    AINNTEKT = "AINNTEKT",
    AINNTEKTBEREGNET3MND = "AINNTEKT_BEREGNET_3MND",
    AINNTEKTBEREGNET12MND = "AINNTEKT_BEREGNET_12MND",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    LIGNINGSINNTEKT = "LIGNINGSINNTEKT",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    PERSONINNTEKT_EGNE_OPPLYSNINGER = "PERSONINNTEKT_EGNE_OPPLYSNINGER",
    KAPITALINNTEKT_EGNE_OPPLYSNINGER = "KAPITALINNTEKT_EGNE_OPPLYSNINGER",
    SAKSBEHANDLER_BEREGNET_INNTEKT = "SAKSBEHANDLER_BEREGNET_INNTEKT",
    LONNMANUELTBEREGNET = "LØNN_MANUELT_BEREGNET",
    NAeRINGSINNTEKTMANUELTBEREGNET = "NÆRINGSINNTEKT_MANUELT_BEREGNET",
    YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET = "YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET",
    AAP = "AAP",
    AINNTEKT_KORRIGERT_BARNETILLEGG = "AINNTEKT_KORRIGERT_BARNETILLEGG",
    BARNETRYGD_MANUELL_VURDERING = "BARNETRYGD_MANUELL_VURDERING",
    BARNS_SYKDOM = "BARNS_SYKDOM",
    DAGPENGER = "DAGPENGER",
    DOKUMENTASJONMANGLERSKJONN = "DOKUMENTASJON_MANGLER_SKJØNN",
    FORDELSKATTEKLASSE2 = "FORDEL_SKATTEKLASSE2",
    FORDELSAeRFRADRAGENSLIGFORSORGER = "FORDEL_SÆRFRADRAG_ENSLIG_FORSØRGER",
    FODSELADOPSJON = "FØDSEL_ADOPSJON",
    INNTEKTSOPPLYSNINGER_ARBEIDSGIVER = "INNTEKTSOPPLYSNINGER_ARBEIDSGIVER",
    KAPITALINNTEKT_SKE = "KAPITALINNTEKT_SKE",
    LIGNINGSOPPLYSNINGER_MANGLER = "LIGNINGSOPPLYSNINGER_MANGLER",
    LIGNING_SKE = "LIGNING_SKE",
    LONNSKE = "LØNN_SKE",
    LONNSKEKORRIGERTBARNETILLEGG = "LØNN_SKE_KORRIGERT_BARNETILLEGG",
    LONNTREKK = "LØNN_TREKK",
    MANGLENDEBRUKEVNESKJONN = "MANGLENDE_BRUK_EVNE_SKJØNN",
    NETTO_KAPITALINNTEKT = "NETTO_KAPITALINNTEKT",
    OVERGANGSSTONAD = "OVERGANGSSTØNAD",
    PENSJON = "PENSJON",
    PENSJON_KORRIGERT_BARNETILLEGG = "PENSJON_KORRIGERT_BARNETILLEGG",
    REHABILITERINGSPENGER = "REHABILITERINGSPENGER",
    SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG = "SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG",
    SKATTEGRUNNLAG_SKE = "SKATTEGRUNNLAG_SKE",
    SYKEPENGER = "SYKEPENGER",
    FORELDREPENGER = "FORELDREPENGER",
    INTRODUKSJONSSTONAD = "INTRODUKSJONSSTØNAD",
    KVALIFISERINGSSTONAD = "KVALIFISERINGSSTØNAD",
}

/** Liste over summerte månedsinntekter (Ainntekt ++)) */
export interface SummertManedsinntekt {
    /**
     * Perioden inntekten gjelder for (format YYYY-MM)
     * @pattern YYYY-MM
     * @example "2023-01"
     */
    gjelderÅrMåned: string;
    /**
     * Summert inntekt for måneden
     * @example 50000
     */
    sumInntekt: number;
    /** Liste over inntektsposter som utgjør grunnlaget for summert inntekt */
    inntektPostListe: InntektPost[];
}

/** Liste over summerte årsinntekter (Ainntekt + Sigrun ++) */
export interface SummertArsinntekt {
    /** Type inntektrapportering */
    inntektRapportering: Inntektsrapportering;
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
    /** Perioden inntekten gjelder for (fom-til) */
    periode: TypeArManedsperiode;
    /**
     * Id til barnet kontantstøtten mottas for, brukes kun for kontantstøtte
     * @example "12345678910"
     */
    gjelderBarnPersonId: string;
    /** Liste over inntektsposter (generisk, avhengig av type) som utgjør grunnlaget for summert inntekt */
    inntektPostListe: InntektPost[];
}

export interface TransformerInntekterResponse {
    /**
     * Dato + commit hash
     * @example "20230705081501_68e71c7"
     */
    versjon: string;
    /** Liste over summerte månedsinntekter (Ainntekt ++)) */
    summertMånedsinntektListe: SummertManedsinntekt[];
    /** Liste over summerte årsinntekter (Ainntekt + Sigrun ++) */
    summertÅrsinntektListe: SummertArsinntekt[];
}

/** Perioden inntekten gjelder for (fom-til) */
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
}
