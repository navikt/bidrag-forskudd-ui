interface BarnPeriode {
    selected: boolean;
    fraDato: Date | null;
    tilDato: Date | null;
    borMedForeldre: boolean;
    registrertPaaAdresse: boolean;
    kilde: "" | "offentlig" | "manuelt";
}
interface Barn {
    medISaken: boolean;
    ident?: string;
    navn?: string;
    perioder: BarnPeriode[];
}

interface Sivilstand {
    fraDato: Date | null;
    tilDato: Date | null;
    stand: "" | "ugift" | "gift" | "skilt";
}

export interface BoforholdFormValues {
    barn: Barn[];
    sivilstand: Sivilstand[];
    boforholdBegrunnelseMedIVedtakNotat: string;
    boforholdBegrunnelseKunINotat: string;
}
