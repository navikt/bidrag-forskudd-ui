import { BoStatusType, SivilstandType } from "../api/BidragBehandlingApi";
import { BoStatusUI } from "../enum/BoStatus";

export interface BarnPeriode {
    datoFom: Date | null;
    datoTom: Date | null;
    boStatus: BoStatusType | "";
    kilde: "offentlig" | "manuelt";
}
interface Barn {
    medISaken: boolean;
    ident?: string;
    navn?: string;
    perioder: BarnPeriode[];
}

export interface Sivilstand {
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

export interface OpplysningFraFolkeRegistrePeriode {
    fraDato: Date;
    tilDato: Date;
    boStatus: BoStatusUI;
}

export interface OpplysningFraFolkeRegistre {
    ident: string;
    navn: string;
    perioder: OpplysningFraFolkeRegistrePeriode[];
}
