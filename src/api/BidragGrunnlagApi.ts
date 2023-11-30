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

export interface HentSummertSkattegrunnlagRequest {
    inntektsAar: string;
    inntektsFilter: string;
    personId: string;
}

export interface HentSummertSkattegrunnlagResponse {
    grunnlag?: Skattegrunnlag[];
    svalbardGrunnlag?: Skattegrunnlag[];
    skatteoppgjoersdato?: string;
}

export interface Skattegrunnlag {
    beloep: string;
    tekniskNavn: string;
}

/** Liste over alle hentede forekomster av sivilstand fra bidrag-person */
export interface SivilstandPersonDto {
    type?: SivilstandskodePDL;
    /** @format date */
    gyldigFraOgMed?: string;
    /** @format date */
    bekreftelsesdato?: string;
    master?: string;
    /** @format date-time */
    registrert?: string;
    historisk?: boolean;
}

export interface SivilstandshistorikkDto {
    /** Liste over alle hentede forekomster av sivilstand fra bidrag-person */
    sivilstandDto: SivilstandPersonDto[];
}

export enum SivilstandskodePDL {
    GIFT = "GIFT",
    UGIFT = "UGIFT",
    UOPPGITT = "UOPPGITT",
    ENKE_ELLER_ENKEMANN = "ENKE_ELLER_ENKEMANN",
    SKILT = "SKILT",
    SEPARERT = "SEPARERT",
    REGISTRERT_PARTNER = "REGISTRERT_PARTNER",
    SEPARERT_PARTNER = "SEPARERT_PARTNER",
    SKILT_PARTNER = "SKILT_PARTNER",
    GJENLEVENDE_PARTNER = "GJENLEVENDE_PARTNER",
}

export interface EksternePerioderRequest {
    personIdent: string;
    /** @format date */
    fomDato: string;
    /** @format date */
    tomDato: string;
}

export interface EksternPeriodeMedBelop {
    personIdent: string;
    /** @format date */
    fomDato: string;
    /** @format date */
    tomDato: string;
    /** @format int32 */
    beløp: number;
    datakilde: string;
}

export interface EksternePerioderMedBelopResponse {
    perioder: EksternPeriodeMedBelop[];
}

export interface Ressurs {
    data: EksternePerioderMedBelopResponse;
}

export interface NavnFodselDodDto {
    /** Gir navn, fødselsdato og fødselsår for angitt person. Fødselsår finnes for alle i PDL, mens noen ikke har utfyllt fødselsdato */
    navn: string;
    /** @format date */
    fødselsdato?: string;
    /** @format int32 */
    fødselsår: number;
    /**
     * Eventuell dødsdato til personen
     * @format date
     */
    dødsdato?: string;
    /**
     * @deprecated
     * @format date
     */
    foedselsdato?: string;
    /**
     * @deprecated
     * @format int32
     */
    foedselsaar: number;
    /**
     * Eventuell dødsdato til personen
     * @deprecated
     * @format date
     */
    doedsdato?: string;
}

export interface BisysDto {
    /** @format date */
    fom: string;
    identer: string[];
}

export interface Barn {
    /** @format int32 */
    beløp: number;
    ident: string;
}

export interface BisysResponsDto {
    infotrygdPerioder: InfotrygdPeriode[];
    ksSakPerioder: KsSakPeriode[];
}

export interface InfotrygdPeriode {
    fomMåned: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    tomMåned?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** @format int32 */
    beløp: number;
    barna: string[];
}

export interface KsSakPeriode {
    fomMåned: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    tomMåned?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    barn: Barn;
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
    personId: string;
    navn: string;
    /** @format date */
    fødselsdato?: string;
    /** @format date */
    dødsdato?: string;
    /**
     * @deprecated
     * @format date
     */
    foedselsdato?: string;
    /**
     * @deprecated
     * @format date
     */
    doedsdato?: string;
}

export interface HusstandsmedlemmerDto {
    /** Periodiser liste over husstander og dens medlemmer i perioden */
    husstandListe: Husstand[];
}

/** Liste over alle hentede forekomster av foreldre-barnrelasjoner */
export interface ForelderBarnRelasjon {
    minRolleForPerson: "BARN" | "FAR" | "MEDMOR" | "MOR";
    relatertPersonsIdent?: string;
    /** Hvilken rolle personen i requesten har til personen i responsen */
    relatertPersonsRolle: "BARN" | "FAR" | "MEDMOR" | "MOR";
}

export interface ForelderBarnRelasjonDto {
    /** Liste over alle hentede forekomster av foreldre-barnrelasjoner */
    forelderBarnRelasjon: ForelderBarnRelasjon[];
}

export interface FamilieBaSakRequest {
    personIdent: string;
    /** @format date */
    fraDato: string;
}

export interface FamilieBaSakResponse {
    perioder: UtvidetBarnetrygdPeriode[];
}

