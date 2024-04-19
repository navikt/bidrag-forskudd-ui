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

export interface Behandling {
    vedtakstype: Vedtakstype;
    /** @format date */
    søktFomDato: string;
    /** @format date */
    datoTom?: string;
    /** @format date */
    mottattdato: string;
    saksnummer: string;
    /** @format int64 */
    soknadsid: number;
    /** @format int64 */
    soknadRefId?: number;
    behandlerEnhet: string;
    opprettetAv: string;
    opprettetAvNavn?: string;
    kildeapplikasjon: string;
    soknadFra: SoktAvType;
    stonadstype?: Stonadstype;
    engangsbeloptype?: Engangsbeloptype;
    /** @format int64 */
    vedtaksid?: number;
    /** @format int64 */
    refVedtaksid?: number;
    /** @format date */
    virkningstidspunkt?: string;
    /** @format date */
    opprinneligVirkningstidspunkt?: string;
    /** @format date-time */
    opprinneligVedtakstidspunkt?: string;
    /** @format date-time */
    vedtakstidspunkt?: string;
    /** @format date-time */
    slettetTidspunkt?: string;
    /** @format date-time */
    opprettetTidspunkt: string;
    vedtakFattetAv?: string;
    getårsak?: TypeArsakstype;
    avslag?: Resultatkode;
    virkningstidspunktsbegrunnelseIVedtakOgNotat?: string;
    virkningstidspunktbegrunnelseKunINotat?: string;
    boforholdsbegrunnelseIVedtakOgNotat?: string;
    boforholdsbegrunnelseKunINotat?: string;
    inntektsbegrunnelseIVedtakOgNotat?: string;
    inntektsbegrunnelseKunINotat?: string;
    /** @format int64 */
    id?: number;
    /** @format int64 */
    grunnlagspakkeid?: number;
    /** @format date-time */
    grunnlagSistInnhentet?: string;
    /** @uniqueItems true */
    grunnlag: GrunnlagEntity[];
    /** @uniqueItems true */
    roller: Rolle[];
    /** @uniqueItems true */
    husstandsbarn: Husstandsbarn[];
    /** @uniqueItems true */
    inntekter: Inntekt[];
    /** @uniqueItems true */
    sivilstand: Sivilstand[];
    deleted: boolean;
    bidragspliktig?: Rolle;
    erVedtakFattet: boolean;
    bidragsmottaker?: Rolle;
    grunnlagListe: GrunnlagEntity[];
    søknadsbarn: Rolle[];
    /** @format date */
    virkningstidspunktEllerSøktFomDato: string;
    erKlageEllerOmgjøring: boolean;
}

export enum Bostatuskode {
    MED_FORELDER = "MED_FORELDER",
    DOKUMENTERT_SKOLEGANG = "DOKUMENTERT_SKOLEGANG",
    IKKE_MED_FORELDER = "IKKE_MED_FORELDER",
    MED_VERGE = "MED_VERGE",
    ALENE = "ALENE",
    DELT_BOSTED = "DELT_BOSTED",
    REGNES_IKKE_SOM_BARN = "REGNES_IKKE_SOM_BARN",
}

export enum Engangsbeloptype {
    DIREKTE_OPPGJOR = "DIREKTE_OPPGJOR",
    DIREKTEOPPGJOR = "DIREKTE_OPPGJØR",
    ETTERGIVELSE = "ETTERGIVELSE",
    ETTERGIVELSE_TILBAKEKREVING = "ETTERGIVELSE_TILBAKEKREVING",
    GEBYR_MOTTAKER = "GEBYR_MOTTAKER",
    GEBYR_SKYLDNER = "GEBYR_SKYLDNER",
    INNKREVING_GJELD = "INNKREVING_GJELD",
    SAERTILSKUDD = "SAERTILSKUDD",
    SAeRTILSKUDD = "SÆRTILSKUDD",
    TILBAKEKREVING = "TILBAKEKREVING",
}

export interface GrunnlagEntity {
    behandling: Behandling;
    type: OpplysningerType;
    erBearbeidet: boolean;
    data: string;
    /** @format date-time */
    innhentet: string;
    /** @format date-time */
    aktiv?: string;
    rolle: Rolle;
    /** @format int64 */
    id?: number;
}

export interface Husstandsbarn {
    behandling: Behandling;
    kilde: Kilde;
    /** @format int64 */
    id?: number;
    ident?: string;
    navn?: string;
    /** @format date */
    fødselsdato: string;
    /** @uniqueItems true */
    perioder: Husstandsbarnperiode[];
}

export interface Husstandsbarnperiode {
    husstandsbarn: Husstandsbarn;
    /** @format date */
    datoFom?: string;
    /** @format date */
    datoTom?: string;
    bostatus: Bostatuskode;
    kilde: Kilde;
    /** @format int64 */
    id?: number;
}

export interface Inntekt {
    /** Inntektsrapportering typer på inntekter som overlapper */
    type: Inntektsrapportering;
    belop: number;
    /** @format date */
    datoFom?: string;
    /** @format date */
    datoTom?: string;
    ident: string;
    kilde: Kilde;
    taMed: boolean;
    /** @format int64 */
    id?: number;
    behandling?: Behandling;
    /** @uniqueItems true */
    inntektsposter: Inntektspost[];
    gjelderBarn?: string;
    /** @format date */
    opprinneligFom?: string;
    /** @format date */
    opprinneligTom?: string;
    periode?: TypeArManedsperiode;
    opprinneligPeriode?: TypeArManedsperiode;
    /** @format date */
    datoFomEllerOpprinneligFom?: string;
}

export interface Inntektspost {
    beløp: number;
    kode: string;
    /** @format int64 */
    id?: number;
    inntekt?: Inntekt;
    /** Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper. */
    inntektstype?: Inntektstype;
}

/** Inntektsrapportering typer på inntekter som overlapper */
export enum Inntektsrapportering {
    AINNTEKT = "AINNTEKT",
    AINNTEKTBEREGNET3MND = "AINNTEKT_BEREGNET_3MND",
    AINNTEKTBEREGNET12MND = "AINNTEKT_BEREGNET_12MND",
    AINNTEKTBEREGNET3MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT = "AINNTEKT_BEREGNET_3MND_FRA_OPPRINNELIG_VEDTAKSTIDSPUNKT",
    AINNTEKTBEREGNET12MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT = "AINNTEKT_BEREGNET_12MND_FRA_OPPRINNELIG_VEDTAKSTIDSPUNKT",
    AINNTEKTBEREGNET3MNDFRAOPPRINNELIGVEDTAK = "AINNTEKT_BEREGNET_3MND_FRA_OPPRINNELIG_VEDTAK",
    AINNTEKTBEREGNET12MNDFRAOPPRINNELIGVEDTAK = "AINNTEKT_BEREGNET_12MND_FRA_OPPRINNELIG_VEDTAK",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    LIGNINGSINNTEKT = "LIGNINGSINNTEKT",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    AAP = "AAP",
    DAGPENGER = "DAGPENGER",
    FORELDREPENGER = "FORELDREPENGER",
    INTRODUKSJONSSTONAD = "INTRODUKSJONSSTØNAD",
    KVALIFISERINGSSTONAD = "KVALIFISERINGSSTØNAD",
    OVERGANGSSTONAD = "OVERGANGSSTØNAD",
    PENSJON = "PENSJON",
    SYKEPENGER = "SYKEPENGER",
    BARNETILLEGG = "BARNETILLEGG",
    BARNETILSYN = "BARNETILSYN",
    PERSONINNTEKT_EGNE_OPPLYSNINGER = "PERSONINNTEKT_EGNE_OPPLYSNINGER",
    KAPITALINNTEKT_EGNE_OPPLYSNINGER = "KAPITALINNTEKT_EGNE_OPPLYSNINGER",
    SAKSBEHANDLER_BEREGNET_INNTEKT = "SAKSBEHANDLER_BEREGNET_INNTEKT",
    LONNMANUELTBEREGNET = "LØNN_MANUELT_BEREGNET",
    NAeRINGSINNTEKTMANUELTBEREGNET = "NÆRINGSINNTEKT_MANUELT_BEREGNET",
    YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET = "YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET",
    AINNTEKT_KORRIGERT_BARNETILLEGG = "AINNTEKT_KORRIGERT_BARNETILLEGG",
    BARNETRYGD_MANUELL_VURDERING = "BARNETRYGD_MANUELL_VURDERING",
    BARNS_SYKDOM = "BARNS_SYKDOM",
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
    PENSJON_KORRIGERT_BARNETILLEGG = "PENSJON_KORRIGERT_BARNETILLEGG",
    REHABILITERINGSPENGER = "REHABILITERINGSPENGER",
    SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG = "SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG",
    SKATTEGRUNNLAG_SKE = "SKATTEGRUNNLAG_SKE",
}

/** Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper. */
export enum Inntektstype {
    AAP = "AAP",
    DAGPENGER = "DAGPENGER",
    FORELDREPENGER = "FORELDREPENGER",
    INTRODUKSJONSSTONAD = "INTRODUKSJONSSTØNAD",
    KVALIFISERINGSSTONAD = "KVALIFISERINGSSTØNAD",
    OVERGANGSSTONAD = "OVERGANGSSTØNAD",
    PENSJON = "PENSJON",
    SYKEPENGER = "SYKEPENGER",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    LONNSINNTEKT = "LØNNSINNTEKT",
    NAeRINGSINNTEKT = "NÆRINGSINNTEKT",
    BARNETILSYN = "BARNETILSYN",
    BARNETILLEGG_PENSJON = "BARNETILLEGG_PENSJON",
    BARNETILLEGGUFORETRYGD = "BARNETILLEGG_UFØRETRYGD",
    BARNETILLEGG_DAGPENGER = "BARNETILLEGG_DAGPENGER",
    BARNETILLEGGKVALIFISERINGSSTONAD = "BARNETILLEGG_KVALIFISERINGSSTØNAD",
    BARNETILLEGG_AAP = "BARNETILLEGG_AAP",
    BARNETILLEGG_DNB = "BARNETILLEGG_DNB",
    BARNETILLEGG_NORDEA = "BARNETILLEGG_NORDEA",
    BARNETILLEGG_STOREBRAND = "BARNETILLEGG_STOREBRAND",
    BARNETILLEGG_KLP = "BARNETILLEGG_KLP",
    BARNETILLEGG_SPK = "BARNETILLEGG_SPK",
}

export enum Kilde {
    MANUELL = "MANUELL",
    OFFENTLIG = "OFFENTLIG",
}

export enum OpplysningerType {
    ARBEIDSFORHOLD = "ARBEIDSFORHOLD",
    BARNETILLEGG = "BARNETILLEGG",
    BARNETILSYN = "BARNETILSYN",
    BOFORHOLD = "BOFORHOLD",
    KONTANTSTOTTE = "KONTANTSTØTTE",
    SIVILSTAND = "SIVILSTAND",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    SMABARNSTILLEGG = "SMÅBARNSTILLEGG",
    SKATTEPLIKTIGE_INNTEKTER = "SKATTEPLIKTIGE_INNTEKTER",
    SUMMERTEMANEDSINNTEKTER = "SUMMERTE_MÅNEDSINNTEKTER",
    AINNTEKT = "AINNTEKT",
    SKATTEGRUNNLAG = "SKATTEGRUNNLAG",
    BOFORHOLD_BEARBEIDET = "BOFORHOLD_BEARBEIDET",
    HUSSTANDSMEDLEMMER = "HUSSTANDSMEDLEMMER",
    INNTEKT_BEARBEIDET = "INNTEKT_BEARBEIDET",
    INNTEKTSOPPLYSNINGER = "INNTEKTSOPPLYSNINGER",
    SUMMERTEARSINNTEKTER = "SUMMERTE_ÅRSINNTEKTER",
}

export enum Resultatkode {
    BARNETERSELVFORSORGET = "BARNET_ER_SELVFORSØRGET",
    BEGRENSETEVNEFLERESAKERUTFORFORHOLDSMESSIGFORDELING = "BEGRENSET_EVNE_FLERE_SAKER_UTFØR_FORHOLDSMESSIG_FORDELING",
    BEGRENSET_REVURDERING = "BEGRENSET_REVURDERING",
    BIDRAG_IKKE_BEREGNET_DELT_BOSTED = "BIDRAG_IKKE_BEREGNET_DELT_BOSTED",
    BIDRAG_REDUSERT_AV_EVNE = "BIDRAG_REDUSERT_AV_EVNE",
    BIDRAGREDUSERTTIL25PROSENTAVINNTEKT = "BIDRAG_REDUSERT_TIL_25_PROSENT_AV_INNTEKT",
    BIDRAG_SATT_TIL_BARNETILLEGG_BP = "BIDRAG_SATT_TIL_BARNETILLEGG_BP",
    BIDRAG_SATT_TIL_BARNETILLEGG_FORSVARET = "BIDRAG_SATT_TIL_BARNETILLEGG_FORSVARET",
    BIDRAG_SATT_TIL_UNDERHOLDSKOSTNAD_MINUS_BARNETILLEGG_BM = "BIDRAG_SATT_TIL_UNDERHOLDSKOSTNAD_MINUS_BARNETILLEGG_BM",
    DELT_BOSTED = "DELT_BOSTED",
    FORHOLDSMESSIGFORDELINGBIDRAGSBELOPENDRET = "FORHOLDSMESSIG_FORDELING_BIDRAGSBELØP_ENDRET",
    FORHOLDSMESSIG_FORDELING_INGEN_ENDRING = "FORHOLDSMESSIG_FORDELING_INGEN_ENDRING",
    INGEN_EVNE = "INGEN_EVNE",
    KOSTNADSBEREGNET_BIDRAG = "KOSTNADSBEREGNET_BIDRAG",
    REDUSERTFORSKUDD50PROSENT = "REDUSERT_FORSKUDD_50_PROSENT",
    ORDINAeRTFORSKUDD75PROSENT = "ORDINÆRT_FORSKUDD_75_PROSENT",
    FORHOYETFORSKUDD100PROSENT = "FORHØYET_FORSKUDD_100_PROSENT",
    FORHOYETFORSKUDD11AR125PROSENT = "FORHØYET_FORSKUDD_11_ÅR_125_PROSENT",
    SAeRTILSKUDDINNVILGET = "SÆRTILSKUDD_INNVILGET",
    SAeRTILSKUDDIKKEFULLBIDRAGSEVNE = "SÆRTILSKUDD_IKKE_FULL_BIDRAGSEVNE",
    AVSLAG = "AVSLAG",
    AVSLAG2 = "AVSLAG2",
    PAGRUNNAVBARNEPENSJON = "PÅ_GRUNN_AV_BARNEPENSJON",
    AVSLAGOVER18AR = "AVSLAG_OVER_18_ÅR",
    AVSLAGIKKEREGISTRERTPAADRESSE = "AVSLAG_IKKE_REGISTRERT_PÅ_ADRESSE",
    AVSLAGHOYINNTEKT = "AVSLAG_HØY_INNTEKT",
    BARNETS_EKTESKAP = "BARNETS_EKTESKAP",
    BARNETS_INNTEKT = "BARNETS_INNTEKT",
    PAGRUNNAVYTELSEFRAFOLKETRYGDEN = "PÅ_GRUNN_AV_YTELSE_FRA_FOLKETRYGDEN",
    FULLT_UNDERHOLDT_AV_OFFENTLIG = "FULLT_UNDERHOLDT_AV_OFFENTLIG",
    IKKE_OMSORG = "IKKE_OMSORG",
    IKKE_OPPHOLD_I_RIKET = "IKKE_OPPHOLD_I_RIKET",
    MANGLENDE_DOKUMENTASJON = "MANGLENDE_DOKUMENTASJON",
    PAGRUNNAVSAMMENFLYTTING = "PÅ_GRUNN_AV_SAMMENFLYTTING",
    OPPHOLD_I_UTLANDET = "OPPHOLD_I_UTLANDET",
    UTENLANDSK_YTELSE = "UTENLANDSK_YTELSE",
}

export interface Rolle {
    behandling: Behandling;
    rolletype: Rolletype;
    ident?: string;
    /** @format date */
    foedselsdato: string;
    /** @format date-time */
    opprettet: string;
    /** @format int64 */
    id?: number;
    navn?: string;
    deleted: boolean;
    /** @uniqueItems true */
    grunnlag: GrunnlagEntity[];
}

export enum Rolletype {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
}

export interface Sivilstand {
    behandling: Behandling;
    /** @format date */
    datoFom?: string;
    /** @format date */
    datoTom?: string;
    sivilstand: Sivilstandskode;
    kilde: Kilde;
    /** @format int64 */
    id?: number;
}

export enum Sivilstandskode {
    GIFT_SAMBOER = "GIFT_SAMBOER",
    BOR_ALENE_MED_BARN = "BOR_ALENE_MED_BARN",
    ENSLIG = "ENSLIG",
    SAMBOER = "SAMBOER",
    UKJENT = "UKJENT",
}

