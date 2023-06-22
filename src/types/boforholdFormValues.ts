import { SivilstandType } from "../api/BidragBehandlingApi";

interface BarnPeriode {
    edit: boolean;
    fraDato: Date | null;
    tilDato: Date | null;
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
    fraDato: Date | null;
    tilDato: Date | null;
    sivilstandType: SivilstandType;
}

export interface BoforholdFormValues {
    husstandsBarn: Barn[];
    sivilstand: Sivilstand[];
    boforholdBegrunnelseMedIVedtakNotat: string;
    boforholdBegrunnelseKunINotat: string;
}