export interface UtvidetBarnetrygdPeriode {
    stønadstype: "UTVIDET" | "SMÅBARNSTILLEGG";
    fomMåned: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    tomMåned?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** @format double */
    beløp: number;
    manueltBeregnet: boolean;
    deltBosted: boolean;
}

export interface HentEnhetsregisterRequest {
    organisasjonsnummer: string;
    gyldigDato?: string;
}

export interface Adresse {
    bruksperiode?: BruksperiodeEreg;
    gyldighetsperiode?: Gyldighetsperiode;
    adresselinje1?: string;
    adresselinje2?: string;
    adresselinje3?: string;
    postnummer?: string;
    poststed?: string;
    kommunenummer?: string;
    landkode?: string;
}

export interface BruksperiodeEreg {
    /** @format date-time */
    fom?: string;
    /** @format date-time */
    tom?: string;
}

export interface Gyldighetsperiode {
    /** @format date */
    fom?: string;
    /** @format date */
    tom?: string;
}

export interface HentEnhetsregisterResponse {
    organisasjonsnummer?: string;
    navn?: Navn;
    enhetstype?: string;
    adresse?: Adresse;
    opphoersdato?: string;
}

export interface Navn {
    bruksperiode?: BruksperiodeEreg;
    gyldighetsperiode?: Gyldighetsperiode;
    sammensattnavn?: string;
    navnelinje1?: string;
    navnelinje2?: string;
    navnelinje3?: string;
    navnelinje4?: string;
    navnelinje5?: string;
}

export interface BarnetilsynRequest {
    ident: string;
    /** @format date */
    fomDato: string;
}

export interface BarnetilsynBisysPerioder {
    periode: Periode;
    barnIdenter: string[];
}

export interface BarnetilsynResponse {
    barnetilsynBisysPerioder: BarnetilsynBisysPerioder[];
}

export interface Periode {
    /** @format date */
    fom: string;
    /** @format date */
    tom: string;
}

export interface HentBarnetilleggPensjonRequest {
    mottaker: string;
    /** @format date */
    fom: string;
    /** @format date */
    tom: string;
    returnerFellesbarn: boolean;
    returnerSaerkullsbarn: boolean;
}

export interface BarnetilleggPensjon {
    barn: string;
    beloep: number;
    /** @format date */
    fom: string;
    /** @format date */
    tom: string;
    erFellesbarn: boolean;
}

export interface HentArbeidsforholdRequest {
    arbeidstakerId: string;
    arbeidsforholdtypeFilter?: string;
    rapporteringsordningFilter?: string;
    arbeidsforholdstatusFilter?: string;
    historikk: boolean;
    sporingsinformasjon: boolean;
}

export interface Ansettelsesdetaljer {
    /** @format double */
    antallTimerPrUke?: number;
    arbeidstidsordning?: Kodeverksentitet;
    ansettelsesform?: Kodeverksentitet;
    /** @format double */
    avtaltStillingsprosent?: number;
    rapporteringsmaaneder?: Rapporteringsmaaneder;
    type?: string;
    yrke?: Kodeverksentitet;
    /** @format date */
    sisteStillingsprosentendring?: string;
    /** @format date */
    sisteLoennsendring?: string;
}

export interface Ansettelsesperiode {
    /** @format date */
    startdato?: string;
    /** @format date */
    sluttdato?: string;
}

export interface Arbeidsforhold {
    ansettelsesdetaljer?: Ansettelsesdetaljer[];
    ansettelsesperiode?: Ansettelsesperiode;
    arbeidssted?: Arbeidssted;
    arbeidstaker?: Arbeidstaker;
    bruksperiode?: Bruksperiode;
    /** @format int32 */
    navArbeidsforholdId?: number;
    id?: string;
    /** @format int32 */
    navVersjon?: number;
    opplysningspliktig?: Opplysningspliktig;
    opprettet?: string;
    rapporteringsordning?: Kodeverksentitet;
    sistBekreftet?: string;
    sistEndret?: string;
    type?: Kodeverksentitet;
    permisjoner?: Permisjon[];
    permitteringer?: Permittering[];
}

export interface ArbeidsgiverIdenter {
    gjeldende?: boolean;
    ident?: string;
    type?: string;
}

export interface Arbeidssted {
    identer?: Identer[];
    type?: string;
}

export interface Arbeidstaker {
    identer?: ArbeidsgiverIdenter[];
}

export interface Bruksperiode {
    fom?: string;
    tom?: string;
}

export interface IdHistorikk {
    id?: string;
    /** @format date */
    fom?: string;
    /** @format date */
    tom?: string;
}

export interface Identer {
    ident?: string;
    type?: string;
}

export interface Kodeverksentitet {
    beskrivelse?: string;
    kode?: string;
}

export interface Opplysningspliktig {
    identer?: Identer[];
    type?: string;
}

export interface Permisjon {
    /** @format date */
    startdato?: string;
    /** @format date */
    sluttdato?: string;
    id?: string;
    type?: Kodeverksentitet;
    /** @format double */
    prosent?: number;
    varsling?: Kodeverksentitet;
    idHistorikk?: IdHistorikk[];
    sporingsinformasjon?: Sporingsinformasjon;
}

