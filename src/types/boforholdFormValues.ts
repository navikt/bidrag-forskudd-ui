import { SivilstandType } from "../api/BidragBehandlingApi";

export interface BarnPeriode {
    edit: boolean;
    datoFom: Date | null;
    datoTom: Date | null;
    boStatus: "" | "registrert_paa_adresse" | "ikke_registrert_paa_adresse";
    kilde: "" | "offentlig" | "manuelt";
}
interface Barn {
    medISaken: boolean;
    ident?: string;
    navn?: string;
    perioder: BarnPeriode[];
}

interface Sivilstand {
    gyldigFraOgMed: Date | null;
    datoTom: Date | null;
    sivilstandType: SivilstandType;
}

export interface BoforholdFormValues {
    husstandsBarn: Barn[];
    sivilstand: Sivilstand[];
    boforholdBegrunnelseMedIVedtakNotat: string;
    boforholdBegrunnelseKunINotat: string;
}
