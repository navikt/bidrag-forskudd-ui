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
export interface ArbeidOgInntektLenkeRequest {
    /** @format int64 */
    behandlingId: number;
    ident: string;
}
export interface Barnetillegg {
    behandling: Behandling;
    ident: string;
    barnetillegg: number;
    /** @format date-time */
    datoFom?: string;
    /** @format date-time */
    datoTom?: string;
    /** @format int64 */
    id?: number;
}

export interface Behandling {
    behandlingType: Behandlingstype;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    /** @format date-time */
    mottatDato: string;
    saksnummer: string;
    /** @format int64 */
    soknadId: number;
    /** @format int64 */
    soknadRefId?: number;
    behandlerEnhet: string;
    opprettetAv: string;
    opprettetAvNavn?: string;
    kildeapplikasjon: string;
    soknadFra: SoktAvType;
    stonadType?: Stonadstype;
    engangsbelopType?: Engangsbeloptype;
    /** @format int64 */
    vedtakId?: number;
    /** @format date-time */
    virkningsDato?: string;
    aarsak?: ForskuddAarsakType;
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
    /** @format int64 */
    id?: number;
    /** @format int64 */
    grunnlagspakkeId?: number;
    /** @uniqueItems true */
    roller: Rolle[];
    /** @uniqueItems true */
    husstandsBarn: HusstandsBarn[];
    /** @uniqueItems true */
    inntekter: Inntekt[];
    /** @uniqueItems true */
    sivilstand: Sivilstand[];
    /** @uniqueItems true */
    barnetillegg: Barnetillegg[];
    /** @uniqueItems true */
    utvidetbarnetrygd: Utvidetbarnetrygd[];
    deleted: boolean;
    søknadsBarn: Rolle[];
}