export interface Permittering {
    /** @format date */
    startdato?: string;
    /** @format date */
    sluttdato?: string;
    id?: string;
    type?: Kodeverksentitet;
    /** @format double */
    prosent?: number;
    varsling?: Kodeverksentitet;
    idHistorikk?: IdHistorikk[];
    sporingsinformasjon?: Sporingsinformasjon;
}

export interface Rapporteringsmaaneder {
    fra?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    til?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
}

export interface Sporingsinformasjon {
    /** @format date-time */
    opprettetTidspunkt?: string;
    opprettetAv?: string;
    opprettetKilde?: string;
    opprettetKildereferanse?: string;
    /** @format date-time */
    endretTidspunkt?: string;
    endretAv?: string;
    endretKilde?: string;
    endretKildereferanse?: string;
}

export interface Aktoer {
    identifikator: string;
    aktoerType: string;
}

export interface HentInntektListeRequest {
    ident: Aktoer;
    maanedFom: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    maanedTom: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    ainntektsfilter: string;
    formaal: string;
}

export type AldersUfoereEtterlatteAvtalefestetOgKrigspensjon = TilleggsinformasjonDetaljer & {
    grunnpensjonbeloep?: number;
    heravEtterlattepensjon?: number;
    /** @format int32 */
    pensjonsgrad?: number;
    /** @format date */
    tidsromFom?: string;
    /** @format date */
    tidsromTom?: string;
    tilleggspensjonbeloep?: number;
    /** @format int32 */
    ufoeregradpensjonsgrad?: number;
};

export interface ArbeidsInntektInformasjon {
    arbeidsforholdListe?: ArbeidsforholdFrilanser[];
    inntektListe?: Inntekt[];
    forskuddstrekkListe?: Forskuddstrekk[];
    fradragListe?: Fradrag[];
}

export interface ArbeidsInntektMaaned {
    aarMaaned?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    avvikListe?: Avvik[];
    arbeidsInntektInformasjon?: ArbeidsInntektInformasjon;
}

export interface ArbeidsforholdFrilanser {
    /** @format double */
    antallTimerPerUkeSomEnFullStillingTilsvarer?: number;
    arbeidstidsordning?: string;
    avloenningstype?: string;
    /** @format date */
    sisteDatoForStillingsprosentendring?: string;
    /** @format date */
    sisteLoennsendring?: string;
    /** @format date */
    frilansPeriodeFom?: string;
    /** @format date */
    frilansPeriodeTom?: string;
    /** @format double */
    stillingsprosent?: number;
    yrke?: string;
    arbeidsforholdID?: string;
    arbeidsforholdIDnav?: string;
    arbeidsforholdstype?: string;
    arbeidsgiver?: Aktoer;
    arbeidstaker?: Aktoer;
}

export interface Avvik {
    ident?: Aktoer;
    opplysningspliktig?: Aktoer;
    virksomhet?: Aktoer;
    avvikPeriode?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    tekst?: string;
}

export type BarnepensjonOgUnderholdsbidrag = TilleggsinformasjonDetaljer & {
    forsoergersFoedselnummer?: string;
    /** @format date */
    tidsromFom?: string;
    /** @format date */
    tidsromTom?: string;
};

export type BonusFraForsvaret = TilleggsinformasjonDetaljer & {
    aaretUtbetalingenGjelderFor?: {
        /** @format int32 */
        value?: number;
        leap?: boolean;
    };
};

export type Etterbetalingsperiode = TilleggsinformasjonDetaljer & {
    /** @format date */
    etterbetalingsperiodeFom?: string;
    /** @format date */
    etterbetalingsperiodeTom?: string;
};

export interface Forskuddstrekk {
    /** @format int32 */
    beloep?: number;
    beskrivelse?: string;
    /** @format date-time */
    leveringstidspunkt?: string;
    opplysningspliktig?: Aktoer;
    utbetaler?: Aktoer;
    forskuddstrekkGjelder?: Aktoer;
}

export interface Fradrag {
    beloep?: number;
    beskrivelse?: string;
    fradragsperiode?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** @format date-time */
    leveringstidspunkt?: string;
    inntektspliktig?: Aktoer;
    utbetaler?: Aktoer;
    fradragGjelder?: Aktoer;
}

export interface HentInntektListeResponse {
    arbeidsInntektMaaned?: ArbeidsInntektMaaned[];
    ident?: Aktoer;
}

