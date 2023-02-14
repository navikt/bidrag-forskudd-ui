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

export interface PersonRequest {
    /** Identen til personen @Deprecated */
    ident?: string;
    /** Identen til personen */
    verdi: string;
}

/** Liste over alle hentede forekomster av sivilstand */
export interface Sivilstand {
    type?: string;
    /** @format date */
    gyldigFraOgMed?: string;
    /** @format date */
    bekreftelsesdato?: string;
}

export interface SivilstandDto {
    /** Liste over alle hentede forekomster av sivilstand */
    sivilstand?: Sivilstand[];
}

export interface NavnFoedselDoedDto {
    /** Gir navn, fødselsdato og fødselsår for angitt person. Fødselsår finnes for alle i PDL, mens noen ikke har utfyllt fødselsdato */
    navn?: string;
    /** @format date */
    foedselsdato?: string;
    /** @format int32 */
    foedselsaar: number;
    /**
     * Eventuell dødsdato til personen
     * @format date
     */
    doedsdato?: string;
}

/** Familieenheter til personen */
export interface MotpartBarnRelasjon {
    forelderrolleMotpart: "BARN" | "FAR" | "MEDMOR" | "MOR";
    motpart?: PersonDto;
    fellesBarn: PersonDto[];
}

export interface MotpartBarnRelasjonDto {
    person: PersonDto;
    /** Familieenheter til personen */
    personensMotpartBarnRelasjon: MotpartBarnRelasjon[];
}

export interface PersonDto {
    /** Identen til personen */
    ident: string;
    /** Navn til personen, format <Etternavn, Fornavn Middelnavn> */
    navn?: string;
    /** Fornavn til personen */
    fornavn?: string;
    /** Mellomnavn til personen */
    mellomnavn?: string;
    /** Etternavn til personen */
    etternavn?: string;
    /** Kjønn til personen */
    kjoenn?: "KVINNE" | "MANN" | "UKJENT";
    /**
     * Dødsdato til personen
     * @format date
     */
    doedsdato?: string;
    /**
     * Fødselsdato til personen
     * @format date
     */
    foedselsdato?: string;
    /** Diskresjonskode (personvern) */
    diskresjonskode?: string;
    /** Aktør id til personen */
    aktoerId?: string;
    /**
     * Kortnavn på personen, navn som benyttes ved maskinelle utskrifter (maks 40 tegn)
     * @deprecated
     */
    kortNavn?: string;
    /** Kortnavn på personen, navn som benyttes ved maskinelle utskrifter (maks 40 tegn) */
    kortnavn?: string;
}

/** Periodiser liste over husstander og dens medlemmer i perioden */
export interface Husstand {
    /** @format date */
    gyldigFraOgMed?: string;
    /** @format date */
    gyldigTilOgMed?: string;
    adressenavn?: string;
    husnummer?: string;
    husbokstav?: string;
    bruksenhetsnummer?: string;
    postnummer?: string;
    bydelsnummer?: string;
    kommunenummer?: string;
    /** @format int64 */
    matrikkelId?: number;
    husstandsmedlemListe: Husstandsmedlem[];
}

export interface Husstandsmedlem {
    /** @format date */
    gyldigFraOgMed?: string;
    /** @format date */
    gyldigTilOgMed?: string;
    personId?: string;
    fornavn?: string;
    mellomnavn?: string;
    etternavn?: string;
    /** @format date */
    foedselsdato?: string;
    /** @format date */
    doedsdato?: string;
}

export interface HusstandsmedlemmerDto {
    /** Periodiser liste over husstander og dens medlemmer i perioden */
    husstandListe?: Husstand[];
}

export interface PersonIdent {
    verdi: string;
    erDNummer: boolean;
    erNAVSyntetisk: boolean;
    erSkattSyntetisk: boolean;
    /** @format date */
    fødselsdato: string;
}

export interface Graderingsinfo {
    /** Map med ident til gradering. */
    identerTilGradering: Record<string, "STRENGT_FORTROLIG" | "FORTROLIG" | "STRENGT_FORTROLIG_UTLAND" | "UGRADERT">;
    /** Hvor vidt hovedident fra GraderingQuery er skjerment. */
    identerTilSkjerming: Record<string, boolean>;
}

export interface Fodselsdatoer {
    /** Map med ident til fødselsdato-elementer. */
    identerTilDatoer: Record<string, string>;
}

export interface GeografiskTilknytningDto {
    /** Identen til personen */
    ident: string;
    /** Aktørid til personen */
    aktoerId?: string;
    /** Geografisk tilknytning til personen */
    geografiskTilknytning?: string;
    /** Om geografisk tilknytning til personen er utlandet. Geografisktilknytning feltet vil da ha landkode istedenfor kommune/bydel nummer */
    erUtland: boolean;
    /** Diskresjonskode (personvern) */
    diskresjonskode?: string;
}

/** Liste over alle hentede forekomster av foreldre-barnrelasjoner */
export interface ForelderBarnRelasjon {
    minRolleForPerson: "BARN" | "FAR" | "MEDMOR" | "MOR";
    relatertPersonsIdent?: string;
    relatertPersonsRolle: "BARN" | "FAR" | "MEDMOR" | "MOR";
}

