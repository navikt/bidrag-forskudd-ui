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

export interface AndreVoksneIHusstandenDetaljerDto {
    navn: string;
    /** @format date */
    fødselsdato?: string;
    harRelasjonTilBp: boolean;
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
    andreVoksneIHusstanden?: NotatAndreVoksneIHusstanden;
    sivilstand: NotatSivilstand;
    notat: SaksbehandlerNotat;
}

export interface BoforholdBarn {
    gjelder: PersonNotatDto;
    medIBehandling: boolean;
    kilde: Kilde;
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeUnit[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningBostatuskode[];
}

export enum Bostatuskode {
    MED_FORELDER = "MED_FORELDER",
    DOKUMENTERT_SKOLEGANG = "DOKUMENTERT_SKOLEGANG",
    IKKE_MED_FORELDER = "IKKE_MED_FORELDER",
    DELT_BOSTED = "DELT_BOSTED",
    REGNES_IKKE_SOM_BARN = "REGNES_IKKE_SOM_BARN",
    BOR_MED_ANDRE_VOKSNE = "BOR_MED_ANDRE_VOKSNE",
    BOR_IKKE_MED_ANDRE_VOKSNE = "BOR_IKKE_MED_ANDRE_VOKSNE",
    UNNTAK_HOS_ANDRE = "UNNTAK_HOS_ANDRE",
    UNNTAK_ALENE = "UNNTAK_ALENE",
    UNNTAKENSLIGASYLSOKER = "UNNTAK_ENSLIG_ASYLSØKER",
    MED_VERGE = "MED_VERGE",
    ALENE = "ALENE",
}

export interface DelberegningSumInntekt {
    periode: TypeArManedsperiode;
    totalinntekt: number;
    kontantstøtte?: number;
    skattepliktigInntekt?: number;
    barnetillegg?: number;
    utvidetBarnetrygd?: number;
    småbarnstillegg?: number;
}

export interface Inntekter {
    inntekterPerRolle: InntekterPerRolle[];
    offentligeInntekterPerRolle: InntekterPerRolle[];
    notat: SaksbehandlerNotat;
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
    AINNTEKT_KORRIGERT_FOR_BARNETILLEGG = "AINNTEKT_KORRIGERT_FOR_BARNETILLEGG",
    BARNETRYGD_MANUELL_VURDERING = "BARNETRYGD_MANUELL_VURDERING",
    BARNS_SYKDOM = "BARNS_SYKDOM",
    DOKUMENTASJONMANGLERSKJONN = "DOKUMENTASJON_MANGLER_SKJØNN",
    FORDELSAeRFRADRAGENSLIGFORSORGER = "FORDEL_SÆRFRADRAG_ENSLIG_FORSØRGER",
    FODSELADOPSJON = "FØDSEL_ADOPSJON",
    INNTEKTSOPPLYSNINGER_FRA_ARBEIDSGIVER = "INNTEKTSOPPLYSNINGER_FRA_ARBEIDSGIVER",
    LIGNINGSOPPLYSNINGER_MANGLER = "LIGNINGSOPPLYSNINGER_MANGLER",
    LIGNING_FRA_SKATTEETATEN = "LIGNING_FRA_SKATTEETATEN",
    LONNSOPPGAVEFRASKATTEETATEN = "LØNNSOPPGAVE_FRA_SKATTEETATEN",
    LONNSOPPGAVEFRASKATTEETATENKORRIGERTFORBARNETILLEGG = "LØNNSOPPGAVE_FRA_SKATTEETATEN_KORRIGERT_FOR_BARNETILLEGG",
    MANGLENDEBRUKAVEVNESKJONN = "MANGLENDE_BRUK_AV_EVNE_SKJØNN",
    NETTO_KAPITALINNTEKT = "NETTO_KAPITALINNTEKT",
    PENSJON_KORRIGERT_FOR_BARNETILLEGG = "PENSJON_KORRIGERT_FOR_BARNETILLEGG",
    REHABILITERINGSPENGER = "REHABILITERINGSPENGER",
    SKATTEGRUNNLAG_KORRIGERT_FOR_BARNETILLEGG = "SKATTEGRUNNLAG_KORRIGERT_FOR_BARNETILLEGG",
}

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

export interface NotatAndreVoksneIHusstanden {
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeListAndreVoksneIHusstandenDetaljerDto[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningBostatuskode[];
}

export interface NotatBehandlingDetaljer {
    søknadstype?: string;
    vedtakstype?: Vedtakstype;
    kategori?: NotatSaerbidragKategoriDto;
    søktAv?: SoktAvType;
    /** @format date */
    mottattDato?: string;
    søktFraDato?: {
        /** @format int32 */
        year?: number;
        month?: NotatBehandlingDetaljerMonthEnum;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** @format date */
    virkningstidspunkt?: string;
    avslag?: Resultatkode;
    avslagVisningsnavn?: string;
    kategoriVisningsnavn?: string;
}

export interface NotatBeregnetInntektDto {
    gjelderBarn: PersonNotatDto;
    summertInntektListe: DelberegningSumInntekt[];
}

export interface NotatDto {
    type: NotatMalType;
    saksnummer: string;
    behandling: NotatBehandlingDetaljer;
    saksbehandlerNavn?: string;
    virkningstidspunkt: Virkningstidspunkt;
    utgift?: NotatSaerbidragUtgifterDto;
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
    type: Inntektsrapportering;
    medIBeregning: boolean;
    gjelderBarn?: PersonNotatDto;
    inntektsposter: NotatInntektspostDto[];
    visningsnavn: string;
}

export interface NotatInntektspostDto {
    kode?: string;
    inntektstype?: Inntektstype;
    beløp: number;
    visningsnavn?: string;
}

export enum NotatMalType {
    FORSKUDD = "FORSKUDD",
    SAeRBIDRAG = "SÆRBIDRAG",
    BIDRAG = "BIDRAG",
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
    vedtakstype?: Vedtakstype;
    /** @format int32 */
    antallBarnIHusstanden: number;
    sivilstandVisningsnavn?: string;
    resultatKodeVisningsnavn: string;
}

export interface NotatSivilstand {
    opplysningerFraFolkeregisteret: OpplysningerFraFolkeregisteretMedDetaljerSivilstandskodePDLUnit[];
    opplysningerBruktTilBeregning: OpplysningerBruktTilBeregningSivilstandskode[];
}

export interface NotatSaerbidragKategoriDto {
    kategori: Saerbidragskategori;
    beskrivelse?: string;
}

export interface NotatSaerbidragUtgifterDto {
    beregning?: NotatUtgiftBeregningDto;
    notat: SaksbehandlerNotat;
    utgifter: NotatUtgiftspostDto[];
}

export interface NotatUtgiftBeregningDto {
    /** Beløp som er direkte betalt av BP */
    beløpDirekteBetaltAvBp: number;
    /** Summen av godkjente beløp som brukes for beregningen */
    totalGodkjentBeløp: number;
    /** Summen av godkjente beløp som brukes for beregningen */
    totalGodkjentBeløpBp?: number;
    /** Summen av godkjent beløp for utgifter BP har betalt plus beløp som er direkte betalt av BP */
    totalBeløpBetaltAvBp: number;
}

export interface NotatUtgiftspostDto {
    /**
     * Når utgifter gjelder. Kan være feks dato på kvittering
     * @format date
     */
    dato: string;
    /** Type utgift. Kan feks være hva som ble kjøpt for kravbeløp (bugnad, klær, sko, etc) */
    type: Utgiftstype | string;
    /** Beløp som er betalt for utgiften det gjelder */
    kravbeløp: number;
    /** Beløp som er godkjent for beregningen */
    godkjentBeløp: number;
    /** Begrunnelse for hvorfor godkjent beløp avviker fra kravbeløp. Må settes hvis godkjent beløp er ulik kravbeløp */
    begrunnelse?: string;
    /** Om utgiften er betalt av BP */
    betaltAvBp: boolean;
    utgiftstypeVisningsnavn: string;
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

export interface OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeListAndreVoksneIHusstandenDetaljerDto {
    periode: TypeArManedsperiode;
    status?: Bostatuskode;
    detaljer?: AndreVoksneIHusstandenDetaljerDto[];
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretMedDetaljerBostatuskodeUnit {
    periode: TypeArManedsperiode;
    status?: Bostatuskode;
    detaljer?: Unit;
    statusVisningsnavn?: string;
}

export interface OpplysningerFraFolkeregisteretMedDetaljerSivilstandskodePDLUnit {
    periode: TypeArManedsperiode;
    status?: SivilstandskodePDL;
    detaljer?: Unit;
    statusVisningsnavn?: string;
}

export interface PersonNotatDto {
    rolle?: Rolletype;
    navn?: string;
    /** @format date */
    fødselsdato?: string;
    ident?: string;
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
    SAeRBIDRAGINNVILGET = "SÆRBIDRAG_INNVILGET",
    SAeRTILSKUDDIKKEFULLBIDRAGSEVNE = "SÆRTILSKUDD_IKKE_FULL_BIDRAGSEVNE",
    SAeRBIDRAGIKKEFULLBIDRAGSEVNE = "SÆRBIDRAG_IKKE_FULL_BIDRAGSEVNE",
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
    AVSLAG_PRIVAT_AVTALE_BIDRAG = "AVSLAG_PRIVAT_AVTALE_BIDRAG",
    IKKESOKTOMINNKREVINGAVBIDRAG = "IKKE_SØKT_OM_INNKREVING_AV_BIDRAG",
    IKKE_INNKREVING_AV_BIDRAG = "IKKE_INNKREVING_AV_BIDRAG",
    UTGIFTER_DEKKES_AV_BARNEBIDRAGET = "UTGIFTER_DEKKES_AV_BARNEBIDRAGET",
    IKKENODVENDIGEUTGIFTER = "IKKE_NØDVENDIGE_UTGIFTER",
    PRIVATAVTALEOMSAeRBIDRAG = "PRIVAT_AVTALE_OM_SÆRBIDRAG",
    ALLE_UTGIFTER_ER_FORELDET = "ALLE_UTGIFTER_ER_FORELDET",
}

export enum Rolletype {
    BA = "BA",
    BM = "BM",
    BP = "BP",
    FR = "FR",
    RM = "RM",
}

export interface SaksbehandlerNotat {
    medIVedtaket?: string;
    intern?: string;
}

export enum Sivilstandskode {
    GIFT_SAMBOER = "GIFT_SAMBOER",
    BOR_ALENE_MED_BARN = "BOR_ALENE_MED_BARN",
    ENSLIG = "ENSLIG",
    SAMBOER = "SAMBOER",
    UKJENT = "UKJENT",
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

export enum Saerbidragskategori {
    KONFIRMASJON = "KONFIRMASJON",
    TANNREGULERING = "TANNREGULERING",
    OPTIKK = "OPTIKK",
    ANNET = "ANNET",
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

export type Unit = object;

export enum Utgiftstype {
    KONFIRMASJONSAVGIFT = "KONFIRMASJONSAVGIFT",
    KONFIRMASJONSLEIR = "KONFIRMASJONSLEIR",
    SELSKAP = "SELSKAP",
    KLAeR = "KLÆR",
    REISEUTGIFT = "REISEUTGIFT",
    TANNREGULERING = "TANNREGULERING",
    OPTIKK = "OPTIKK",
    ANNET = "ANNET",
}

export interface Vedtak {
    erFattet: boolean;
    fattetAvSaksbehandler?: string;
    /** @format date-time */
    fattetTidspunkt?: string;
    resultat: NotatResultatBeregningBarnDto[];
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
    avslag?: Resultatkode;
    årsak?: TypeArsakstype;
    notat: SaksbehandlerNotat;
    avslagVisningsnavn?: string;
    årsakVisningsnavn?: string;
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
    FRAMANEDENETTERIPAVENTEAVBIDRAGSSAK = "FRA_MÅNEDEN_ETTER_I_PÅVENTE_AV_BIDRAGSSAK",
}

export interface MediaType {
    type?: string;
    subtype?: string;
    parameters?: Record<string, string>;
    /** @format double */
    qualityValue?: number;
    wildcardSubtype?: boolean;
    subtypeSuffix?: string;
    charset?: string;
    wildcardType?: boolean;
    concrete?: boolean;
}

export enum NotatBehandlingDetaljerMonthEnum {
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
        this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:8183" });
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
 * @baseUrl http://localhost:8183
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    api = {
        /**
         * No description
         *
         * @tags produser-notat-api-v-2
         * @name GeneratePdf
         * @request POST:/api/v2/notat/pdf
         */
        generatePdf: (data: NotatDto, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/notat/pdf`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-notat-api-v-2
         * @name GenerateHtml
         * @request POST:/api/v2/notat/html
         */
        generateHtml: (data: NotatDto, params: RequestParams = {}) =>
            this.request<string, any>({
                path: `/api/v2/notat/html`,
                method: "POST",
                body: data,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags produser-notat-api
         * @name GeneratePdf1
         * @request POST:/api/notat/pdf/{dokumentmal}
         */
        generatePdf1: (dokumentmal: string, data: NotatDto, params: RequestParams = {}) =>
            this.request<string, any>({
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
         * @name GenerateHtml1
         * @request POST:/api/notat/html/{dokumentmal}
         */
        generateHtml1: (dokumentmal: string, data: NotatDto, params: RequestParams = {}) =>
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
        image: (data: Unit, params: RequestParams = {}) =>
            this.request<Unit, any>({
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
            this.request<Unit, any>({
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
        generateHtmlFromSample: (category: string, dokumentmal: string, params: RequestParams = {}) =>
            this.request<Unit, any>({
                path: `/api/genhtml/${category}/${dokumentmal}`,
                method: "GET",
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
            this.request<Unit, any>({
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
        generatePdfFromSample: (category: string, dokumentmal: string, params: RequestParams = {}) =>
            this.request<Unit, any>({
                path: `/api/genpdf/${category}/${dokumentmal}`,
                method: "GET",
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-pdf-controller
         * @name GeneratePdfFromSample2
         * @request GET:/api/genpdf/old/{category}/{dokumentmal}
         */
        generatePdfFromSample2: (category: string, dokumentmal: string, params: RequestParams = {}) =>
            this.request<Unit, any>({
                path: `/api/genpdf/old/${category}/${dokumentmal}`,
                method: "GET",
                ...params,
            }),

        /**
         * No description
         *
         * @tags gen-html-controller
         * @name GenerateHtmlFromSampleOld
         * @request GET:/api/genhtml/old/{category}/{dokumentmal}
         */
        generateHtmlFromSampleOld: (category: string, dokumentmal: string, params: RequestParams = {}) =>
            this.request<Unit, any>({
                path: `/api/genhtml/old/${category}/${dokumentmal}`,
                method: "GET",
                ...params,
            }),
    };
}