export enum Stonadstype {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
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

export enum Vedtakstype {
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

export enum TypeArsakstype {
    ANNET = "ANNET",
    ENDRING3MANEDERTILBAKE = "ENDRING_3_MÅNEDER_TILBAKE",
    ENDRING3ARSREGELEN = "ENDRING_3_ÅRS_REGELEN",
    FRABARNETSFODSEL = "FRA_BARNETS_FØDSEL",
    FRABARNETSFLYTTEMANED = "FRA_BARNETS_FLYTTEMÅNED",
    FRA_KRAVFREMSETTELSE = "FRA_KRAVFREMSETTELSE",
    FRAMANEDETTERINNTEKTENOKTE = "FRA_MÅNED_ETTER_INNTEKTEN_ØKTE",
    FRA_OPPHOLDSTILLATELSE = "FRA_OPPHOLDSTILLATELSE",
    FRASOKNADSTIDSPUNKT = "FRA_SØKNADSTIDSPUNKT",
    FRA_SAMLIVSBRUDD = "FRA_SAMLIVSBRUDD",
    FRASAMMEMANEDSOMINNTEKTENBLEREDUSERT = "FRA_SAMME_MÅNED_SOM_INNTEKTEN_BLE_REDUSERT",
    PRIVAT_AVTALE = "PRIVAT_AVTALE",
    REVURDERINGMANEDENETTER = "REVURDERING_MÅNEDEN_ETTER",
    SOKNADSTIDSPUNKTENDRING = "SØKNADSTIDSPUNKT_ENDRING",
    TIDLIGERE_FEILAKTIG_AVSLAG = "TIDLIGERE_FEILAKTIG_AVSLAG",
    TREMANEDERTILBAKE = "TRE_MÅNEDER_TILBAKE",
    TREARSREGELEN = "TRE_ÅRS_REGELEN",
}

export interface AktivereGrunnlagRequest {
    /** Personident tilhørende rolle i behandling grunnlag skal aktiveres for */
    personident: string;
    /**
     * Grunnlagstyper som skal aktiveres
     * @uniqueItems true
     */
    grunnlagsdatatyper: OpplysningerType[];
}

/** Liste med perioder hvor det mangler inntekter. Vil alltid være tom liste for ytelser */
export interface Datoperiode {
    /** @format date */
    fom: string;
    /** @format date */
    til?: string;
}

export interface HusstandsbarnDtoV2 {
    /** @format int64 */
    id?: number;
    kilde: Kilde;
    medIBehandling: boolean;
    /** @uniqueItems true */
    perioder: HusstandsbarnperiodeDto[];
    ident?: string;
    navn?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    fødselsdato: string;
}

export interface HusstandsbarnperiodeDto {
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
    bostatus: Bostatuskode;
    kilde: Kilde;
}

export interface OppdaterBehandlingRequestV2 {
    virkningstidspunkt?: OppdaterVirkningstidspunkt;
    /**
     *
     * For `husstandsbarn` og `sivilstand`
     * * Hvis feltet er null eller ikke satt vil det ikke bli gjort noe endringer.
     * * Hvis feltet er tom liste vil alt bli slettet
     * * Innholdet i listen vil erstatte alt som er lagret. Det er derfor ikke mulig å endre på deler av informasjon i listene.
     */
    boforhold?: OppdaterBoforholdRequest;
    inntekter?: OppdatereInntekterRequestV2;
    aktivereGrunnlagForPerson?: AktivereGrunnlagRequest;
}

/**
 *
 * For `husstandsbarn` og `sivilstand`
 * * Hvis feltet er null eller ikke satt vil det ikke bli gjort noe endringer.
 * * Hvis feltet er tom liste vil alt bli slettet
 * * Innholdet i listen vil erstatte alt som er lagret. Det er derfor ikke mulig å endre på deler av informasjon i listene.
 */
export interface OppdaterBoforholdRequest {
    /** @uniqueItems true */
    husstandsbarn?: HusstandsbarnDtoV2[];
    /** @uniqueItems true */
    sivilstand?: SivilstandDto[];
    notat?: OppdaterNotat;
}

export interface OppdaterNotat {
    kunINotat?: string;
    medIVedtaket?: string;
}

export interface OppdaterVirkningstidspunkt {
    årsak?: TypeArsakstype;
    avslag?: Resultatkode;
    /**
     * Oppdater virkningsdato. Hvis verdien er satt til null vil virkningsdato bli slettet. Hvis verdien er satt til tom verdi eller ikke er satt vil det ikke bli gjort noe endringer
     * @format date
     * @example "2025-01-25"
     */
    virkningstidspunkt?: string;
    notat?: OppdaterNotat;
}

export interface OppdatereInntekterRequestV2 {
    /**
     * Angi periodeinformasjon for inntekter
     * @uniqueItems true
     */
    oppdatereInntektsperioder: OppdaterePeriodeInntekt[];
    /**
     * Opprette eller oppdatere manuelt oppgitte inntekter
     * @uniqueItems true
     */
    oppdatereManuelleInntekter: OppdatereManuellInntekt[];
    /**
     * Angi id til inntekter som skal slettes
     * @uniqueItems true
     */
    sletteInntekter: number[];
    notat?: OppdaterNotat;
}

/** Opprette eller oppdatere manuelt oppgitte inntekter */
export interface OppdatereManuellInntekt {
    /**
     * Inntektens databaseid. Oppgis ikke ved opprettelse av inntekt.
     * @format int64
     */
    id?: number;
    /** Angir om inntekten skal inkluderes i beregning. Hvis ikke spesifisert inkluderes inntekten. */
    taMed: boolean;
    /** Inntektsrapportering typer på inntekter som overlapper */
    type: Inntektsrapportering;
    /** Inntektens beløp i norske kroner */
    beløp: number;
    /**
     * @format date
     * @example "2024-01-01"
     */
    datoFom: string;
    /**
     * @format date
     * @example "2024-12-31"
     */
    datoTom?: string;
    /**
     * Ident til personen inntekten gjenlder for.
     * @example "12345678910"
     */
    ident: string;
    /**
     * Ident til barnet en ytelse gjelder for. sBenyttes kun for ytelser som er koblet til ett spesifikt barn, f.eks kontantstøtte
     * @example "12345678910"
     */
    gjelderBarn?: string;
    /** Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper. */
    inntektstype?: Inntektstype;
}

/** Angi periodeinformasjon for inntekter */
export interface OppdaterePeriodeInntekt {
    /**
     * Id til inntekt som skal oppdateres
     * @format int64
     */
    id: number;
    /** Anig om inntekten skal inkluderes i beregning */
    taMedIBeregning: boolean;
    /** Liste med perioder hvor det mangler inntekter. Vil alltid være tom liste for ytelser */
    angittPeriode: Datoperiode;
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
    sivilstand: Sivilstandskode;
    kilde: Kilde;
}

export interface AktiveGrunnlagsdata {
    /** @uniqueItems true */
    arbeidsforhold: ArbeidsforholdGrunnlagDto[];
    /** @uniqueItems true */
    husstandsbarn: HusstandsbarnGrunnlagDto[];
    sivilstand?: SivilstandAktivGrunnlagDto;
}

/** Liste av ansettelsesdetaljer, med eventuell historikk */
export interface Ansettelsesdetaljer {
    /** Fradato for ansettelsesdetalj. År + måned */
    periodeFra?: {
        /** @format int32 */
        year?: number;
        month?: AnsettelsesdetaljerMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** Eventuell sluttdato for ansettelsesdetalj. År + måned */
    periodeTil?: {
        /** @format int32 */
        year?: number;
        month?: AnsettelsesdetaljerMonthEnum1;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** Type arbeidsforhold, Ordinaer, Maritim, Forenklet, Frilanser' */
    arbeidsforholdType?: string;
    /** Beskrivelse av arbeidstidsordning. Eks: 'Ikke skift' */
    arbeidstidsordningBeskrivelse?: string;
    /** Beskrivelse av ansettelsesform. Eks: 'Fast ansettelse' */
    ansettelsesformBeskrivelse?: string;
    /** Beskrivelse av yrke. Eks: 'KONTORLEDER' */
    yrkeBeskrivelse?: string;
    /**
     * Avtalt antall timer i uken
     * @format double
     */
    antallTimerPrUke?: number;
    /**
     * Avtalt stillingsprosent
     * @format double
     */
    avtaltStillingsprosent?: number;
    /**
     * Dato for forrige endring i stillingsprosent
     * @format date
     */
    sisteStillingsprosentendringDato?: string;
    /**
     * Dato for forrige lønnsendring
     * @format date
     */
    sisteLønnsendringDato?: string;
}

export interface ArbeidsforholdGrunnlagDto {
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
    ansettelsesdetaljerListe?: Ansettelsesdetaljer[];
    /** Liste over registrerte permisjoner */
    permisjonListe?: Permisjon[];
    /** Liste over registrerte permitteringer */
    permitteringListe?: Permittering[];
}

export interface BehandlingDtoV2 {
    /** @format int64 */
    id: number;
    vedtakstype: Vedtakstype;
    stønadstype?: Stonadstype;
    engangsbeløptype?: Engangsbeloptype;
    erVedtakFattet: boolean;
    erKlageEllerOmgjøring: boolean;
    /** @format date-time */
    opprettetTidspunkt: string;
    /** @format date */
    søktFomDato: string;
    /** @format date */
    mottattdato: string;
    søktAv: SoktAvType;
    saksnummer: string;
    /** @format int64 */
    søknadsid: number;
    /** @format int64 */
    søknadRefId?: number;
    /** @format int64 */
    vedtakRefId?: number;
    behandlerenhet: string;
    /** @uniqueItems true */
    roller: RolleDto[];
    /** @format int64 */
    grunnlagspakkeid?: number;
    virkningstidspunkt: VirkningstidspunktDto;
    inntekter: InntekterDtoV2;
    boforhold: BoforholdDtoV2;
    aktiveGrunnlagsdata: AktiveGrunnlagsdata;
    ikkeAktiverteEndringerIGrunnlagsdata: IkkeAktiveGrunnlagsdata;
}

export interface BehandlingNotatDto {
    kunINotat?: string;
    medIVedtaket?: string;
}

export interface BoforholdDtoV2 {
    /** @uniqueItems true */
    husstandsbarn: HusstandsbarnDtoV2[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    notat: BehandlingNotatDto;
    valideringsfeil: BoforholdValideringsfeil;
}

export interface BoforholdPeriodeseringsfeil {
    hullIPerioder: Datoperiode[];
    overlappendePerioder: HusstandsbarnOverlappendePeriode[];
    /** Er sann hvis husstandsbarn har en periode som starter senere enn starten av dagens måned. */
    fremtidigPeriode: boolean;
    /**
     * Er sann hvis husstandsbarn mangler perioder.
     *         Dette vil si at husstandsbarn ikke har noen perioder i det hele tatt."
     */
    manglerPerioder: boolean;
    /** Er sann hvis husstandsbarn ikke har noen løpende periode. Det vil si en periode hvor datoTom er null */
    ingenLøpendePeriode: boolean;
    barn?: HusstandsbarnPeriodiseringsfeilDto;
}

export interface BoforholdValideringsfeil {
    husstandsbarn?: BoforholdPeriodeseringsfeil[];
    sivilstand?: SivilstandPeriodeseringsfeil;
}

/** Liste over summerte inntektsperioder */
export interface DelberegningSumInntekt {
    periode: TypeArManedsperiode;
    totalinntekt: number;
    kontantstøtte?: number;
    skattepliktigInntekt?: number;
    barnetillegg?: number;
    utvidetBarnetrygd?: number;
    småbarnstillegg?: number;
}

export enum GrunnlagInntektEndringstype {
    ENDRING = "ENDRING",
    INGEN_ENDRING = "INGEN_ENDRING",
    SLETTET = "SLETTET",
    NY = "NY",
}

export interface HusstandsbarnGrunnlagDto {
    /** @uniqueItems true */
    perioder: HusstandsbarnGrunnlagPeriodeDto[];
    ident?: string;
    /** @format date-time */
    innhentetTidspunkt: string;
}

export interface HusstandsbarnGrunnlagPeriodeDto {
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
    bostatus: Bostatuskode;
}

export interface HusstandsbarnOverlappendePeriode {
    /** Liste med perioder hvor det mangler inntekter. Vil alltid være tom liste for ytelser */
    periode: Datoperiode;
    /** @uniqueItems true */
    bosstatus: Bostatuskode[];
}

export interface HusstandsbarnPeriodiseringsfeilDto {
    navn?: string;
    ident?: string;
    /** @format date */
    fødselsdato: string;
    /**
     * Teknisk id på husstandsbarn som har periodiseringsfeil
     * @format int64
     */
    tekniskId: number;
}

export interface IkkeAktivInntektDto {
    /** @format int64 */
    originalId?: number;
    /** @format date-time */
    innhentetTidspunkt: string;
    endringstype: GrunnlagInntektEndringstype;
    /** Inntektsrapportering typer på inntekter som overlapper */
    rapporteringstype: Inntektsrapportering;
    beløp: number;
    periode: TypeArManedsperiode;
    ident: string;
    gjelderBarn?: string;
    /** @uniqueItems true */
    inntektsposter: InntektspostDtoV2[];
    /** @uniqueItems true */
    inntektsposterSomErEndret: InntektspostEndringDto[];
}

export interface IkkeAktiveGrunnlagsdata {
    inntekter: IkkeAktiveInntekter;
    /** @uniqueItems true */
    husstandsbarn: HusstandsbarnGrunnlagDto[];
    sivilstand?: SivilstandIkkeAktivGrunnlagDto;
}

export interface IkkeAktiveInntekter {
    /** @uniqueItems true */
    barnetillegg: IkkeAktivInntektDto[];
    /** @uniqueItems true */
    utvidetBarnetrygd: IkkeAktivInntektDto[];
    /** @uniqueItems true */
    kontantstøtte: IkkeAktivInntektDto[];
    /** @uniqueItems true */
    småbarnstillegg: IkkeAktivInntektDto[];
    /** @uniqueItems true */
    årsinntekter: IkkeAktivInntektDto[];
}

export interface InntektDtoV2 {
    /** @format int64 */
    id?: number;
    taMed: boolean;
    /** Inntektsrapportering typer på inntekter som overlapper */
    rapporteringstype: Inntektsrapportering;
    beløp: number;
    /**
     * @format date
     * @example "2024-01-01"
     */
    datoFom?: string;
    /**
     * @format date
     * @example "2024-12-31"
     */
    datoTom?: string;
    /**
     * @format date
     * @example "2024-01-01"
     */
    opprinneligFom?: string;
    /**
     * @format date
     * @example "2024-12-31"
     */
    opprinneligTom?: string;
    ident: string;
    gjelderBarn?: string;
    kilde: Kilde;
    /** @uniqueItems true */
    inntektsposter: InntektspostDtoV2[];
    /** @uniqueItems true */
    inntektstyper: Inntektstype[];
}

/** Periodisert inntekt per barn */
export interface InntektPerBarn {
    /** Referanse til barn */
    inntektGjelderBarnIdent?: string;
    /** Liste over summerte inntektsperioder */
    summertInntektListe: DelberegningSumInntekt[];
}

export interface InntektValideringsfeil {
    /** @uniqueItems true */
    overlappendePerioder: OverlappendePeriode[];
    fremtidigPeriode: boolean;
    /** Liste med perioder hvor det mangler inntekter. Vil alltid være tom liste for ytelser */
    hullIPerioder: Datoperiode[];
    /** Er sann hvis det ikke finnes noen valgte inntekter. Vil alltid være false hvis det er ytelse */
    manglerPerioder: boolean;
    ident: string;
    /** Personident ytelsen gjelder for. Kan være null hvis det er en ytelse som ikke gjelder for et barn. */
    gjelderBarn?: string;
    /** Er sann hvis det ikke finnes noe løpende periode. Det vil si en periode hvor datoTom er null. Er bare relevant for årsinntekter */
    ingenLøpendePeriode: boolean;
}

export interface InntektValideringsfeilDto {
    /** @uniqueItems true */
    barnetillegg?: InntektValideringsfeil[];
    utvidetBarnetrygd?: InntektValideringsfeil;
    /** @uniqueItems true */
    kontantstøtte?: InntektValideringsfeil[];
    småbarnstillegg?: InntektValideringsfeil;
    /** @uniqueItems true */
    årsinntekter?: InntektValideringsfeil[];
}

export interface InntekterDtoV2 {
    /** @uniqueItems true */
    barnetillegg: InntektDtoV2[];
    /** @uniqueItems true */
    utvidetBarnetrygd: InntektDtoV2[];
    /** @uniqueItems true */
    kontantstøtte: InntektDtoV2[];
    /** @uniqueItems true */
    månedsinntekter: InntektDtoV2[];
    /** @uniqueItems true */
    småbarnstillegg: InntektDtoV2[];
    /** @uniqueItems true */
    årsinntekter: InntektDtoV2[];
    beregnetInntekter: InntektPerBarn[];
    notat: BehandlingNotatDto;
    valideringsfeil: InntektValideringsfeilDto;
}

export interface InntektspostDtoV2 {
    kode: string;
    visningsnavn: string;
    /** Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper. */
    inntektstype?: Inntektstype;
    beløp?: number;
}

export interface InntektspostEndringDto {
    kode: string;
    visningsnavn: string;
    /** Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper. */
    inntektstype?: Inntektstype;
    beløp?: number;
    endringstype: GrunnlagInntektEndringstype;
}

export interface OverlappendePeriode {
    /** Liste med perioder hvor det mangler inntekter. Vil alltid være tom liste for ytelser */
    periode: Datoperiode;
    /**
     * Teknisk id på inntekter som overlapper
     * @uniqueItems true
     */
    idListe: number[];
    /**
     * Inntektsrapportering typer på inntekter som overlapper
     * @uniqueItems true
     */
    rapporteringTyper: Inntektsrapportering[];
    /**
     * Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper.
     * @uniqueItems true
     */
    inntektstyper: Inntektstype[];
}

/** Liste over registrerte permisjoner */
export interface Permisjon {
    /** @format date */
    startdato?: string;
    /** @format date */
    sluttdato?: string;
    beskrivelse?: string;
    /** @format double */
    prosent?: number;
}

/** Liste over registrerte permitteringer */
export interface Permittering {
    /** @format date */
    startdato?: string;
    /** @format date */
    sluttdato?: string;
    beskrivelse?: string;
    /** @format double */
    prosent?: number;
}

export interface RolleDto {
    /** @format int64 */
    id: number;
    rolletype: Rolletype;
    ident?: string;
    navn?: string;
    /** @format date */
    fødselsdato?: string;
}

export interface SivilstandAktivGrunnlagDto {
    /** @uniqueItems true */
    grunnlag: SivilstandGrunnlagDto[];
    /** @format date-time */
    innhentetTidspunkt: string;
}

export interface SivilstandGrunnlagDto {
    /** Id til personen sivilstanden er rapportert for */
    personId?: string;
    /** Type sivilstand fra PDL */
    type?: SivilstandskodePDL;
    /**
     * Dato sivilstanden er gyldig fra
     * @format date
     */
    gyldigFom?: string;
    /**
     * Dato NAV tidligst har fått bekreftet sivilstanden
     * @format date
     */
    bekreftelsesdato?: string;
    /** Master for opplysningen om sivilstand (FREG eller PDL) */
    master?: string;
    /**
     * Tidspunktet sivilstanden er registrert
     * @format date-time
     */
    registrert?: string;
    /** Angir om sivilstanden er historisk (true) eller aktiv (false) */
    historisk?: boolean;
}

export interface SivilstandIkkeAktivGrunnlagDto {
    sivilstand: SivilstandDto[];
    status: SivilstandIkkeAktivGrunnlagDtoStatusEnum;
    /** @uniqueItems true */
    grunnlag: SivilstandGrunnlagDto[];
    /** @format date-time */
    innhentetTidspunkt: string;
}

export interface SivilstandOverlappendePeriode {
    /** Liste med perioder hvor det mangler inntekter. Vil alltid være tom liste for ytelser */
    periode: Datoperiode;
    /** @uniqueItems true */
    sivilstandskode: Sivilstandskode[];
}

export interface SivilstandPeriodeseringsfeil {
    hullIPerioder: Datoperiode[];
    overlappendePerioder: SivilstandOverlappendePeriode[];
    /** Er sann hvis det finnes en eller flere perioder som starter senere enn starten av dagens måned. */
    fremtidigPeriode: boolean;
    /** Er sann hvis det mangler sivilstand perioder." */
    manglerPerioder: boolean;
    /** Er sann hvis det ikke finnes noe løpende periode. Det vil si en periode hvor datoTom er null */
    ingenLøpendePeriode: boolean;
}

/** Type sivilstand fra PDL */
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

export interface VirkningstidspunktDto {
    /** @format date */
    virkningstidspunkt?: string;
    /** @format date */
    opprinneligVirkningstidspunkt?: string;
    årsak?: TypeArsakstype;
    avslag?: Resultatkode;
    notat: BehandlingNotatDto;
}

export interface OppdatereInntektRequest {
    /** Angi periodeinformasjon for inntekter */
    oppdatereInntektsperiode?: OppdaterePeriodeInntekt;
    /** Opprette eller oppdatere manuelt oppgitte inntekter */
    oppdatereManuellInntekt?: OppdatereManuellInntekt;
    oppdatereNotat?: OppdaterNotat;
    /**
     * Angi id til inntekt som skal slettes
     * @format int64
     */
    sletteInntekt?: number;
}

export interface OppdatereInntektResponse {
    inntekt?: InntektDtoV2;
    /** Periodiserte inntekter per barn */
    beregnetInntekter: InntektPerBarn[];
    valideringsfeil: InntektValideringsfeilDto;
}

/** Oppdaterer husstandsbarn, sivilstand, eller notat */
export interface OppdatereBoforholdRequestV2 {
    oppdatereHusstandsbarn?: OppdatereHusstandsbarn;
    oppdatereSivilstand?: OppdatereSivilstand;
    oppdatereNotat?: OppdaterNotat;
}

export interface OppdatereHusstandsbarn {
    nyttHusstandsbarn?: PersonaliaHusstandsbarn;
    nyHusstandsbarnperiode?: Husstandsbarnperiode;
    /** @format int64 */
    sletteHusstandsbarnperiode?: number;
    /** @format int64 */
    sletteHusstandsbarn?: number;
}

export interface OppdatereSivilstand {
    leggeTilSivilstandsperiode?: Sivilstandsperiode;
    /** @format int64 */
    sletteSivilstandsperiode?: number;
}

export interface PersonaliaHusstandsbarn {
    personident?: string;
    /** @format date */
    fødselsdato: string;
    navn?: string;
}

export interface Sivilstandsperiode {
    /** @format date */
    fraOgMed: string;
    /** @format date */
    tilOgMed?: string;
    sivilstand: Sivilstandskode;
}

export interface OppdatereBoforholdResponse {
    oppdatertHusstandsbarn?: HusstandsbarnDtoV2;
    oppdatertSivilstand?: SivilstandDto;
    oppdatertNotat?: OppdaterNotat;
    valideringsfeil: BoforholdValideringsfeil;
}

export interface AktivereGrunnlagRequestV2 {
    /** Personident tilhørende rolle i behandling grunnlag skal aktiveres for */
    personident: string;
    grunnlagstype: OpplysningerType;
    /** Angi om manuelle opplysninger skal overskrives */
    overskriveManuelleOpplysninger: boolean;
}

export interface AktivereGrunnlagResponseV2 {
    inntekter: InntekterDtoV2;
    boforhold: BoforholdDtoV2;
    aktiveGrunnlagsdata: AktiveGrunnlagsdata;
    ikkeAktiverteEndringerIGrunnlagsdata: IkkeAktiveGrunnlagsdata;
}

export interface OppdaterRollerRequest {
    roller: OpprettRolleDto[];
}

/** Rolle beskrivelse som er brukte til å opprette nye roller */
export interface OpprettRolleDto {
    rolletype: Rolletype;
    /** F.eks fødselsnummer. Påkrevd for alle rolletyper utenom for barn som ikke inngår i beregning. */
    ident?: string | null;
    /** Navn på rolleinnehaver hvis ident er ukjent. Gjelder kun barn som ikke inngår i beregning */
    navn?: string | null;
    /**
     * F.eks fødselsdato
     * @format date
     */
    fødselsdato?: string;
    erSlettet: boolean;
}

export interface OppdaterRollerResponse {
    status: OppdaterRollerResponseStatusEnum;
}

export interface SivilstandBeregnet {
    status: SivilstandBeregnetStatusEnum;
    sivilstandListe: SivilstandV1[];
}

export interface SivilstandV1 {
    /** @format date */
    periodeFom: string;
    /** @format date */
    periodeTom?: string;
    sivilstandskode: Sivilstandskode;
}

export interface OpprettBehandlingRequest {
    vedtakstype: Vedtakstype;
    /** @format date */
    søktFomDato: string;
    /** @format date */
    mottattdato: string;
    søknadFra: SoktAvType;
    /**
     * @minLength 7
     * @maxLength 7
     */
    saksnummer: string;
    /**
     * @minLength 4
     * @maxLength 4
     */
    behandlerenhet: string;
    /**
     * @maxItems 2147483647
     * @minItems 2
     * @uniqueItems true
     */
    roller: OpprettRolleDto[];
    stønadstype: Stonadstype;
    engangsbeløpstype: Engangsbeloptype;
    /** @format int64 */
    søknadsid: number;
    /** @format int64 */
    søknadsreferanseid?: number;
}

export interface OpprettBehandlingResponse {
    /** @format int64 */
    id: number;
}

export interface OpprettBehandlingFraVedtakRequest {
    vedtakstype: Vedtakstype;
    /** @format date */
    søktFomDato: string;
    /** @format date */
    mottattdato: string;
    søknadFra: SoktAvType;
    /**
     * @minLength 7
     * @maxLength 7
     */
    saksnummer: string;
    /**
     * @minLength 4
     * @maxLength 4
     */
    behandlerenhet: string;
    /** @format int64 */
    søknadsid: number;
    /** @format int64 */
    søknadsreferanseid?: number;
}

export interface ResultatBeregningBarnDto {
    barn: ResultatRolle;
    perioder: ResultatPeriodeDto[];
}

export interface ResultatPeriodeDto {
    periode: TypeArManedsperiode;
    beløp: number;
    resultatKode: Resultatkode;
    regel: string;
    sivilstand?: Sivilstandskode;
    inntekt: number;
    /** @format int32 */
    antallBarnIHusstanden: number;
}

export interface ResultatRolle {
    ident?: string;
    navn: string;
    /** @format date */
    fødselsdato: string;
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
    stonadType?: Stonadstype;
    engangsBelopType?: Engangsbeloptype;
    behandlingType?: string;
    soknadType?: string;
    soknadFra?: SoktAvType;
    vedtakType?: Vedtakstype;
    barnIBehandling: string[];
}

export interface ForsendelseRolleDto {
    fødselsnummer?: string;
    type: Rolletype;
}

export interface InitalizeForsendelseRequest {
    /**
     * @minLength 0
     * @maxLength 7
     */
    saksnummer: string;
    behandlingInfo: BehandlingInfoDto;
    enhet?: string;
    tema?: string;
    roller: ForsendelseRolleDto[];
    behandlingStatus?: InitalizeForsendelseRequestBehandlingStatusEnum;
}

export interface BeregningValideringsfeil {
    virkningstidspunkt?: VirkningstidspunktFeilDto;
    inntekter?: InntektValideringsfeilDto;
    husstandsbarn?: BoforholdPeriodeseringsfeil[];
    sivilstand?: SivilstandPeriodeseringsfeil;
    /** @uniqueItems true */
    måBekrefteNyeOpplysninger: OpplysningerType[];
}

export interface VirkningstidspunktFeilDto {
    manglerVirkningstidspunkt: boolean;
    manglerÅrsakEllerAvslag: boolean;
    virkningstidspunktKanIkkeVæreSenereEnnOpprinnelig: boolean;
}

export interface AddOpplysningerRequest {
    /** @format int64 */
    behandlingId: number;
    aktiv: boolean;
    grunnlagstype: OpplysningerType;
    /** data */
    data: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    hentetDato: string;
}

export interface GrunnlagsdataDto {
    /** @format int64 */
    id: number;
    /** @format int64 */
    behandlingsid: number;
    gjelder: string;
    grunnlagsdatatype: Grunnlagstype;
    data: string;
    /** @format date-time */
    innhentet: string;
}

export interface Grunnlagstype {
    type: OpplysningerType;
    erBearbeidet: boolean;
}

export interface ArbeidOgInntektLenkeRequest {
    /** @format int64 */
    behandlingId: number;
    ident: string;
}

/** Kilde/type for en behandlingsreferanse */
export enum BehandlingsrefKilde {
    BEHANDLING_ID = "BEHANDLING_ID",
    BISYSSOKNAD = "BISYS_SØKNAD",
    BISYSKLAGEREFSOKNAD = "BISYS_KLAGE_REF_SØKNAD",
}

/** Liste med referanser til alle behandlinger som ligger som grunnlag til vedtaket */
export interface BehandlingsreferanseDto {
    /** Kilde/type for en behandlingsreferanse */
    kilde: BehandlingsrefKilde;
    /** Kildesystemets referanse til behandlingen */
    referanse: string;
}

/** Angir om søknaden om engangsbeløp er besluttet avvist, stadfestet eller skal medføre endringGyldige verdier er 'AVVIST', 'STADFESTELSE' og 'ENDRING' */
export enum Beslutningstype {
    AVVIST = "AVVIST",
    STADFESTELSE = "STADFESTELSE",
    ENDRING = "ENDRING",
}

/** Liste over alle engangsbeløp som inngår i vedtaket */
export interface EngangsbelopDto {
    type: Engangsbeloptype;
    /** Referanse til sak */
    sak: string;
    /** Personidenten til den som skal betale engangsbeløpet */
    skyldner: string;
    /** Personidenten til den som krever engangsbeløpet */
    kravhaver: string;
    /** Personidenten til den som mottar engangsbeløpet */
    mottaker: string;
    /**
     * Beregnet engangsbeløp
     * @min 0
     */
    beløp?: number;
    /** Valutakoden tilhørende engangsbeløpet */
    valutakode: string;
    /** Resultatkoden tilhørende engangsbeløpet */
    resultatkode: string;
    /** Angir om engangsbeløpet skal innkreves */
    innkreving: Innkrevingstype;
    /** Angir om søknaden om engangsbeløp er besluttet avvist, stadfestet eller skal medføre endringGyldige verdier er 'AVVIST', 'STADFESTELSE' og 'ENDRING' */
    beslutning: Beslutningstype;
    /**
     * Id for vedtaket det er klaget på. Utgjør sammen med referanse en unik id for et engangsbeløp
     * @format int32
     */
    omgjørVedtakId?: number;
    /** Referanse til engangsbeløp, brukes for å kunne omgjøre engangsbeløp senere i et klagevedtak. Unik innenfor et vedtak.Referansen er enten angitt i requesten for opprettelse av vedtak eller generert av bidrag-vedtak hvis den ikke var angitt i requesten. */
    referanse: string;
    /** Referanse - delytelsesId/beslutningslinjeId -> bidrag-regnskap. Skal fjernes senere */
    delytelseId?: string;
    /** Referanse som brukes i utlandssaker */
    eksternReferanse?: string;
    /** Liste over alle grunnlag som inngår i beregningen */
    grunnlagReferanseListe: string[];
}

/** Grunnlag */
export interface GrunnlagDto {
    /** Referanse (unikt navn på grunnlaget) */
    referanse: string;
    type: Grunnlagstype;
    /** Grunnlagsinnhold (generisk) */
    innhold: JsonNode;
    /** Liste over grunnlagsreferanser */
    grunnlagsreferanseListe: string[];
    /** Referanse til personobjektet grunnlaget gjelder */
    gjelderReferanse?: string;
}

/** Angir om engangsbeløpet skal innkreves */
export enum Innkrevingstype {
    MED_INNKREVING = "MED_INNKREVING",
    UTEN_INNKREVING = "UTEN_INNKREVING",
}

/** Grunnlagsinnhold (generisk) */
export type JsonNode = object;

/** Liste over alle stønadsendringer som inngår i vedtaket */
export interface StonadsendringDto {
    type: Stonadstype;
    /** Referanse til sak */
    sak: string;
    /** Personidenten til den som skal betale bidraget */
    skyldner: string;
    /** Personidenten til den som krever bidraget */
    kravhaver: string;
    /** Personidenten til den som mottar bidraget */
    mottaker: string;
    /**
     * Angir første år en stønad skal indeksreguleres
     * @format int32
     */
    førsteIndeksreguleringsår?: number;
    /** Angir om engangsbeløpet skal innkreves */
    innkreving: Innkrevingstype;
    /** Angir om søknaden om engangsbeløp er besluttet avvist, stadfestet eller skal medføre endringGyldige verdier er 'AVVIST', 'STADFESTELSE' og 'ENDRING' */
    beslutning: Beslutningstype;
    /**
     * Id for vedtaket det er klaget på
     * @format int32
     */
    omgjørVedtakId?: number;
    /** Referanse som brukes i utlandssaker */
    eksternReferanse?: string;
    /** Liste over grunnlag som er knyttet direkte til stønadsendringen */
    grunnlagReferanseListe: string[];
    /** Liste over alle perioder som inngår i stønadsendringen */
    periodeListe: VedtakPeriodeDto[];
}

export interface VedtakDto {
    /** Hva er kilden til vedtaket. Automatisk eller manuelt */
    kilde: VedtakDtoKildeEnum;
    type: Vedtakstype;
    /** Id til saksbehandler eller batchjobb som opprettet vedtaket. For saksbehandler er ident hentet fra token */
    opprettetAv: string;
    /** Saksbehandlers navn */
    opprettetAvNavn?: string;
    /** Navn på applikasjon som vedtaket er opprettet i */
    kildeapplikasjon: string;
    /**
     * Tidspunkt/timestamp når vedtaket er fattet
     * @format date-time
     */
    vedtakstidspunkt: string;
    /** Enheten som er ansvarlig for vedtaket. Kan være null for feks batch */
    enhetsnummer?: string;
    /**
     * Settes hvis overføring til Elin skal utsettes
     * @format date
     */
    innkrevingUtsattTilDato?: string;
    /** Settes hvis vedtaket er fastsatt i utlandet */
    fastsattILand?: string;
    /**
     * Tidspunkt vedtaket er fattet
     * @format date-time
     */
    opprettetTidspunkt: string;
    /** Liste over alle grunnlag som inngår i vedtaket */
    grunnlagListe: GrunnlagDto[];
    /** Liste over alle stønadsendringer som inngår i vedtaket */
    stønadsendringListe: StonadsendringDto[];
    /** Liste over alle engangsbeløp som inngår i vedtaket */
    engangsbeløpListe: EngangsbelopDto[];
    /** Liste med referanser til alle behandlinger som ligger som grunnlag til vedtaket */
    behandlingsreferanseListe: BehandlingsreferanseDto[];
}

/** Liste over alle perioder som inngår i stønadsendringen */
export interface VedtakPeriodeDto {
    periode: TypeArManedsperiode;
    /**
     * Beregnet stønadsbeløp
     * @min 0
     */
    beløp?: number;
    /** Valutakoden tilhørende stønadsbeløpet */
    valutakode?: string;
    /** Resultatkoden tilhørende stønadsbeløpet */
    resultatkode: string;
    /** Referanse - delytelseId/beslutningslinjeId -> bidrag-regnskap. Skal fjernes senere */
    delytelseId?: string;
    /** Liste over alle grunnlag som inngår i perioden */
    grunnlagReferanseListe: string[];
}

export interface Arbeidsforhold {
    periode: TypeArManedsperiode;
    arbeidsgiver: string;
    stillingProsent?: string;
    /** @format date */
    lønnsendringDato?: string;
}

export interface Boforhold {
    barn: BoforholdBarn[];
    sivilstand: SivilstandNotat;
    notat: Notat;
}

export interface BoforholdBarn {
    gjelder: PersonNotatDto;
    medIBehandling: boolean;
    kilde: Kilde;
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretBostatuskode[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningBostatuskode[];
}

export interface Inntekter {
    inntekterPerRolle: InntekterPerRolle[];
    notat: Notat;
}

export interface InntekterPerRolle {
    gjelder: PersonNotatDto;
    arbeidsforhold: Arbeidsforhold[];
    årsinntekter: NotatInntektDto[];
    barnetillegg: NotatInntektDto[];
    utvidetBarnetrygd: NotatInntektDto[];
    småbarnstillegg: NotatInntektDto[];
    kontantstøtte: NotatInntektDto[];
    beregnetInntekter: NotatBeregnetInntektDto[];
}

export interface Notat {
    medIVedtaket?: string;
    intern?: string;
}

export interface NotatBeregnetInntektDto {
    gjelderBarn: PersonNotatDto;
    summertInntektListe: DelberegningSumInntekt[];
}

export interface NotatDto {
    saksnummer: string;
    saksbehandlerNavn?: string;
    virkningstidspunkt: Virkningstidspunkt;
    boforhold: Boforhold;
    roller: PersonNotatDto[];
    inntekter: Inntekter;
    vedtak: Vedtak;
}

export interface NotatInntektDto {
    periode?: TypeArManedsperiode;
    opprinneligPeriode?: TypeArManedsperiode;
    beløp: number;
    kilde: Kilde;
    /** Inntektsrapportering typer på inntekter som overlapper */
    type: Inntektsrapportering;
    medIBeregning: boolean;
    gjelderBarn?: PersonNotatDto;
    inntektsposter: NotatInntektspostDto[];
    visningsnavn: string;
}

export interface NotatInntektspostDto {
    kode?: string;
    /** Inntektstyper som inntektene har felles. Det der dette som bestemmer hvilken inntekter som overlapper. */
    inntektstype?: Inntektstype;
    beløp: number;
    visningsnavn?: string;
}

export interface NotatResultatBeregningBarnDto {
    barn: PersonNotatDto;
    perioder: NotatResultatPeriodeDto[];
}

export interface NotatResultatPeriodeDto {
    periode: TypeArManedsperiode;
    beløp: number;
    resultatKode: Resultatkode;
    regel: string;
    sivilstand?: Sivilstandskode;
    inntekt: number;
    /** @format int32 */
    antallBarnIHusstanden: number;
    sivilstandVisningsnavn?: string;
    resultatKodeVisningsnavn: string;
}

export interface OpplysningerBruktTilBeregningBostatuskode {
    periode: TypeArManedsperiode;
    status: Bostatuskode;
    kilde: Kilde;
    statusVisningsnavn?: string;
}

export interface OpplysningerBruktTilBeregningSivilstandskode {
    periode: TypeArManedsperiode;
    status: Sivilstandskode;
    kilde: Kilde;
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretBostatuskode {
    periode: TypeArManedsperiode;
    status?: Bostatuskode;
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretSivilstandskodePDL {
    periode: TypeArManedsperiode;
    /** Type sivilstand fra PDL */
    status?: SivilstandskodePDL;
    statusVisningsnavn?: string;
}

export interface PersonNotatDto {
    rolle?: Rolletype;
    navn?: string;
    /** @format date */
    fødselsdato?: string;
    ident?: string;
}

export interface SivilstandNotat {
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretSivilstandskodePDL[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningSivilstandskode[];
}

export interface Vedtak {
    erFattet: boolean;
    fattetAvSaksbehandler?: string;
    /** @format date-time */
    fattetTidspunkt?: string;
    resultat: NotatResultatBeregningBarnDto[];
}

export interface Virkningstidspunkt {
    søknadstype?: string;
    vedtakstype?: Vedtakstype;
    søktAv?: SoktAvType;
    /** @format date */
    mottattDato?: string;
    /** @format date */
    søktFraDato?: string;
    /** @format date */
    virkningstidspunkt?: string;
    årsak?: TypeArsakstype;
    avslag?: Resultatkode;
    notat: Notat;
    årsakVisningsnavn?: string;
    avslagVisningsnavn?: string;
}

export enum AnsettelsesdetaljerMonthEnum {
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

export enum AnsettelsesdetaljerMonthEnum1 {
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

export enum SivilstandIkkeAktivGrunnlagDtoStatusEnum {
    OK = "OK",
    MANGLENDE_DATOINFORMASJON = "MANGLENDE_DATOINFORMASJON",
    LOGISK_FEIL_I_TIDSLINJE = "LOGISK_FEIL_I_TIDSLINJE",
    ALLE_FOREKOMSTER_ER_HISTORISKE = "ALLE_FOREKOMSTER_ER_HISTORISKE",
    SIVILSTANDSTYPE_MANGLER = "SIVILSTANDSTYPE_MANGLER",
}

export enum OppdaterRollerResponseStatusEnum {
    BEHANDLING_SLETTET = "BEHANDLING_SLETTET",
    ROLLER_OPPDATERT = "ROLLER_OPPDATERT",
}

export enum SivilstandBeregnetStatusEnum {
    OK = "OK",
    MANGLENDE_DATOINFORMASJON = "MANGLENDE_DATOINFORMASJON",
    LOGISK_FEIL_I_TIDSLINJE = "LOGISK_FEIL_I_TIDSLINJE",
    ALLE_FOREKOMSTER_ER_HISTORISKE = "ALLE_FOREKOMSTER_ER_HISTORISKE",
    SIVILSTANDSTYPE_MANGLER = "SIVILSTANDSTYPE_MANGLER",
}

export enum InitalizeForsendelseRequestBehandlingStatusEnum {
    OPPRETTET = "OPPRETTET",
    ENDRET = "ENDRET",
    FEILREGISTRERT = "FEILREGISTRERT",
}

/** Hva er kilden til vedtaket. Automatisk eller manuelt */
export enum VedtakDtoKildeEnum {
    MANUELT = "MANUELT",
    AUTOMATISK = "AUTOMATISK",
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

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
        this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:8990" });
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
 * @baseUrl http://localhost:8990
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    api = {
        /**
         * @description Hente en behandling
         *
         * @tags behandling-controller-v-2
         * @name HenteBehandlingV2
         * @request GET:/api/v2/behandling/{behandlingsid}
         * @secure
         */
        henteBehandlingV2: (behandlingsid: number, params: RequestParams = {}) =>
            this.request<BehandlingDtoV2, BehandlingDtoV2>({
                path: `/api/v2/behandling/${behandlingsid}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere behandling
         *
         * @tags behandling-controller-v-2
         * @name OppdatereBehandlingV2
         * @request PUT:/api/v2/behandling/{behandlingsid}
         * @secure
         */
        oppdatereBehandlingV2: (behandlingsid: number, data: OppdaterBehandlingRequestV2, params: RequestParams = {}) =>
            this.request<BehandlingDtoV2, BehandlingDtoV2>({
                path: `/api/v2/behandling/${behandlingsid}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Logisk slett en behandling
         *
         * @tags behandling-controller-v-2
         * @name SlettBehandling
         * @request DELETE:/api/v2/behandling/{behandlingsid}
         * @secure
         */
        slettBehandling: (behandlingsid: number, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/api/v2/behandling/${behandlingsid}`,
                method: "DELETE",
                secure: true,
                ...params,
            }),

        /**
         * @description Oppdatere inntekt for behandling. Returnerer inntekt som ble endret, opprettet, eller slettet.
         *
         * @tags behandling-controller-v-2
         * @name OppdatereInntekt
         * @request PUT:/api/v2/behandling/{behandlingsid}/inntekt
         * @secure
         */
        oppdatereInntekt: (behandlingsid: number, data: OppdatereInntektRequest, params: RequestParams = {}) =>
            this.request<OppdatereInntektResponse, OppdatereInntektResponse>({
                path: `/api/v2/behandling/${behandlingsid}/inntekt`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere boforhold for behandling. Returnerer boforhold som ble endret, opprettet, eller slettet.
         *
         * @tags behandling-controller-v-2
         * @name OppdatereBoforhold
         * @request PUT:/api/v2/behandling/{behandlingsid}/boforhold
         * @secure
         */
        oppdatereBoforhold: (behandlingsid: number, data: OppdatereBoforholdRequestV2, params: RequestParams = {}) =>
            this.request<OppdatereBoforholdResponse, OppdatereBoforholdResponse>({
                path: `/api/v2/behandling/${behandlingsid}/boforhold`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Aktivere grunnlag for behandling. Returnerer grunnlag som ble aktivert.
         *
         * @tags behandling-controller-v-2
         * @name AktivereGrunnlag
         * @request PUT:/api/v2/behandling/{behandlingsid}/aktivere
         * @secure
         */
        aktivereGrunnlag: (behandlingsid: number, data: AktivereGrunnlagRequestV2, params: RequestParams = {}) =>
            this.request<AktivereGrunnlagResponseV2, AktivereGrunnlagResponseV2>({
                path: `/api/v2/behandling/${behandlingsid}/aktivere`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdater roller i behandling
         *
         * @tags behandling-controller-v-2
         * @name OppdaterRoller
         * @request PUT:/api/v2/behandling/{behandlingId}/roller
         * @secure
         */
        oppdaterRoller: (behandlingId: number, data: OppdaterRollerRequest, params: RequestParams = {}) =>
            this.request<OppdaterRollerResponse, any>({
                path: `/api/v2/behandling/${behandlingId}/roller`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags databehandler-controller
         * @name KonverterSivilstand
         * @request POST:/api/v2/databehandler/sivilstand/{behandlingId}
         * @deprecated
         * @secure
         */
        konverterSivilstand: (behandlingId: number, data: SivilstandGrunnlagDto[], params: RequestParams = {}) =>
            this.request<SivilstandBeregnet, any>({
                path: `/api/v2/databehandler/sivilstand/${behandlingId}`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
 * @description Opprett ny behandling
 *
 * @tags behandling-controller-v-2
 * @name OppretteBehandling
 * @summary 
            Oppretter ny behandlding. 
            Hvis det finnes en behandling fra før med samme søknadsid i forespørsel 
            vil id for den behandlingen returneres istedenfor at det opprettes ny
 * @request POST:/api/v2/behandling
 * @secure
 */
        oppretteBehandling: (data: OpprettBehandlingRequest, params: RequestParams = {}) =>
            this.request<OpprettBehandlingResponse, OpprettBehandlingResponse>({
                path: `/api/v2/behandling`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Opprett behandling fra vedtak. Brukes når det skal opprettes klagebehanling fra vedtak.
         *
         * @tags behandling-controller-v-2
         * @name OpprettBehandlingForVedtak
         * @request POST:/api/v2/behandling/vedtak/{refVedtaksId}
         * @secure
         */
        opprettBehandlingForVedtak: (
            refVedtaksId: number,
            data: OpprettBehandlingFraVedtakRequest,
            params: RequestParams = {}
        ) =>
            this.request<OpprettBehandlingResponse, any>({
                path: `/api/v2/behandling/vedtak/${refVedtaksId}`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Fatte vedtak for behandling
         *
         * @tags vedtak-controller
         * @name FatteVedtak
         * @request POST:/api/v2/behandling/fattevedtak/{behandlingsid}
         * @secure
         */
        fatteVedtak: (behandlingsid: number, params: RequestParams = {}) =>
            this.request<number, any>({
                path: `/api/v2/behandling/fattevedtak/${behandlingsid}`,
                method: "POST",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Beregn forskudd
         *
         * @tags behandling-beregn-controller
         * @name HentVedtakBeregningResultat
         * @request POST:/api/v1/vedtak/{vedtaksId}/beregn
         * @secure
         */
        hentVedtakBeregningResultat: (vedtaksId: number, params: RequestParams = {}) =>
            this.request<ResultatBeregningBarnDto[], any>({
                path: `/api/v1/vedtak/${vedtaksId}/beregn`,
                method: "POST",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags notat-opplysninger-controller
         * @name HentNotatOpplysninger
         * @request GET:/api/v1/notat/{behandlingId}
         * @secure
         */
        hentNotatOpplysninger: (behandlingId: number, params: RequestParams = {}) =>
            this.request<NotatDto, any>({
                path: `/api/v1/notat/${behandlingId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags notat-opplysninger-controller
         * @name OpprettNotat
         * @request POST:/api/v1/notat/{behandlingId}
         * @secure
         */
        opprettNotat: (behandlingId: number, params: RequestParams = {}) =>
            this.request<void, any>({
                path: `/api/v1/notat/${behandlingId}`,
                method: "POST",
                secure: true,
                ...params,
            }),

        /**
         * @description Oppretter forsendelse for behandling eller vedtak. Skal bare benyttes hvis vedtakId eller behandlingId mangler for behandling (Søknad som behandles gjennom Bisys)
         *
         * @tags forsendelse-controller
         * @name OpprettForsendelse
         * @request POST:/api/v1/forsendelse/init
         * @secure
         */
        opprettForsendelse: (data: InitalizeForsendelseRequest, params: RequestParams = {}) =>
            this.request<string[], any>({
                path: `/api/v1/forsendelse/init`,
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
         * @tags behandling-beregn-controller
         * @name BeregnForskudd
         * @request POST:/api/v1/behandling/{behandlingsid}/beregn
         * @secure
         */
        beregnForskudd: (behandlingsid: number, params: RequestParams = {}) =>
            this.request<ResultatBeregningBarnDto[], BeregningValideringsfeil>({
                path: `/api/v1/behandling/${behandlingsid}/beregn`,
                method: "POST",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Legge til nye opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name LeggTilOpplysninger
         * @request POST:/api/v1/behandling/{behandlingId}/opplysninger
         * @deprecated
         * @secure
         */
        leggTilOpplysninger: (behandlingId: number, data: AddOpplysningerRequest, params: RequestParams = {}) =>
            this.request<GrunnlagsdataDto, GrunnlagsdataDto>({
                path: `/api/v1/behandling/${behandlingId}/opplysninger`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Generer lenke for ainntekt-søk med filter for behandling og personident oppgitt i forespørsel
         *
         * @tags arbeid-og-inntekt-controller
         * @name GenererAinntektLenke
         * @request POST:/api/v1/arbeidoginntekt/ainntekt
         * @secure
         */
        genererAinntektLenke: (data: ArbeidOgInntektLenkeRequest, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v1/arbeidoginntekt/ainntekt`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Generer lenke for aareg-søk for personident oppgitt i forespørsel
         *
         * @tags arbeid-og-inntekt-controller
         * @name GenererAaregLenke
         * @request POST:/api/v1/arbeidoginntekt/aareg
         * @secure
         */
        genererAaregLenke: (data: string, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v1/arbeidoginntekt/aareg`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Simuler vedtakstruktur for en behandling. Brukes for testing av grunnlagsstruktur uten å faktisk fatte vedtak
         *
         * @tags vedtak-simulering-controller
         * @name BehandlingTilVedtak
         * @request GET:/api/v2/simulervedtak/{behandlingId}
         * @secure
         */
        behandlingTilVedtak: (behandlingId: number, params: RequestParams = {}) =>
            this.request<VedtakDto, any>({
                path: `/api/v2/simulervedtak/${behandlingId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Hent vedtak som behandling for lesemodus. Vedtak vil bli konvertert til behandling uten lagring
         *
         * @tags behandling-controller-v-2
         * @name VedtakLesemodus
         * @request GET:/api/v2/behandling/vedtak/{vedtakId}
         * @secure
         */
        vedtakLesemodus: (vedtakId: number, params: RequestParams = {}) =>
            this.request<BehandlingDtoV2, BehandlingDtoV2>({
                path: `/api/v2/behandling/vedtak/${vedtakId}`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags visningsnavn-controller
         * @name HentVisningsnavn
         * @request GET:/api/v1/visningsnavn
         * @secure
         */
        hentVisningsnavn: (params: RequestParams = {}) =>
            this.request<Record<string, string>, any>({
                path: `/api/v1/visningsnavn`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),
    };
}
