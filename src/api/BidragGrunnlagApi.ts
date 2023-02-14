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

export interface HentSkattegrunnlagRequest {
    inntektsAar: string;
    inntektsFilter: string;
    personId: string;
}

export interface HentSkattegrunnlagResponse {
    grunnlag?: Skattegrunnlag[];
    svalbardGrunnlag?: Skattegrunnlag[];
    skatteoppgjoersdato?: string;
}

export interface Skattegrunnlag {
    beloep: string;
    tekniskNavn: string;
}

export interface SivilstandRequest {
    personId: string;
    /** @format date */
    periodeFra: string;
}

export interface SivilstandResponse {
    type: string;
    /** @format date */
    gyldigFraOgMed?: string;
    /** @format date */
    bekreftelsesdato?: string;
}

export interface SivilstandResponseDto {
    sivilstand?: SivilstandResponse[];
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

export interface HusstandsmedlemmerRequest {
    personId: string;
    /** @format date */
    periodeFra: string;
}

export interface HusstandResponse {
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
    husstandsmedlemmerResponseListe: HusstandsmedlemmerResponse[];
}

export interface HusstandsmedlemmerResponse {
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

export interface HusstandsmedlemmerResponseDto {
    husstandResponseListe?: HusstandResponse[];
}

export interface NavnFoedselDoedResponseDto {
    navn?: string;
    /** @format date */
    foedselsdato?: string;
    /** @format int32 */
    foedselsaar: number;
    /** @format date */
    doedsdato?: string;
}

export interface ForelderBarnRequest {
    personId: string;
    /** @format date */
    periodeFra: string;
}

export interface ForelderBarnRelasjonResponse {
    relatertPersonsIdent: string;
    relatertPersonsRolle: "BARN" | "FAR" | "MEDMOR" | "MOR";
    minRolleForPerson?: "BARN" | "FAR" | "MEDMOR" | "MOR";
}

export interface ForelderBarnRelasjonResponseDto {
    forelderBarnRelasjonResponse?: ForelderBarnRelasjonResponse[];
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
    tom?: string;
    erFellesbarn: boolean;
}

export interface HentBarnetilleggPensjonResponse {
    barnetilleggPensjonListe?: BarnetilleggPensjon[];
}

export interface HentInntektRequest {
    ident: string;
    /** @format date */
    innsynHistoriskeInntekterDato?: string;
    maanedFom: string;
    maanedTom: string;
    ainntektsfilter: string;
    formaal: string;
}

export interface Aktoer {
    identifikator?: string;
    aktoerType?: "AKTOER_ID" | "NATURLIG_IDENT" | "ORGANISASJON";
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

/** Request for å opprette ny grunnlagspakke, uten annet innhold */
export interface OpprettGrunnlagspakkeRequestDto {
    /** Til hvilket formål skal grunnlagspakken benyttes. BIDRAG, FORSKUDD eller SAERTILSKUDD */
    formaal: "FORSKUDD" | "BIDRAG" | "SAERTILSKUDD";
    /** opprettet av */
    opprettetAv: string;
}

/** Liste over hvilke typer grunnlag som skal hentes inn. På nivået under er personId og perioder angitt */
export interface GrunnlagRequestDto {
    /** Hvilken type grunnlag skal hentes */
    type:
        | "AINNTEKT"
        | "SKATTEGRUNNLAG"
        | "UTVIDET_BARNETRYGD_OG_SMAABARNSTILLEGG"
        | "BARNETILLEGG"
        | "HUSSTANDSMEDLEMMER"
        | "EGNE_BARN_I_HUSSTANDEN"
        | "EGNE_BARN"
        | "SIVILSTAND"
        | "KONTANTSTOTTE"
        | "BARNETILSYN";
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
    /** Hvilken type grunnlag som er hentet */
    type:
        | "AINNTEKT"
        | "SKATTEGRUNNLAG"
        | "UTVIDET_BARNETRYGD_OG_SMAABARNSTILLEGG"
        | "BARNETILLEGG"
        | "HUSSTANDSMEDLEMMER"
        | "EGNE_BARN_I_HUSSTANDEN"
        | "EGNE_BARN"
        | "SIVILSTAND"
        | "KONTANTSTOTTE"
        | "BARNETILSYN";
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
     * Tidspunkt inntekten ikke lenger er aktiv. Null betyr at inntekten er aktiv
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
     * Tidspunkt stønaden ikke lenger er aktiv. Null betyr at stønaden er aktiv
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
    /** Angir om en inntektsopplysning er aktiv */
    aktiv: boolean;
    /**
     * Tidspunkt inntekten tas i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt inntekten ikke lenger aktiv. Null betyr at inntekten er aktiv
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

/** Perioder barnet bor i samme husstand som aktuell forelder */
export interface BorISammeHusstandDto {
    /**
     * Barnet bor i husstanden fra- og med måned
     * @format date
     */
    periodeFra?: string;
    /**
     * Barnet bor i husstanden til- og med måned
     * @format date
     */
    periodeTil?: string;
    /** Manuelt opprettet av */
    opprettetAv?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

/** Liste over en persons barn og hvilke perioder de eventuelt deler husstand med personen grunnlaget er hentet inn for */
export interface EgneBarnDto {
    /** Id til forelderen. Kan være null ved manuelle registreringer */
    personIdForelder?: string;
    /** Identen til barnet */
    personIdBarn?: string;
    /** Navn på barnet, format <Fornavn, mellomnavn, Etternavn */
    navn?: string;
    /**
     * Barnets fødselsdato
     * @format date
     */
    foedselsdato?: string;
    /**
     * Barnets fødselsår
     * @format int32
     */
    foedselsaar?: number;
    /**
     * Barnets eventuelle dødsdato
     * @format date
     */
    doedsdato?: string;
    /** Manuelt opprettet av */
    opprettetAv?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
    /** Perioder barnet bor i samme husstand som aktuell forelder */
    borISammeHusstandDtoListe?: BorISammeHusstandDto[];
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
    /** Liste over en persons barn og hvilke perioder de eventuelt deler husstand med personen grunnlaget er hentet inn for */
    egneBarnListe: EgneBarnDto[];
    /** Periodisert liste over innhentede husstander for en person og dens voksne husstandsmedlemmer */
    husstandListe: HusstandDto[];
    /** Periodisert liste over en persons sivilstand */
    sivilstandListe: SivilstandDto[];
    /** Periodisert liste over innhentet barnetilsyn */
    barnetilsynListe: BarnetilsynDto[];
}

/** Periodisert liste over innhentede husstander for en person og dens voksne husstandsmedlemmer */
export interface HusstandDto {
    /** Id til personen husstandsinformasjonen er rapportert for */
    personId?: string;
    /**
     * Personen (BP) bor i husstanden fra- og med måned
     * @format date
     */
    periodeFra: string;
    /**
     * Personen (BP) bor i husstanden til- og med måned
     * @format date
     */
    periodeTil?: string;
    /** Navnet på en gate e.l. */
    adressenavn?: string;
    /** Nummeret som identifiserer et av flere hus i en gate */
    husnummer?: string;
    /** Bokstav som identifiserer del av et bygg */
    husbokstav?: string;
    /** En bokstav og fire siffer som identifiserer en boligenhet innenfor et bygg eller en bygningsdel */
    bruksenhetsnummer?: string;
    /** Norsk postnummer */
    postnummer?: string;
    /** 6 siffer, identifiserer bydel */
    bydelsnummer?: string;
    /** Siffer som identifiserer hvilken kommune adressen ligger i */
    kommunenummer?: string;
    /**
     * Nøkkel til geografisk adresse registrert i Kartverkets matrikkel
     * @format int64
     */
    matrikkelId?: number;
    /** Landkode, skal bare brukes for manuelt registrerte utlandsadresser */
    landkode?: string;
    /** Manuelt opprettet av */
    opprettetAv?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
    /** Periodisert liste over husstandsmedlemmer */
    husstandsmedlemmerListe?: HusstandsmedlemDto[];
}

/** Periodisert liste over husstandsmedlemmer */
export interface HusstandsmedlemDto {
    /**
     * Husstandsmedlemmet bor i husstanden fra- og med måned
     * @format date
     */
    periodeFra?: string;
    /**
     * Husstandsmedlemmet bor i husstanden til- og med måned
     * @format date
     */
    periodeTil?: string;
    /** Identen til husstandsmedlemmet */
    personId?: string;
    /** Navn på husstandsmedlemmet, format <Fornavn, mellomnavn, Etternavn */
    navn?: string;
    /**
     * Husstandsmedlemmets fødselsdag
     * @format date
     */
    foedselsdato?: string;
    /**
     * Husstandsmedlemmets eventuelle dødsdato
     * @format date
     */
    doedsdato?: string;
    /** Manuelt opprettet av */
    opprettetAv?: string;
    /**
     * Hentet tidspunkt
     * @format date-time
     */
    hentetTidspunkt: string;
}

/** Periodisert liste over innhentet kontantstøtte */
export interface KontantstotteDto {
    /** Id til personen som mottar kontatstøtten */
    partPersonId: string;
    /** Id til barnet kontatstøtten er for */
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
     * Tidspunkt inntekten ikke lenger aktiv. Null betyr at inntekten er aktiv
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
    /** Personens sivilstand */
    sivilstand: "GIFT" | "ENSLIG" | "SAMBOER";
    /** Manuelt opprettet av */
    opprettetAv?: string;
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
     * Tidspunkt inntekten ikke lenger er aktiv. Null betyr at inntekten er aktiv
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
     * Tidspunkt stønaden taes i bruk
     * @format date-time
     */
    brukFra: string;
    /**
     * Tidspunkt stønaden ikke lenger er aktiv. Null betyr at stønaden er aktiv
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
            baseURL: axiosConfig.baseURL || "https://bidrag-grunnlag-feature.dev.intern.nav.no",
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
 * @baseUrl https://bidrag-grunnlag-feature.dev.intern.nav.no
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
        hentSkattegrunnlag: (data: HentSkattegrunnlagRequest, params: RequestParams = {}) =>
            this.request<HentSkattegrunnlagResponse, any>({
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
        hentSivilstand: (data: SivilstandRequest, params: RequestParams = {}) =>
            this.request<SivilstandResponseDto, any>({
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
        hentHusstandsmedlemmer: (data: HusstandsmedlemmerRequest, params: RequestParams = {}) =>
            this.request<HusstandsmedlemmerResponseDto, any>({
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
         * @name HentFoedselOgDoed
         * @summary Kaller bidrag-person som igjen henter info om fødselsdato og eventuell død fra PDL
         * @request POST:/integrasjoner/forelderbarnrelasjon
         * @secure
         */
        hentFoedselOgDoed: (data: string, params: RequestParams = {}) =>
            this.request<NavnFoedselDoedResponseDto, any>({
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
         * @name HentForelderbarnrelasjon
         * @summary Kaller bidrag-person som igjen henter forelderbarnrelasjoner for angitt person fra PDL
         * @request POST:/integrasjoner/foedselogdoed
         * @secure
         */
        hentForelderbarnrelasjon: (data: ForelderBarnRequest, params: RequestParams = {}) =>
            this.request<ForelderBarnRelasjonResponseDto, any>({
                path: `/integrasjoner/foedselogdoed`,
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
            this.request<HentBarnetilleggPensjonResponse, any>({
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
         * @name HentAinntekt
         * @summary Henter A-inntekt
         * @request POST:/integrasjoner/ainntekt
         * @secure
         */
        hentAinntekt: (data: HentInntektRequest, params: RequestParams = {}) =>
            this.request<HentInntektListeResponse, any>({
                path: `/integrasjoner/ainntekt`,
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
         * @tags grunnlagspakke-controller
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
         * @tags grunnlagspakke-controller
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
         * @tags grunnlagspakke-controller
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
         * @tags grunnlagspakke-controller
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