export enum Behandlingstype {
    BIDRAG = "BIDRAG",
    FORSKUDD = "FORSKUDD",
    BIDRAG18AAR = "BIDRAG18AAR",
    EKTEFELLEBIDRAG = "EKTEFELLEBIDRAG",
    MOTREGNING = "MOTREGNING",
    OPPFOSTRINGSBIDRAG = "OPPFOSTRINGSBIDRAG",
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

export enum ForskuddAarsakType {
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

export interface HusstandsBarn {
    behandling: Behandling;
    medISaken: boolean;
    /** @format int64 */
    id?: number;
    ident?: string;
    navn?: string;
    /** @format date-time */
    foedselsDato?: string;
    /** @uniqueItems true */
    perioder: HusstandsBarnPeriode[];
}

export interface HusstandsBarnPeriode {
    husstandsBarn: HusstandsBarn;
    /** @format date-time */
    datoFom?: string;
    /** @format date-time */
    datoTom?: string;
    bostatus?: Bostatuskode;
    kilde: Kilde;
    /** @format int64 */
    id?: number;
}

export interface Inntekt {
    inntektType?: string;
    belop: number;
    /** @format date-time */
    datoFom?: string;
    /** @format date-time */
    datoTom?: string;
    ident: string;
    fraGrunnlag: boolean;
    taMed: boolean;
    /** @format int64 */
    id?: number;
    behandling?: Behandling;
    /** @uniqueItems true */
    inntektPostListe: InntektPostDomain[];
}

export interface InntektPostDomain {
    beløp: number;
    kode: string;
    visningsnavn: string;
    /** @format int64 */
    id?: number;
    inntekt?: Inntekt;
}

export enum Kilde {
    MANUELL = "MANUELL",
    OFFENTLIG = "OFFENTLIG",
}

export interface Rolle {
    behandling: Behandling;
    rolleType: Rolletype;
    ident?: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
    /** @format int64 */
    id?: number;
    navn?: string;
    deleted: boolean;
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
    /** @format date-time */
    datoFom?: string;
    /** @format date-time */
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
}

export enum SoknadType {
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

export interface Utvidetbarnetrygd {
    behandling: Behandling;
    deltBoSted: boolean;
    belop: number;
    /** @format date-time */
    datoFom?: string;
    /** @format date-time */
    datoTom?: string;
    /** @format int64 */
    id?: number;
}

export enum OpplysningerType {
    INNTEKTSOPPLYSNINGER = "INNTEKTSOPPLYSNINGER",
    BOFORHOLD = "BOFORHOLD",
}

export interface UpdateBehandlingRequest {
    /** @format int64 */
    grunnlagspakkeId?: number;
}

export interface UpdateVirkningsTidspunktRequest {
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    aarsak?: ForskuddAarsakType;
    /**
     * @format date
     * @example "2025-01-25"
     */
    virkningsDato?: string;
}

export interface VirkningsTidspunktResponse {
    virkningsTidspunktBegrunnelseMedIVedtakNotat?: string;
    virkningsTidspunktBegrunnelseKunINotat?: string;
    aarsak?: ForskuddAarsakType;
    /**
     * @format date
     * @example "2025-01-25"
     */
    virkningsDato?: string;
}

/** Rolle beskrivelse som er brukte til å opprette nye roller */
export interface CreateRolleDto {
    rolleType: CreateRolleRolleType;
    /** F.eks fødselsnummer. Påkrevd for alle rolletyper utenom for barn som ikke inngår i beregning. */
    ident?: string | null;
    /** Navn på rolleinnehaver hvis ident er ukjent. Gjelder kun barn som ikke inngår i beregning */
    navn?: string | null;
    /**
     * F.eks fødselsdato
     * @format date-time
     */
    fodtDato?: string;
    /**
     * Opprettet dato
     * @format date-time
     */
    opprettetDato?: string;
    erSlettet: boolean;
}

export enum CreateRolleRolleType {
    BIDRAGS_PLIKTIG = "BIDRAGS_PLIKTIG",
    BIDRAGS_MOTTAKER = "BIDRAGS_MOTTAKER",
    BARN = "BARN",
    REELL_MOTTAKER = "REELL_MOTTAKER",
    FEILREGISTRERT = "FEILREGISTRERT",
}

export interface SyncRollerRequest {
    roller: CreateRolleDto[];
}

export interface BarnetilleggDto {
    /** @format int64 */
    id?: number;
    ident: string;
    barnetillegg: number;
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
}

export interface InntektDto {
    /** @format int64 */
    id?: number;
    taMed: boolean;
    inntektType?: string;
    belop: number;
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
    ident: string;
    fraGrunnlag: boolean;
    /** @uniqueItems true */
    inntektPostListe: InntektPost[];
}

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

export interface UpdateInntekterRequest {
    /** @uniqueItems true */
    inntekter: InntektDto[];
    /** @uniqueItems true */
    barnetillegg: BarnetilleggDto[];
    /** @uniqueItems true */
    utvidetbarnetrygd: UtvidetbarnetrygdDto[];
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
}

export interface UtvidetbarnetrygdDto {
    /** @format int64 */
    id?: number;
    deltBoSted: boolean;
    belop: number;
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
}

export interface InntekterResponse {
    /** @uniqueItems true */
    inntekter: InntektDto[];
    /** @uniqueItems true */
    barnetillegg: BarnetilleggDto[];
    /** @uniqueItems true */
    utvidetbarnetrygd: UtvidetbarnetrygdDto[];
    inntektBegrunnelseMedIVedtakNotat?: string;
    inntektBegrunnelseKunINotat?: string;
}

export interface HusstandsBarnPeriodeDto {
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

export interface HusstandsbarnDto {
    /** @format int64 */
    id?: number;
    medISak: boolean;
    /** @uniqueItems true */
    perioder: HusstandsBarnPeriodeDto[];
    ident?: string;
    navn?: string;
    /**
     * @format date
     * @example "2025-01-25"
     */
    foedselsdato?: string;
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

export interface UpdateBoforholdRequest {
    /** @uniqueItems true */
    husstandsBarn: HusstandsbarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
}

export interface BoforholdResponse {
    /** @uniqueItems true */
    husstandsBarn: HusstandsbarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
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
    behandlingStatus?: InitalizeForsendelseRequestBehandlingStatus;
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

export interface CreateBehandlingRequest {
    behandlingType: Behandlingstype;
    soknadType: SoknadType;
    /** @format date-time */
    datoFom: string;
    /** @format date-time */
    datoTom: string;
    /** @format date-time */
    mottatDato: string;
    soknadFra: SoktAvType;
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
    stonadType: Stonadstype;
    engangsbelopType: Engangsbeloptype;
    /** @format int64 */
    soknadId: number;
    /** @format int64 */
    soknadRefId?: number;
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
    /**
     * @format date
     * @example "2025-01-25"
     */
    hentetDato: string;
}

export interface OpplysningerDto {
    /** @format int64 */
    id: number;
    /** @format int64 */
    behandlingId: number;
    opplysningerType: OpplysningerType;
    data: string;
    /** @format date */
    hentetDato: string;
}

export interface ForskuddBeregningPerBarn {
    referanseTilBarn?: string;
    beregnetForskuddPeriodeListe: ResultatPeriode[];
    grunnlagListe?: Grunnlag[];
}

export interface ForskuddBeregningRespons {
    resultat?: ForskuddBeregningPerBarn[];
    feil?: string[];
}

/** Grunnlag */
export interface Grunnlag {
    /** Referanse (unikt navn på grunnlaget) */
    referanse?: string;
    /** Grunnlagstype */
    type?: Grunnlagstype;
    /** Liste over grunnlagsreferanser */
    grunnlagsreferanseListe?: string[];
    /** Grunnlagsinnhold (generisk) */
    innhold?: JsonNode;
}

/** Grunnlagstype */
export enum Grunnlagstype {
    SAeRFRADRAG = "SÆRFRADRAG",
    SOKNADSBARNINFO = "SØKNADSBARN_INFO",
    SKATTEKLASSE = "SKATTEKLASSE",
    BARN_I_HUSSTAND = "BARN_I_HUSSTAND",
    BOSTATUS = "BOSTATUS",
    BOSTATUS_BP = "BOSTATUS_BP",
    INNTEKT = "INNTEKT",
    INNTEKT_BARN = "INNTEKT_BARN",
    INNTEKT_UTVIDET_BARNETRYGD = "INNTEKT_UTVIDET_BARNETRYGD",
    KAPITALINNTEKT = "KAPITALINNTEKT",
    KAPITALINNTEKT_BARN = "KAPITALINNTEKT_BARN",
    NETTOSAeRTILSKUDD = "NETTO_SÆRTILSKUDD",
    SAMVAeRSKLASSE = "SAMVÆRSKLASSE",
    BIDRAGSEVNE = "BIDRAGSEVNE",
    SAMVAeRSFRADRAG = "SAMVÆRSFRADRAG",
    SJABLON = "SJABLON",
    LOPENDEBIDRAG = "LØPENDE_BIDRAG",
    FAKTISK_UTGIFT = "FAKTISK_UTGIFT",
    BARNETILSYNMEDSTONAD = "BARNETILSYN_MED_STØNAD",
    FORPLEINING_UTGIFT = "FORPLEINING_UTGIFT",
    BARN = "BARN",
    SIVILSTAND = "SIVILSTAND",
    BARNETILLEGG = "BARNETILLEGG",
    BARNETILLEGG_FORSVARET = "BARNETILLEGG_FORSVARET",
    DELT_BOSTED = "DELT_BOSTED",
    NETTO_BARNETILSYN = "NETTO_BARNETILSYN",
    UNDERHOLDSKOSTNAD = "UNDERHOLDSKOSTNAD",
    BPS_ANDEL_UNDERHOLDSKOSTNAD = "BPS_ANDEL_UNDERHOLDSKOSTNAD",
    TILLEGGSBIDRAG = "TILLEGGSBIDRAG",
    MAKS_BIDRAG_PER_BARN = "MAKS_BIDRAG_PER_BARN",
    BPSANDELSAeRTILSKUDD = "BPS_ANDEL_SÆRTILSKUDD",
    MAKSGRENSE25INNTEKT = "MAKS_GRENSE_25_INNTEKT",
    GEBYRFRITAK = "GEBYRFRITAK",
    SOKNADINFO = "SØKNAD_INFO",
    BARN_INFO = "BARN_INFO",
    PERSON_INFO = "PERSON_INFO",
    SAKSBEHANDLER_INFO = "SAKSBEHANDLER_INFO",
    VEDTAK_INFO = "VEDTAK_INFO",
    INNBETALTBELOP = "INNBETALT_BELØP",
    FORHOLDSMESSIG_FORDELING = "FORHOLDSMESSIG_FORDELING",
    SLUTTBEREGNING_BBM = "SLUTTBEREGNING_BBM",
    KLAGE_STATISTIKK = "KLAGE_STATISTIKK",
    PERSON = "PERSON",
    BOSTATUS_PERIODE = "BOSTATUS_PERIODE",
    BEREGNING_INNTEKT_RAPPORTERING_PERIODE = "BEREGNING_INNTEKT_RAPPORTERING_PERIODE",
    SIVILSTAND_PERIODE = "SIVILSTAND_PERIODE",
    VIRKNINGSDATO = "VIRKNINGSDATO",
    NOTAT = "NOTAT",
}

/** Grunnlagsinnhold (generisk) */
export type JsonNode = object;

/** Periode (fra-til dato */
export interface Periode {
    /**
     * Fra-og-med-dato
     * @format date
     */
    datoFom?: string;
    /**
     * Til-dato
     * @format date
     */
    datoTil?: string;
}

/** Resultatet av en beregning */
export interface ResultatBeregning {
    /** Resultat beløp */
    belop: number;
    /** Resultat kode */
    kode: string;
    /** Resultat regel */
    regel: string;
}

/** Resultatet av en beregning for en gitt periode */
export interface ResultatPeriode {
    /** Periode (fra-til dato */
    periode: Periode;
    /** Resultatet av en beregning */
    resultat: ResultatBeregning;
    /** Beregnet grunnlag innhold */
    grunnlagReferanseListe: string[];
    sivilstand?: Sivilstandskode;
}

export interface Arbeidsforhold {
    periode: TypeArManedsperiode;
    arbeidsgiver: string;
    stillingProsent: string;
    /** @format date */
    lønnsendringDato: string;
}

export interface Boforhold {
    barn: BoforholdBarn[];
    sivilstand: SivilstandPeriode[];
    notat: Notat;
}

export interface BoforholdBarn {
    navn: string;
    /** @format date */
    fødselsdato?: string;
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
    inntektType?: Inntektsrapportering;
    beskrivelse?: string;
    periode?: TypeArManedsperiode;
    beløp: number;
}

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
    PENSJON = "PENSJON",
    PENSJON_KORRIGERT_BARNETILLEGG = "PENSJON_KORRIGERT_BARNETILLEGG",
    REHABILITERINGSPENGER = "REHABILITERINGSPENGER",
    SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG = "SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG",
    SKATTEGRUNNLAG_SKE = "SKATTEGRUNNLAG_SKE",
    SYKEPENGER = "SYKEPENGER",
}

export interface Notat {
    medIVedtaket?: string;
    intern?: string;
}

export interface NotatDto {
    saksnummer: string;
    saksbehandlerNavn?: string;
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
    status?: string;
}

export interface ParterISoknad {
    rolle: Rolletype;
    navn?: string;
    /** @format date */
    fødselsdato?: string;
    personident?: string;
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

export interface SivilstandPeriode {
    periode: TypeArManedsperiode;
    kode?: Sivilstandskode;
}

export interface UtvidetBarnetrygd {
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
    søknadstype?: string;
    søktAv?: SoktAvType;
    mottattDato?: {
        /** @format int32 */
        year?: number;
        month?: VirkningstidspunktMonth;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    søktFraDato?: {
        /** @format int32 */
        year?: number;
        month?: VirkningstidspunktMonth;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    /** @format date */
    virkningstidspunkt?: string;
    notat: Notat;
}

export interface TypeArManedsperiode {
    fom: {
        /** @format int32 */
        year?: number;
        month?: ArManedsperiodeMonth;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
    til?: {
        /** @format int32 */
        year?: number;
        month?: ArManedsperiodeMonth;
        /** @format int32 */
        monthValue?: number;
        leapYear?: boolean;
    };
}

export interface BehandlingDto {
    /** @format int64 */
    id: number;
    behandlingtype: Behandlingstype;
    søknadstype: SoknadType;
    erVedtakFattet: boolean;
    /** @format date */
    datoFom: string;
    /** @format date */
    datoTom: string;
    /** @format date */
    mottatDato: string;
    soknadFraType: SoktAvType;
    saksnummer: string;
    /** @format int64 */
    soknadsid: number;
    behandlerenhet: string;
    /** @uniqueItems true */
    roller: RolleDto[];
    /** @uniqueItems true */
    husstandsbarn: HusstandsbarnDto[];
    /** @uniqueItems true */
    sivilstand: SivilstandDto[];
    /** @format date */
    virkningsdato?: string;
    /** @format int64 */
    soknadRefId?: number;
    /** @format int64 */
    grunnlagspakkeid?: number;
    årsak?: ForskuddAarsakType;
    virkningstidspunktBegrunnelseMedIVedtaksnotat?: string;
    virkningstidspunktBegrunnelseKunINotat?: string;
    boforholdsbegrunnelseMedIVedtaksnotat?: string;
    boforholdsbegrunnelseKunINotat?: string;
    inntektsbegrunnelseMedIVedtaksnotat?: string;
    inntektsbegrunnelseKunINotat?: string;
}

export interface RolleDto {
    /** @format int64 */
    id: number;
    rolleType: RolleDtoRolleType;
    ident?: string;
    navn?: string;
    /** @format date-time */
    fodtDato?: string;
    /** @format date-time */
    opprettetDato?: string;
}

export enum InitalizeForsendelseRequestBehandlingStatus {
    OPPRETTET = "OPPRETTET",
    ENDRET = "ENDRET",
    FEILREGISTRERT = "FEILREGISTRERT",
}

export enum VirkningstidspunktMonth {
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

export enum ArManedsperiodeMonth {
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

export enum RolleDtoRolleType {
    BARN = "BARN",
    BIDRAGSMOTTAKER = "BIDRAGSMOTTAKER",
    BIDRAGSPLIKTIG = "BIDRAGSPLIKTIG",
    FEILREGISTRERT = "FEILREGISTRERT",
    REELMOTTAKER = "REELMOTTAKER",
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
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere behandling
         *
         * @tags behandling-controller
         * @name UpdateBehandling
         * @request PUT:/api/behandling/{behandlingId}
         * @secure
         */
        updateBehandling: (behandlingId: number, data: UpdateBehandlingRequest, params: RequestParams = {}) =>
            this.request<void, any>({
                path: `/api/behandling/${behandlingId}`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hente virkningstidspunkt data
         *
         * @tags virknings-tidspunkt-controller
         * @name HentVirkningsTidspunkt
         * @request GET:/api/behandling/{behandlingId}/virkningstidspunkt
         * @secure
         */
        hentVirkningsTidspunkt: (behandlingId: number, params: RequestParams = {}) =>
            this.request<VirkningsTidspunktResponse, VirkningsTidspunktResponse>({
                path: `/api/behandling/${behandlingId}/virkningstidspunkt`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere virkningstidspunkt data
         *
         * @tags virknings-tidspunkt-controller
         * @name OppdaterVirkningsTidspunkt
         * @request PUT:/api/behandling/{behandlingId}/virkningstidspunkt
         * @secure
         */
        oppdaterVirkningsTidspunkt: (
            behandlingId: number,
            data: UpdateVirkningsTidspunktRequest,
            params: RequestParams = {}
        ) =>
            this.request<VirkningsTidspunktResponse, VirkningsTidspunktResponse>({
                path: `/api/behandling/${behandlingId}/virkningstidspunkt`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdaterer vedtak id
         *
         * @tags behandling-controller
         * @name OppdaterVedtakId
         * @request PUT:/api/behandling/{behandlingId}/vedtak/{vedtakId}
         * @secure
         */
        oppdaterVedtakId: (behandlingId: number, vedtakId: number, params: RequestParams = {}) =>
            this.request<void, void>({
                path: `/api/behandling/${behandlingId}/vedtak/${vedtakId}`,
                method: "PUT",
                secure: true,
                ...params,
            }),

        /**
         * @description Sync fra behandling
         *
         * @tags behandling-controller
         * @name SyncRoller
         * @request PUT:/api/behandling/{behandlingId}/roller/sync
         * @secure
         */
        syncRoller: (behandlingId: number, data: SyncRollerRequest, params: RequestParams = {}) =>
            this.request<void, any>({
                path: `/api/behandling/${behandlingId}/roller/sync`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Hente inntekter data
         *
         * @tags inntekter-controller
         * @name HentInntekter
         * @request GET:/api/behandling/{behandlingId}/inntekter
         * @secure
         */
        hentInntekter: (behandlingId: number, params: RequestParams = {}) =>
            this.request<InntekterResponse, InntekterResponse>({
                path: `/api/behandling/${behandlingId}/inntekter`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere inntekter data
         *
         * @tags inntekter-controller
         * @name OppdaterInntekter
         * @request PUT:/api/behandling/{behandlingId}/inntekter
         * @secure
         */
        oppdaterInntekter: (behandlingId: number, data: UpdateInntekterRequest, params: RequestParams = {}) =>
            this.request<InntekterResponse, InntekterResponse>({
                path: `/api/behandling/${behandlingId}/inntekter`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Hente boforhold data
         *
         * @tags boforhold-controller
         * @name HentBoforhold
         * @request GET:/api/behandling/{behandlingId}/boforhold
         * @secure
         */
        hentBoforhold: (behandlingId: number, params: RequestParams = {}) =>
            this.request<BoforholdResponse, any>({
                path: `/api/behandling/${behandlingId}/boforhold`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppdatere boforhold data
         *
         * @tags boforhold-controller
         * @name OppdatereBoforhold
         * @request PUT:/api/behandling/{behandlingId}/boforhold
         * @secure
         */
        oppdatereBoforhold: (behandlingId: number, data: UpdateBoforholdRequest, params: RequestParams = {}) =>
            this.request<BoforholdResponse, any>({
                path: `/api/behandling/${behandlingId}/boforhold`,
                method: "PUT",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Oppretter forsendelse for behandling eller vedtak. Skal bare benyttes hvis vedtakId eller behandlingId mangler for behandling (Søknad som behandles gjennom Bisys)
         *
         * @tags forsendelse-controller
         * @name OpprettForsendelse
         * @request POST:/api/forsendelse/init
         * @secure
         */
        opprettForsendelse: (data: InitalizeForsendelseRequest, params: RequestParams = {}) =>
            this.request<string[], any>({
                path: `/api/forsendelse/init`,
                method: "POST",
                body: data,
                secure: true,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Hente en liste av alle behandlinger
         *
         * @tags behandling-controller
         * @name HentBehandlinger
         * @request GET:/api/behandling
         * @secure
         */
        hentBehandlinger: (params: RequestParams = {}) =>
            this.request<BehandlingDto[], BehandlingDto[]>({
                path: `/api/behandling`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * @description Legge til en ny behandling
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
                format: "json",
                ...params,
            }),

        /**
         * @description Legge til nye opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name AddOpplysningerData
         * @request POST:/api/behandling/{behandlingId}/opplysninger
         * @secure
         */
        addOpplysningerData: (behandlingId: number, data: AddOpplysningerRequest, params: RequestParams = {}) =>
            this.request<OpplysningerDto, OpplysningerDto>({
                path: `/api/behandling/${behandlingId}/opplysninger`,
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
         * @tags behandling-beregn-forskudd-controller
         * @name BeregnForskudd
         * @request POST:/api/behandling/{behandlingId}/beregn
         * @secure
         */
        beregnForskudd: (behandlingId: number, params: RequestParams = {}) =>
            this.request<ForskuddBeregningRespons, any>({
                path: `/api/behandling/${behandlingId}/beregn`,
                method: "POST",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags visningsnavn-controller
         * @name HentVisningsnavn
         * @request GET:/api/visningsnavn
         * @secure
         */
        hentVisningsnavn: (params: RequestParams = {}) =>
            this.request<Record<string, string>, any>({
                path: `/api/visningsnavn`,
                method: "GET",
                secure: true,
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags notat-opplysninger-controller
         * @name HentNotatOpplysninger
         * @request GET:/api/notat/{behandlingId}
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
         * @description Hente aktive opplysninger til behandling
         *
         * @tags opplysninger-controller
         * @name HentAktiv
         * @request GET:/api/behandling/{behandlingId}/opplysninger/{opplysningerType}/aktiv
         * @secure
         */
        hentAktiv: (behandlingId: number, opplysningerType: OpplysningerType, params: RequestParams = {}) =>
            this.request<OpplysningerDto, OpplysningerDto>({
                path: `/api/behandling/${behandlingId}/opplysninger/${opplysningerType}/aktiv`,
                method: "GET",
                secure: true,
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
        }
}
