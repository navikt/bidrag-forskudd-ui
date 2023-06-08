interface Periode {
    fraDato: string;
    tilDato: string;
    boStatus: "registrert_paa_adresse" | "ikke_registrert_paa_adresse";
    kilde: string;
}

interface Sivilstand {
    fraDato: string;
    tilDato: string;
    stand: string;
}
interface Barn {
    medISaken: boolean;
    ident: string;
    perioder: Periode[];
}
export interface BoforholdData {
    behandlingBarn: Barn[];
    sivilstand: Sivilstand[];
    boforholdBegrunnelseMedIVedtakNotat: string;
    boforholdBegrunnelseKunINotat: string;
}

export const boforholdData: BoforholdData = {
    behandlingBarn: [],
    sivilstand: [],
    boforholdBegrunnelseMedIVedtakNotat: "",
    boforholdBegrunnelseKunINotat: "",
};
