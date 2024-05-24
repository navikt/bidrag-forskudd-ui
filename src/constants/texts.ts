import { OpplysningerType } from "../api/BidragBehandlingApiV1";

const tekster = {
    alert: {
        ansettelsesdetaljerEndret: "Ansettelsesdetaljer fra arbeidsgiver {} er endret",
        antallArbeidsforholdEndret: "Antall arbeidsforhold for {} har blitt endret",
        antallBarnetilleggPerioderEndret: "Antall barnetillegg perioder har blitt endret",
        antallSivilstandsperioderEndret: "Antall sivilstandsperioder har blitt endret i Folkeregisteret",
        antallUtvidetBarnetrygdPerioderEndret: "Antall utvidet barnetrygd perioder har blitt endret",
        barnSomHarBlittLagtInn: "Barn som har blitt lagt inn i nye opplysninger fra Folkeregisteret:",
        barnSomIkkeFinnes: "Barn som ikke finnes i nye opplysninger fra Folkeregisteret:",
        beløpEndret: "Beløp for en eller flere perioder har blitt endret",
        endretVirkningstidspunkt:
            "Virkningstidspunktet er endret. Dette kan påvirke beregningen. Inntekt må manuelt vurderes på nytt",
        endringer: "Følgende endringer har blitt utført:",
        enEllerFlereBoforholdPerioderEndret: "En eller flere perioder har blitt endret for barn med ident - {}",
        enEllerFlereInntektPerioderLagtTil: "En eller flere inntekt perioder har blitt lagt til rolle med ident - {}",
        enEllerFlereSivilstandPerioderEndret: "En eller flere sivilstandsperioder har blitt endret",
        feilIPeriodisering: "Feil i periodisering",
        nyOpplysninger: "Nye opplysninger fra offentlig register vil erstatte de gamle",
        nyOpplysningerBoforhold: "Vil du ta i bruk de nye opplysningene?",
        nyOpplysningerInfo: "Nye opplysninger fra offentlig register er tilgjengelig.",
        nyOpplysningerInfomelding: "Dette kan medføre at inntekt som er lagt til grunn må vurderes på nytt.",
        flereBarnRegistrertPåAdresse: "Det er flere barn registret på samme adresse i Folkeregisteret.",
        fullførRedigering: "Fullfør redigering",
        færreBarnRegistrertPåAdresse: "Det er færre barn registrert på samme adresse i Folkeregisteret.",
        ingenInntekt: "Ingen inntekt funnet",
        manglerVirkningstidspunkt: "Mangler virkningstidspunkt",
        minstEnInntektMindre: "Det er minst en inntekt som legges til grunn mindre for person med ident - {}",
        nyeOpplysninger: "Nye opplysninger tilgjengelig. Sist hentet {}",
        overlappendeLøpendePerioder: "To eller flere løpende inntektsperioder fra {} overlapper.",
        overlappendePerioder: "To eller flere inntektsperioder i perioden {} - {} overlapper.",
        overlappendePerioderFiks: "Rediger eller slett periodene.",
        periodeUnderRedigering: "Det er en periode som er under redigering. Fullfør redigering eller slett periode.",
        sluttdatoForArbeidsforholdEndret: "Sluttdato for arbeidsforhold {} er endret fra {} til {}",
        startdatoForArbeidsforholdEndret: "Startdato for arbeidsforhold {} er endret",
        stillingprosentEndret: "Stillingprosent fra arbeidsgiver {} er endret fra {}% til {}%",
        sumEndret: "Sum for {} har blitt endret for rolle med ident - {} fra {} til {}",
        nyeOpplysningerMåBekreftes: "Nye opplysninger må bekreftes",
        underArbeit:
            "Denne siden er under arbeid og er ikke klar for testing. Du vil få beskjed når du kan begynne å teste denne siden.",
    },
    error: {
        datoIkkeGyldig: "Dato er ikke gyldig",
        datoMåFyllesUt: "Dato må fylles ut",
        barnetilleggType: "Barnetillegg type må settes",
        datoMåSettesManuelt: "Dato må settes manuelt",
        datoMåVæreDenSisteIMåneden: "Dato må være den siste i måneden",
        datoMåVæreDenFørsteIMåneden: "Dato må være den første i måneden",
        framoverPeriodisering: "Det kan ikke periodiseres fremover i tid.",
        ukjentfeil: "Det skjedde en ukjent feil",
        kunneIkkFatteVedtak: "Kunne ikke fatte vedtak",
        beregning: "Det skjedde en feil ved beregning. Prøv å laste siden på nytt",
        fatteVedtak: "Det skjedde en feil ved fatting av vedtak. Vennligst prøv på nytt.",
        feilmelding: "Det har skjedd en feil",
        hentingAvNotat: "Det skjedde en feil ved henting av notat",
        hullIPerioder: "Det er perioder uten status.",
        hullIPerioderInntekt: "Det er perioder uten inntekt",
        hullIPerioderFiks: "Korriger eller legg til inntekt i periodene.",
        identMåFyllesUt: "Ident må fylles ut",
        ingenLoependeInntektPeriode:
            "Det er ingen løpende inntektsperiode. Rediger en av periodene eller legg til en ny periode.",
        ingenLoependePeriode: "Det er ingen løpende status i beregningen.",
        manglerPerioder: "Ingen inntekstperiode er valgt. Du må velge eller legge til minst en løpende periode.",
        inntektType: "Inntekt type må settes",
        navnMåFyllesUt: "Navn må fylles ut",
        kunneIkkeBeregneSivilstandPerioder: "Kunne ikke beregne sivilstand tidslinje basert på virkningstidspunkt.",
        personFinnesIkke: "Finner ikke person med ident: {}",
        tomDatoKanIkkeVæreFørFomDato: "Tom dato kan ikke være før fom dato",
        ugyldigBoststatusFør18: "Ugyldig boststatus for periode før barnet har fylt 18 år.",
        ugyldigBoststatusEtter18: "Ugyldig bosstatus for periode etter barnet har fylt 18 år.",
    },
    label: {
        angreSisteSteg: "Angre siste steg",
        antallBarn: "Antall barn i husstand",
        arbeidsgiver: "Arbeidsgiver",
        avslag: "Avslag",
        opphør: "Opphør",
        avbryt: "Avbryt",
        barn: "Barn",
        barnetillegg: "Barnetillegg",
        begrunnelseKunINotat: "Begrunnelse (kun med i notat)",
        begrunnelseMedIVedtaket: "Begrunnelse (med i vedtaket og notat)",
        beløp: "Beløp",
        beløpMnd: "Beløp (mnd)",
        beløp12Mnd: "Beløp (12 mnd)",
        beskrivelse: "Beskrivelse",
        fatteVedtakButton: "Fatte vedtak",
        forskudd: "Forskudd",
        fraDato: "Fra dato",
        fraOgMed: "Fra og med",
        fødselsdato: "Fødselsdato",
        fødselsnummerDnummer: "Fødselsnummer/d-nummer",
        gåVidere: "Gå videre",
        gåVidereUtenÅLagre: "Gå videre uten å lagre",
        inntekt: "Inntekt",
        jaSlett: "Ja, slett",
        kilde: "Kilde",
        kontantstøtte: "Kontantstøtte",
        leggTilPeriode: "+ Legg til periode",
        lukk: "Lukk",
        lønnsendring: "Lønnsendring",
        lønnsinntektMedTrygdeavgiftspliktOgMedTrekkplikt: "Lønnsinntekt med trygdeavgiftsplikt og med trekkplikt: {}",
        mottattdato: "Mottatt dato",
        navn: "Navn",
        notatButton: "Vis notat",
        nåværendeArbeidsforhold: "Nåværende arbeidsforhold",
        oppdater: "Oppdater",
        periode: "Periode",
        resultat: "Resultat",
        sivilstand: "Sivilstand",
        sivilstandBM: "Sivilstand til BM",
        skattepliktigeInntekter: "Skattepliktige inntekter",
        småbarnstillegg: "Småbarns- tillegg",
        stilling: "Stilling",
        sum: "Sum",
        status: "Status",
        søknadstype: "Søknadstype",
        søknadfra: "Søknad fra",
        søktfradato: "Søkt fra dato",
        taMed: "Ta med",
        tilbakeTilUtfylling: "Tilbake til utfylling",
        tilOgMed: "Til og med",
        totalt: "Totalt",
        type: "Type",
        utvidetBarnetrygd: "Utvidet barnetrygd",
        virkningstidspunkt: "Virkningstidspunkt",
        årsak: "Årsak",
        opplysninger: "Opplysninger",
    },
    loading: "venter...",
    refresh: "Last på nytt",
    select: {
        barnPlaceholder: "Velg barn",
        inntektPlaceholder: "Velg type inntekt",
        årsakAvslagPlaceholder: "Velg årsak/avslag",
    },
    skjermbildeNavn: "Søknad om forskudd",
    hjelpetekst: {
        beregnetInntekter:
            "Tabellen under viser periodisert oppsummering av inntekt per barn. Du trenger kun å legge inn de ulike beløpene i tabellene over så vil systemet beregne den totale inntekten per barn. Hvis det skjer endringer i noen av de automatisk innhentede inntektsopplysningene eller det kommer nye inntektsopplysninger, vil man få en melding om dette. Alle opplysninger som legges inn eller hentes inn av systemet vil vises og lagres i notatet.",
        utvidetBarnetrygd:
            'Her skal man legge inn beløpet på utvidet barnetrygd som parten eventuelt mottar. Systemet henter inn dette automatisk, men dette kan også legges inn manuelt. <br/> Nye opplysninger hentes inn hver tolvte time. Hvis det innhentes nye opplysninger vil man få en melding om hva endringene er og man må trykke på "oppdater opplysninger".',
        kontantstøtte:
            'Her skal man legge inn beløpet på kontantstøtte som parten eventuelt mottar. Systemet henter inn dette automatisk, men kan også legges inn manuelt. <br/> Kontantstøtte legges inn per barn. Nye opplysninger hentes inn hver tolvte time. Hvis det innhentes nye opplysninger vil man få en melding om hva endringene er og man må trykke på "oppdater opplysninger".',
        småbarnstillegg:
            'Her skal man legge inn beløpet på småbarnstillegg som parten eventuelt mottar. Systemet henter inn dette automatisk, men kan også legges inn manuelt. <br/> Nye opplysninger hentes inn hver tolvte time. Hvis det innhentes nye opplysninger vil man få en melding om hva endringene er og man må trykke på "oppdater opplysninger".',
        barnetillegg:
            'Her skal man legge inn barnetillegg som parten mottar. Systemet henter inn barnetillegg parten mottar i pensjon eller uføretrygd. <br/> Hvis det innhentes nye opplysninger vil man få en melding om hva endringene er og man må trykke på "oppdater opplysninger". <br/> Man kan legge inn barnetillegg manuelt. Barnetillegg legges inn per barn. Hvis parten har barnetillegg fra ulike inntektskilder skal man legge inn de ulike barnetilleggene',
    },
    title: {
        arbeidsforhold: "Arbeidsforhold",
        barn: "Barn",
        barnetillegg: "Barnetillegg",
        barnOver18: "Barn over 18 år",
        begrunnelse: "Begrunnelse",
        beregnetTotalt: "Beregnet totalt",
        boforhold: "Boforhold",
        copyButton: "Kopier {}",
        detaljer: "Detaljer",
        inntekt: "Inntekt",
        kontantstøtte: "Kontantstøtte",
        sivilstand: "Sivilstand",
        sjekkNotatOgOpplysninger: "Sjekk notatet og bekreft at opplysningene stemmer",
        skattepliktigeogPensjonsgivendeInntekt: "Skattepliktige og pensjonsgivende inntekter",
        småbarnstillegg: "Småbarnstillegg",
        opplysningerFraFolkeregistret: "Opplysninger fra Folkeregistret",
        oppsummering: "Oppsummering",
        utvidetBarnetrygd: "Utvidet barnetrygd",
        vedtak: "Vedtak",
        virkningstidspunkt: "Virkningstidspunkt",
        vedtakFattet: "Vedtak er fattet",
    },
    varsel: {
        beregneFeil: "For å fatte vedtak må du rette opp feil i følgende steder:",
        vedtakFattet: "Notat og forsendelse er opprettet og er tilgjengelig i journalen. Åpner sakshistorikken.",
        ukjentNavn: "UKJENT",
        bekreftFatteVedtak: "Jeg har sjekket notat og opplysninger i søknaden og bekrefter at opplysningene stemmer.",
        vedtakNotat:
            "Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorikk. Notatet blir generert automatisk basert på opplysningene oppgitt.",
        ønskerDuÅSlette: "Ønsker du å slette?",
        ønskerDuÅSletteBarnet: "Ønsker du å slette barnet som er lagt til i beregningen?",
        ønskerDuÅGåVidere: "Feil ved utfylling",
        ønskerDuÅGåVidereDescription:
            "Et eller flere feltene mangler verdi. Vedtak kan ikke bli fattet før feilen rettes opp.",
    },
    barnetHarFylt18SjekkBostatus: "Barnet har fylt 18 år i løpet av perioden. Sjekk om bostatus til barnet er riktig.",
    resetTilOpplysninger: "Reset til opplysninger fra offentlig register",
    år: "år",
};
export const mapOpplysningtypeSomMåBekreftesTilFeilmelding = (opplysningstype: OpplysningerType) => {
    switch (opplysningstype) {
        case OpplysningerType.KONTANTSTOTTE:
            return `Inntekter: ${
                tekster.alert.nyeOpplysningerMåBekreftes
            } for ${tekster.title.kontantstøtte.toLowerCase()}`;
        case OpplysningerType.SMABARNSTILLEGG:
            return `Inntekter: ${
                tekster.alert.nyeOpplysningerMåBekreftes
            } for ${tekster.title.småbarnstillegg.toLowerCase()}`;
        case OpplysningerType.UTVIDET_BARNETRYGD:
            return `Inntekter: ${
                tekster.alert.nyeOpplysningerMåBekreftes
            } for ${tekster.title.utvidetBarnetrygd.toLowerCase()}`;
        case OpplysningerType.BARNETILLEGG:
            return `Inntekter: ${
                tekster.alert.nyeOpplysningerMåBekreftes
            } for ${tekster.title.barnetillegg.toLowerCase()}`;
        case OpplysningerType.BARNETILSYN:
            return `Inntekter: ${tekster.alert.nyeOpplysningerMåBekreftes} for barnetilsyn`;
        case OpplysningerType.SKATTEPLIKTIGE_INNTEKTER:
            return `Inntekter: ${
                tekster.alert.nyeOpplysningerMåBekreftes
            } for ${tekster.title.skattepliktigeogPensjonsgivendeInntekt.toLowerCase()}`;
        case OpplysningerType.BOFORHOLD:
            return `Boforhold: ${tekster.alert.nyeOpplysningerMåBekreftes}`;
        case OpplysningerType.SIVILSTAND:
            return `Sivilstand: ${tekster.alert.nyeOpplysningerMåBekreftes}`;
        default:
            return tekster.alert.nyeOpplysningerMåBekreftes;
    }
};

export default tekster;