export interface Inntekt {
    inntektType?: "LOENNSINNTEKT" | "NAERINGSINNTEKT" | "PENSJON_ELLER_TRYGD" | "YTELSE_FRA_OFFENTLIGE";
    arbeidsforholdREF?: string;
    beloep?: number;
    fordel?: string;
    inntektskilde?: string;
    inntektsperiodetype?: string;
    inntektsstatus?: string;
    leveringstidspunkt?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    opptjeningsland?: string;
    /** @format date */
    opptjeningsperiodeFom?: string;
    /** @format date */
    opptjeningsperiodeTom?: string;
    skattemessigBosattLand?: string;
    utbetaltIMaaned?: {
        /** @format int32 */
        year?: number;
        month?:
            | "JANUARY"
            | "FEBRUARY"
            | "MARCH"
            | "APRIL"
            | "MAY"
            | "JUNE"
            | "JULY"
            | "AUGUST"
            | "SEPTEMBER"
            | "OCTOBER"
            | "NOVEMBER"
            | "DECEMBER";
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    opplysningspliktig?: Aktoer;
    virksomhet?: Aktoer;
    tilleggsinformasjon?: Tilleggsinformasjon;
    inntektsmottaker?: Aktoer;
    inngaarIGrunnlagForTrekk?: boolean;
    utloeserArbeidsgiveravgift?: boolean;
    informasjonsstatus?: string;
    beskrivelse?: string;
    skatteOgAvgiftsregel?: string;
    /** @format int32 */
    antall?: number;
}

export type Inntjeningsforhold = TilleggsinformasjonDetaljer & {
    spesielleInntjeningsforhold?: string;
};

export type ReiseKostOgLosji = TilleggsinformasjonDetaljer & {
    persontype?: string;
};

export type Svalbardinntekt = TilleggsinformasjonDetaljer & {
    /** @format int32 */
    antallDager?: number;
    betaltTrygdeavgift?: number;
};

export interface Tilleggsinformasjon {
    kategori?: string;
    tilleggsinformasjonDetaljer?:
        | TilleggsinformasjonDetaljer
        | AldersUfoereEtterlatteAvtalefestetOgKrigspensjon
        | BarnepensjonOgUnderholdsbidrag
        | BonusFraForsvaret
        | Etterbetalingsperiode
        | Inntjeningsforhold
        | ReiseKostOgLosji
        | Svalbardinntekt;
}

export interface TilleggsinformasjonDetaljer {
    detaljerType: string;
}

/** Liste over hvilke typer grunnlag som skal hentes inn. På nivået under er personId og perioder angitt */
export interface GrunnlagRequestDto {
    /** Hvilken type grunnlag skal hentes */
    type: GrunnlagRequestType;
    /**
     * Angir personId som grunnlag skal hentes for
     * @pattern ^[0-9]{11}$
     */
    personId: string;
    /**
     * Første periode det skal hentes ut grunnlag for (på formatet YYYY-MM-DD)
     * @format date
     */
    periodeFra: string;
    /**
     * Grunnlag skal hentes TIL denne perioden, på formatet YYYY-MM-DD
     * @format date
     */
    periodeTil: string;
}

/** Hvilken type grunnlag skal hentes */
export enum GrunnlagRequestType {
    AINNTEKT = "AINNTEKT",
    SKATTEGRUNNLAG = "SKATTEGRUNNLAG",
    UTVIDETBARNETRYGDOGSMABARNSTILLEGG = "UTVIDET_BARNETRYGD_OG_SMÅBARNSTILLEGG",
    BARNETILLEGG = "BARNETILLEGG",
    HUSSTANDSMEDLEMMER_OG_EGNE_BARN = "HUSSTANDSMEDLEMMER_OG_EGNE_BARN",
    SIVILSTAND = "SIVILSTAND",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    BARNETILSYN = "BARNETILSYN",
    ARBEIDSFORHOLD = "ARBEIDSFORHOLD",
    OVERGANGSSTONAD = "OVERGANGSSTONAD",
}

export interface HentGrunnlagRequestDto {
    /** Liste over hvilke typer grunnlag som skal hentes inn. På nivået under er personId og perioder angitt */
    grunnlagRequestDtoListe: GrunnlagRequestDto[];
}

export interface ArbeidsforholdDto {
    /** Id til personen arbeidsforholdet gjelder */
    partPersonId: string;
    /**
     * Startdato for arbeidsforholdet
     * @format date
     */
    startdato?: string;
    /**
     * Eventuell sluttdato for arbeidsforholdet
     * @format date
     */
    sluttdato?: string;
    /** Navn på arbeidsgiver */
    arbeidsgiverNavn?: string;
    /** Arbeidsgivers organisasjonsnummer */
    arbeidsgiverOrgnummer?: string;
    /** Liste av ansettelsesdetaljer, med eventuell historikk */
    ansettelsesdetaljer?: Ansettelsesdetaljer[];
    /** Liste over registrerte permisjoner */
    permisjoner?: Permisjon[];
    /** Liste over registrerte permitteringer */
    permitteringer?: Permittering[];
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

export interface HentGrunnlagDto {
    arbeidsforholdListe: ArbeidsforholdDto[];
}

/** Request for å opprette ny grunnlagspakke, uten annet innhold */
export interface OpprettGrunnlagspakkeRequestDto {
    /** Til hvilket formål skal grunnlagspakken benyttes. BIDRAG, FORSKUDD eller SAERTILSKUDD */
    formaal: "FORSKUDD" | "BIDRAG" | "SÆRTILSKUDD";
    /** opprettet av */
    opprettetAv: string;
}

export interface OppdaterGrunnlagspakkeRequestDto {
    /**
     * Opplysningene som hentes er gyldige til (men ikke med) denne datoen (YYYY-MM-DD
     * @format date
     */
    gyldigTil?: string;
    /** Liste over hvilke typer grunnlag som skal hentes inn. På nivået under er personId og perioder angitt */
    grunnlagRequestDtoListe: GrunnlagRequestDto[];
}

/** Liste over grunnlagene som er hentet inn med person-id og status */
export interface OppdaterGrunnlagDto {
    /** Hvilken type grunnlag skal hentes */
    type: GrunnlagRequestType;
    /** Angir personId som grunnlag er hentet for */
    personId: string;
    /** Status for utført kall */
    status: "HENTET" | "IKKE_FUNNET" | "FEILET";
    /** Statusmelding for utført kall */
    statusMelding: string;
}

/** Respons ved oppdatering av  grunnlagspakke */
export interface OppdaterGrunnlagspakkeDto {
    /**
     * Grunnlagspakke-id
     * @format int32
     */
    grunnlagspakkeId: number;
    /** Liste over grunnlagene som er hentet inn med person-id og status */
    grunnlagTypeResponsListe: OppdaterGrunnlagDto[];
}

/** Periodisert liste over innhentede inntekter fra a-inntekt og underliggende poster */
export interface AinntektDto {
    /** Id til personen inntekten er rapportert for */
    personId: string;
    /**
     * Periode fra-dato
     * @format date
     */
    periodeFra: string;
    /**
     * Periode til-dato
     * @format date
     */
    periodeTil: string;
    /** Angir om en inntektsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt inntekten taes i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt inntekten ikke lenger er aktiv som grunnlag. Null betyr at inntekten er aktiv
     * @format date-time
     */
    brukTil?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
    /** Liste over poster for innhentede inntektsposter */
    ainntektspostListe: AinntektspostDto[];
}

/** Liste over poster for innhentede inntektsposter */
export interface AinntektspostDto {
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
    /** Id til de som rapporterer inn inntekten */
    opplysningspliktigId?: string;
    /** Id til virksomheten som rapporterer inn inntekten */
    virksomhetId?: string;
    /** Type inntekt, Lonnsinntekt, Naeringsinntekt, Pensjon eller trygd, Ytelse fra offentlig */
    inntektType: string;
    /** Type fordel, Kontantytelse, Naturalytelse, Utgiftsgodtgjorelse */
    fordelType?: string;
    /** Beskrivelse av inntekt */
    beskrivelse?: string;
    /** Belop */
    belop: number;
    /**
     * Fra-dato etterbetaling
     * @format date
     */
    etterbetalingsperiodeFra?: string;
    /**
     * Til-dato etterbetaling
     * @format date
     */
    etterbetalingsperiodeTil?: string;
}

/** Periodisert liste over innhentet barnetillegg */
export interface BarnetilleggDto {
    /** Id til personen barnetillegg er rapportert for */
    partPersonId: string;
    /** Id til barnet barnetillegget er rapportert for */
    barnPersonId: string;
    /** Type barnetillegg */
    barnetilleggType: string;
    /**
     * Periode fra- og med måned
     * @format date
     */
    periodeFra: string;
    /**
     * Periode til- og med måned
     * @format date
     */
    periodeTil?: string;
    /** Angir om en stønad er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt stønaden taes i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt stønaden ikke lenger er aktiv som grunnlag. Null betyr at stønaden er aktiv
     * @format date-time
     */
    brukTil?: string;
    /** Bruttobeløp */
    belopBrutto: number;
    /** Angir om barnet er felles- eller særkullsbarn */
    barnType: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

/** Periodisert liste over innhentet barnetilsyn */
export interface BarnetilsynDto {
    /** Id til personen som mottar barnetilsynet */
    partPersonId: string;
    /** Id til barnet barnetilsynet er for */
    barnPersonId: string;
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
    /** Angir om en stønadsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt stønadsopplysningen tas i bruk som grunnlag
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt stønadsopplysning ikke lenger aktiv som grunnlag. Null betyr at stønadsopplysningen er aktiv
     * @format date-time
     */
    brukTil?: string;
    /**
     * Beløpet barnetilsynet er på
     * @format int32
     */
    belop?: number;
    /** Angir om barnetilsynet er heltid eller deltid */
    tilsynstype?: "HELTID" | "DELTID" | "IKKE_ANGITT";
    /** Angir om barnet er over eller under skolealder */
    skolealder?: "OVER" | "UNDER" | "IKKE_ANGITT";
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

/** Liste over perioder personen bor i samme husstand som BM/BP */
export interface BorISammeHusstandDto {
    /**
     * Personen bor i samme husstand som BM/BP fra- og med måned
     * @format date
     */
    periodeFra?: string;
    /**
     * Personen bor i samme husstand som BM/BP til- og med måned
     * @format date
     */
    periodeTil?: string;
}

export interface HentGrunnlagspakkeDto {
    /**
     * grunnlagspakke-id
     * @format int32
     */
    grunnlagspakkeId: number;
    /** Periodisert liste over innhentede inntekter fra a-inntekt og underliggende poster */
    ainntektListe: AinntektDto[];
    /** Periodisert liste over innhentede fra skatt og underliggende poster */
    skattegrunnlagListe: SkattegrunnlagDto[];
    /** Periodisert liste over innhentet utvidet barnetrygd og småbarnstillegg */
    ubstListe: UtvidetBarnetrygdOgSmaabarnstilleggDto[];
    /** Periodisert liste over innhentet barnetillegg */
    barnetilleggListe: BarnetilleggDto[];
    /** Periodisert liste over innhentet kontantstøtte */
    kontantstotteListe: KontantstotteDto[];
    /** Liste over alle personer som har bodd sammen med BM/BP i perioden fra virkningstidspunkt og fremover med en liste over hvilke perioder de har delt bolig. Listen inkluderer i tillegg personens egne barn, selv om de ikke har delt bolig med BM/BP */
    husstandmedlemmerOgEgneBarnListe: RelatertPersonDto[];
    /** Periodisert liste over en persons sivilstand */
    sivilstandListe: SivilstandDto[];
    /** Periodisert liste over innhentet barnetilsyn */
    barnetilsynListe: BarnetilsynDto[];
    overgangsstonadListe: OvergangsstonadDto[];
}

/** Periodisert liste over innhentet kontantstøtte */
export interface KontantstotteDto {
    /** Id til personen som mottar kontantstøtten */
    partPersonId: string;
    /** Id til barnet kontantstøtten mottas for */
    barnPersonId: string;
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
    /** Angir om en inntektsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt inntekten tas i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt inntekten ikke lenger er aktiv som grunnlag. Null betyr at inntekten er aktiv
     * @format date-time
     */
    brukTil?: string;
    /**
     * Beløpet kontantstøtten er på
     * @format int32
     */
    belop: number;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

export interface OvergangsstonadDto {
    /** Id til personen som mottar overgangsstønaden */
    partPersonId: string;
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
    /** Angir om en inntektsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt inntekten tas i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt inntekten ikke lenger aktiv som grunnlag. Null betyr at inntekten er aktiv
     * @format date-time
     */
    brukTil?: string;
    /**
     * Beløp overgangsstønad
     * @format int32
     */
    belop: number;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

/** Liste over alle personer som har bodd sammen med BM/BP i perioden fra virkningstidspunkt og fremover med en liste over hvilke perioder de har delt bolig. Listen inkluderer i tillegg personens egne barn, selv om de ikke har delt bolig med BM/BP */
export interface RelatertPersonDto {
    /** Personid til BM/BP */
    partPersonId?: string;
    /** Personid til relatert person. Dette er husstandsmedlem eller barn av BM/BP */
    relatertPersonPersonId?: string;
    /** Navn på den relaterte personen, format <Fornavn, mellomnavn, Etternavn */
    navn?: string;
    /**
     * Den relaterte personens fødselsdato
     * @format date
     */
    fodselsdato?: string;
    /** Angir om den relaterte personen er barn av BM/BP */
    erBarnAvBmBp: boolean;
    /** Angir om en grunnlagsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt grunnlaget tas i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt grunnlaget ikke lenger er aktivt. Null betyr at grunnlaget er aktivt
     * @format date-time
     */
    brukTil?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
    /** Liste over perioder personen bor i samme husstand som BM/BP */
    borISammeHusstandDtoListe: BorISammeHusstandDto[];
}

/** Periodisert liste over en persons sivilstand */
export interface SivilstandDto {
    /** Id til personen sivilstanden er rapportert for */
    personId?: string;
    /**
     * Sivilstand gjelder fra- og med måned
     * @format date
     */
    periodeFra?: string;
    /**
     * Sivilstand gjelder til- og med måned
     * @format date
     */
    periodeTil?: string;
    sivilstand: SivilstandskodePDL;
    /** Angir om en grunnlagsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt grunnlaget tas i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt grunnlaget ikke lenger er aktivt. Null betyr at grunnlaget er aktivt
     * @format date-time
     */
    brukTil?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

/** Periodisert liste over innhentede fra skatt og underliggende poster */
export interface SkattegrunnlagDto {
    /** Id til personen inntekten er rapportert for */
    personId: string;
    /**
     * Periode fra
     * @format date
     */
    periodeFra: string;
    /**
     * Periode frem til
     * @format date
     */
    periodeTil: string;
    /** Angir om en inntektsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt inntekten taes i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt inntekten ikke lenger er aktiv som grunnlag. Null betyr at inntekten er aktiv
     * @format date-time
     */
    brukTil?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
    /** Liste over poster med skattegrunnlag */
    skattegrunnlagListe: SkattegrunnlagspostDto[];
}

/** Liste over poster med skattegrunnlag */
export interface SkattegrunnlagspostDto {
    /** Type skattegrunnlag, ordinær eller Svalbard */
    skattegrunnlagType: string;
    /** Type inntekt, Lonnsinntekt, Naeringsinntekt, Pensjon eller trygd, Ytelse fra offentlig */
    inntektType: string;
    /** Belop */
    belop: number;
}

/** Periodisert liste over innhentet utvidet barnetrygd og småbarnstillegg */
export interface UtvidetBarnetrygdOgSmaabarnstilleggDto {
    /** Id til personen ubst er rapportert for */
    personId: string;
    /** Type stønad, utvidet barnetrygd eller småbarnstillegg */
    type: string;
    /**
     * Periode fra- og med måned
     * @format date
     */
    periodeFra: string;
    /**
     * Periode til- og med måned
     * @format date
     */
    periodeTil?: string;
    /** Angir om en stønad er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt inntekten taes i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt inntekten ikke lenger er aktiv som grunnlag. Null betyr at inntekten er aktiv
     * @format date-time
     */
    brukTil?: string;
    /** Beløp */
    belop: number;
    /** Angir om stønaden er manuelt beregnet */
    manueltBeregnet: boolean;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
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
            baseURL: axiosConfig.baseURL || "https://bidrag-grunnlag.intern.dev.nav.no",
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
 * @title bidrag-grunnlag
 * @version v1
 * @baseUrl https://bidrag-grunnlag.intern.dev.nav.no
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    integrasjoner = {
        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentSkattegrunnlag
         * @summary Henter skattegrunnlag
         * @request POST:/integrasjoner/skattegrunnlag
         * @secure
         */
        hentSkattegrunnlag: (data: HentSummertSkattegrunnlagRequest, params: RequestParams = {}) =>
            this.request<HentSummertSkattegrunnlagResponse, any>({
                path: `/integrasjoner/skattegrunnlag`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentSivilstand
         * @summary Kaller bidrag-person som igjen kaller PDL for å finne en persons sivilstand
         * @request POST:/integrasjoner/sivilstand
         * @secure
         */
        hentSivilstand: (data: string, params: RequestParams = {}) =>
            this.request<SivilstandshistorikkDto, any>({
                path: `/integrasjoner/sivilstand`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentOvergangsstonad
         * @summary Kaller familie-ef-sak og henter overgangsstønad
         * @request POST:/integrasjoner/overgangsstonad
         * @secure
         */
        hentOvergangsstonad: (data: EksternePerioderRequest, params: RequestParams = {}) =>
            this.request<Ressurs, any>({
                path: `/integrasjoner/overgangsstonad`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentFoedselOgDoed
         * @summary Kaller bidrag-person som igjen henter info om fødselsdato og eventuell død fra PDL
         * @request POST:/integrasjoner/navnfoedseldoed
         * @secure
         */
        hentFoedselOgDoed: (data: string, params: RequestParams = {}) =>
            this.request<NavnFodselDodDto, any>({
                path: `/integrasjoner/navnfoedseldoed`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentKontantstotte
         * @summary Kaller familie-ks-sak for å hente kontantstotte
         * @request POST:/integrasjoner/kontantstotte
         * @secure
         */
        hentKontantstotte: (data: BisysDto, params: RequestParams = {}) =>
            this.request<BisysResponsDto, any>({
                path: `/integrasjoner/kontantstotte`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentHusstandsmedlemmer
         * @summary Kaller bidrag-person som igjen henter info om en persons bostedsadresser og personer som har bodd på samme adresse på samme tid fra PDL
         * @request POST:/integrasjoner/husstandsmedlemmer
         * @secure
         */
        hentHusstandsmedlemmer: (data: string, params: RequestParams = {}) =>
            this.request<HusstandsmedlemmerDto, any>({
                path: `/integrasjoner/husstandsmedlemmer`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentForelderbarnrelasjon
         * @summary Kaller bidrag-person som igjen henter forelderbarnrelasjoner for angitt person fra PDL
         * @request POST:/integrasjoner/forelderbarnrelasjon
         * @secure
         */
        hentForelderbarnrelasjon: (data: string, params: RequestParams = {}) =>
            this.request<ForelderBarnRelasjonDto, any>({
                path: `/integrasjoner/forelderbarnrelasjon`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentFamilieBaSak
         * @summary Henter utvidet barnetrygd og småbarnstillegg
         * @request POST:/integrasjoner/familiebasak
         * @secure
         */
        hentFamilieBaSak: (data: FamilieBaSakRequest, params: RequestParams = {}) =>
            this.request<FamilieBaSakResponse, any>({
                path: `/integrasjoner/familiebasak`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentEnhetsinfo
         * @summary Kaller Ereg og henter info fra enhetsregister
         * @request POST:/integrasjoner/enhetsinfo
         * @secure
         */
        hentEnhetsinfo: (data: HentEnhetsregisterRequest, params: RequestParams = {}) =>
            this.request<HentEnhetsregisterResponse, any>({
                path: `/integrasjoner/enhetsinfo`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentBarnetilsyn
         * @summary Kaller familie-ef-sak/hentPerioderBarnetilsyn for å hente barnetilsyn
         * @request POST:/integrasjoner/barnetilsyn
         * @secure
         */
        hentBarnetilsyn: (data: BarnetilsynRequest, params: RequestParams = {}) =>
            this.request<BarnetilsynResponse, any>({
                path: `/integrasjoner/barnetilsyn`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentBarnetilleggPensjon
         * @summary Henter barnetillegg fra pensjon
         * @request POST:/integrasjoner/barnetillegg
         * @secure
         */
        hentBarnetilleggPensjon: (data: HentBarnetilleggPensjonRequest, params: RequestParams = {}) =>
            this.request<BarnetilleggPensjon[], any>({
                path: `/integrasjoner/barnetillegg`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentArbeidsforhold
         * @summary Kaller Aareg og henter arbeidsforhold
         * @request POST:/integrasjoner/arbeidsforhold
         * @secure
         */
        hentArbeidsforhold: (data: HentArbeidsforholdRequest, params: RequestParams = {}) =>
            this.request<Arbeidsforhold[], any>({
                path: `/integrasjoner/arbeidsforhold`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentAinntekt
         * @summary Henter A-inntekt
         * @request POST:/integrasjoner/ainntekt
         * @secure
         */
        hentAinntekt: (data: HentInntektListeRequest, params: RequestParams = {}) =>
            this.request<HentInntektListeResponse, any>({
                path: `/integrasjoner/ainntekt`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags integrasjons-controller
         * @name HentAinntektAbonnement
         * @summary Henter A-inntekt med abonnement
         * @request POST:/integrasjoner/ainntekt/abonnement
         * @secure
         */
        hentAinntektAbonnement: (data: HentInntektListeRequest, params: RequestParams = {}) =>
            this.request<HentInntektListeResponse, any>({
                path: `/integrasjoner/ainntekt/abonnement`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    hentgrunnlag = {
        /**
         * No description
         *
         * @tags grunnlag-controller
         * @name HentGrunnlag
         * @summary Trigger innhenting av grunnlag for personer angitt i requesten
         * @request POST:/hentgrunnlag
         * @secure
         */
        hentGrunnlag: (data: HentGrunnlagRequestDto, params: RequestParams = {}) =>
            this.request<HentGrunnlagDto, HentGrunnlagDto>({
                path: `/hentgrunnlag`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),
    };
    grunnlagspakke = {
        /**
         * No description
         *
         * @tags grunnlag-controller
         * @name OpprettNyGrunnlagspakke
         * @summary Oppretter grunnlagspakke
         * @request POST:/grunnlagspakke
         * @secure
         */
        opprettNyGrunnlagspakke: (data: OpprettGrunnlagspakkeRequestDto, params: RequestParams = {}) =>
            this.request<number, number>({
                path: `/grunnlagspakke`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags grunnlag-controller
         * @name OppdaterGrunnlagspakke
         * @summary Trigger innhenting av grunnlag for grunnlagspakke
         * @request POST:/grunnlagspakke/{grunnlagspakkeId}/oppdater
         * @secure
         */
        oppdaterGrunnlagspakke: (
            grunnlagspakkeId: number,
            data: OppdaterGrunnlagspakkeRequestDto,
            params: RequestParams = {}
        ) =>
            this.request<OppdaterGrunnlagspakkeDto, OppdaterGrunnlagspakkeDto>({
                path: `/grunnlagspakke/${grunnlagspakkeId}/oppdater`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags grunnlag-controller
         * @name LukkGrunnlagspakke
         * @summary Setter gyldigTil-dato = dagens dato for angitt grunnlagspakke
         * @request POST:/grunnlagspakke/{grunnlagspakkeId}/lukk
         * @secure
         */
        lukkGrunnlagspakke: (grunnlagspakkeId: number, params: RequestParams = {}) =>
            this.request<number, number>({
                path: `/grunnlagspakke/${grunnlagspakkeId}/lukk`,
                method: "POST",
                secure: true,
                ...params,
            }),

        /**
         * No description
         *
         * @tags grunnlag-controller
         * @name HentGrunnlagspakke
         * @summary Finn alle data for en grunnlagspakke
         * @request GET:/grunnlagspakke/{grunnlagspakkeId}
         * @secure
         */
        hentGrunnlagspakke: (grunnlagspakkeId: number, params: RequestParams = {}) =>
            this.request<HentGrunnlagspakkeDto, HentGrunnlagspakkeDto>({
                path: `/grunnlagspakke/${grunnlagspakkeId}`,
                method: "GET",
                secure: true,
                ...params,
            }),
    };
}