export interface ForelderBarnRelasjonDto {
    /** Liste over alle hentede forekomster av foreldre-barnrelasjoner */
    forelderBarnRelasjon?: ForelderBarnRelasjon[];
}

export interface PersonAdresseDto {
    /** Gyldige adressetyper: BOSTEDSADRESSE, KONTAKTADRESSE, eller OPPHOLDSADRESSE */
    adressetype: "BOSTEDSADRESSE" | "KONTAKTADRESSE" | "OPPHOLDSADRESSE" | "DELT_BOSTED";
    /** Adresselinje 1 */
    adresselinje1?: string;
    /** Adresselinje 2 */
    adresselinje2?: string;
    /** Adresselinje 3 */
    adresselinje3?: string;
    /** Bruksenhetsnummer */
    bruksenhetsnummer?: string;
    /** Postnummer, tilgjengelig hvis norsk adresse */
    postnummer?: string;
    /** Poststed, tilgjengelig hvis norsk adresse */
    poststed?: string;
    /** To-bokstavers landkode ihht iso3166-1 alfa-2 */
    land: string;
    /** Trebokstavs landkode ihht iso3166-1 alfa-3 */
    land3: string;
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
            baseURL: axiosConfig.baseURL || "https://bidrag-person-feature.dev.adeo.no/bidrag-person",
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
 * @title bidrag-person
 * @version v1
 * @baseUrl https://bidrag-person-feature.dev.adeo.no/bidrag-person
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    spraak = {
        /**
         * @description Henter personens språk fra Kontakt- og reservasjonsregisteret
         *
         * @tags person-controller
         * @name HentPersonSpraak
         * @request POST:/spraak
         * @secure
         */
        hentPersonSpraak: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<string, string>({
                path: `/spraak`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    sivilstand = {
        /**
         * @description Hent sivilstand for en person
         *
         * @tags person-controller-kt
         * @name HentSivilstand
         * @request POST:/sivilstand
         * @secure
         */
        hentSivilstand: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<SivilstandDto, any>({
                path: `/sivilstand`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent sivilstand for en person
         *
         * @tags person-controller-kt
         * @name GetSivilstand
         * @request GET:/sivilstand/{ident}
         * @deprecated
         * @secure
         */
        getSivilstand: (ident: string, params: RequestParams = {}) =>
            this.request<SivilstandDto, any>({
                path: `/sivilstand/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    navnfoedseldoed = {
        /**
         * @description Hent informasjon om en persons navn, fødselsdata og eventuell død
         *
         * @tags person-controller-kt
         * @name HentNavnFoedselDoed
         * @request POST:/navnfoedseldoed
         * @secure
         */
        hentNavnFoedselDoed: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<NavnFoedselDoedDto, any>({
                path: `/navnfoedseldoed`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent informasjon om en persons navn, fødselsdata og eventuell død
         *
         * @tags person-controller-kt
         * @name GetNavnFoedselDoed
         * @request GET:/navnfoedseldoed/{ident}
         * @deprecated
         * @secure
         */
        getNavnFoedselDoed: (ident: string, params: RequestParams = {}) =>
            this.request<NavnFoedselDoedDto, any>({
                path: `/navnfoedseldoed/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    motpartbarnrelasjon = {
        /**
         * @description Hent motpart-barn relasjon til en person
         *
         * @tags person-controller
         * @name GetPersonensMotpartBarnRelasjon
         * @request POST:/motpartbarnrelasjon
         * @secure
         */
        getPersonensMotpartBarnRelasjon: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<MotpartBarnRelasjonDto, MotpartBarnRelasjonDto>({
                path: `/motpartbarnrelasjon`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    informasjon = {
        /**
         * @description Hent informasjon om en person
         *
         * @tags person-controller
         * @name HentPerson1
         * @request GET:/informasjon
         * @deprecated
         * @secure
         */
        hentPerson1: (ident: string, params: RequestParams = {}) =>
            this.request<PersonDto, PersonDto>({
                path: `/informasjon`,
                method: "GET",
                secure: true,
                ...params,
            }),

        /**
         * @description Hent informasjon om en person
         *
         * @tags person-controller
         * @name HentPersonPost
         * @request POST:/informasjon
         * @secure
         */
        hentPersonPost: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<PersonDto, PersonDto>({
                path: `/informasjon`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent informasjon om en person
         *
         * @tags person-controller
         * @name HentPerson
         * @request GET:/informasjon/{ident}
         * @deprecated
         * @secure
         */
        hentPerson: (ident: string, params: RequestParams = {}) =>
            this.request<PersonDto, PersonDto>({
                path: `/informasjon/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    husstandsmedlemmer = {
        /**
         * @description Hent alle personer som bor i samme husstand som angitt person
         *
         * @tags person-controller-kt
         * @name HentHusstandsmedlemmer
         * @request POST:/husstandsmedlemmer
         * @secure
         */
        hentHusstandsmedlemmer: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<HusstandsmedlemmerDto, any>({
                path: `/husstandsmedlemmer`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent alle personer som bor i samme husstand som angitt person
         *
         * @tags person-controller-kt
         * @name GetHusstandsmedlemmer
         * @request GET:/husstandsmedlemmer/{ident}
         * @deprecated
         * @secure
         */
        getHusstandsmedlemmer: (ident: string, params: RequestParams = {}) =>
            this.request<HusstandsmedlemmerDto, any>({
                path: `/husstandsmedlemmer/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    hentGraderingsinfo = {
        /**
         * @description Hent graderingsinfo for en liste med personer
         *
         * @tags person-controller-kt
         * @name HentGraderingsinfo
         * @request POST:/hentGraderingsinfo
         * @secure
         */
        hentGraderingsinfo: (data: PersonIdent[], params: RequestParams = {}) =>
            this.request<Graderingsinfo, any>({
                path: `/hentGraderingsinfo`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    hentFodselsdatoer = {
        /**
         * @description Hent fødselsdatoer for en liste med personer
         *
         * @tags person-controller-kt
         * @name HentFodselsdatoerV2
         * @request POST:/hentFodselsdatoer
         * @secure
         */
        hentFodselsdatoerV2: (data: PersonIdent[], params: RequestParams = {}) =>
            this.request<Fodselsdatoer, any>({
                path: `/hentFodselsdatoer`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    graderingsinfo = {
        /**
         * @description Hent graderingsinfo for en liste med personer
         *
         * @tags person-controller-kt
         * @name HentGraderinger
         * @request POST:/graderingsinfo
         * @deprecated
         * @secure
         */
        hentGraderinger: (data: string[], params: RequestParams = {}) =>
            this.request<Graderingsinfo, any>({
                path: `/graderingsinfo`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    geografisktilknytning = {
        /**
         * @description Hent informasjon om geografisk tilknytning for en person
         *
         * @tags person-controller-kt
         * @name HentGeografiskTilknytning
         * @request POST:/geografisktilknytning
         * @secure
         */
        hentGeografiskTilknytning: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<GeografiskTilknytningDto, any>({
                path: `/geografisktilknytning`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent informasjon om geografisk tilknytning for en person
         *
         * @tags person-controller-kt
         * @name GetGeografiskTilknytning
         * @request GET:/geografisktilknytning/{ident}
         * @deprecated
         * @secure
         */
        getGeografiskTilknytning: (ident: string, params: RequestParams = {}) =>
            this.request<GeografiskTilknytningDto, any>({
                path: `/geografisktilknytning/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    forelderbarnrelasjon = {
        /**
         * @description Hent alle forelder/barn-relasjoner for en person
         *
         * @tags person-controller-kt
         * @name HentForelderBarnRelasjon
         * @request POST:/forelderbarnrelasjon
         * @secure
         */
        hentForelderBarnRelasjon: (data: PersonRequest, params: RequestParams = {}) =>
            this.request<ForelderBarnRelasjonDto, any>({
                path: `/forelderbarnrelasjon`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent alle forelder/barn-relasjoner for en person
         *
         * @tags person-controller-kt
         * @name GetForelderBarnRelasjon
         * @request GET:/forelderbarnrelasjon/{ident}
         * @deprecated
         * @secure
         */
        getForelderBarnRelasjon: (ident: string, params: RequestParams = {}) =>
            this.request<ForelderBarnRelasjonDto, any>({
                path: `/forelderbarnrelasjon/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
    fodselsdatoer = {
        /**
         * @description Hent fødselsdatoer for en liste med personer
         *
         * @tags person-controller-kt
         * @name HentFodselsdatoer
         * @request POST:/fodselsdatoer
         * @deprecated
         * @secure
         */
        hentFodselsdatoer: (data: string[], params: RequestParams = {}) =>
            this.request<Fodselsdatoer, any>({
                path: `/fodselsdatoer`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    adresse = {
        /**
         * @description Henter registrerte adresser for person
         *
         * @tags person-controller
         * @name HentPersonAdresser
         * @request POST:/adresse
         * @secure
         */
        hentPersonAdresser: (
            query: {
                personident: any;
                /**
                 * Settes til true for å hente postadresse til person.
                 * @example true
                 */
                "hente-postadresse"?: any;
            },
            data: PersonRequest,
            params: RequestParams = {}
        ) =>
            this.request<PersonAdresseDto[], PersonAdresseDto[]>({
                path: `/adresse`,
                method: "POST",
                query: query,
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent postadresse for person
         *
         * @tags person-controller
         * @name HentPersonPostadresse
         * @request POST:/adresse/post
         * @secure
         */
        hentPersonPostadresse: (
            query: {
                personident: any;
            },
            data: PersonRequest,
            params: RequestParams = {}
        ) =>
            this.request<PersonAdresseDto, PersonAdresseDto>({
                path: `/adresse/post`,
                method: "POST",
                query: query,
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hent postadresse for person
         *
         * @tags person-controller
         * @name HentPersonAdresse
         * @request GET:/adresse/{ident}
         * @deprecated
         * @secure
         */
        hentPersonAdresse: (ident: string, params: RequestParams = {}) =>
            this.request<PersonAdresseDto, PersonAdresseDto>({
                path: `/adresse/${ident}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
}
