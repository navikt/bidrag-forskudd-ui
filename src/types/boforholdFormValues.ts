import { BoStatusType, SivilstandType } from "../api/BidragBehandlingApi";

interface BarnPeriode {
    edit: boolean;
    fraDato: Date | null;
    tilDato: Date | null;
    boStatus: BoStatusType | "";
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
