import { BoStatusType, SivilstandDto } from "../api/BidragBehandlingApi";
import { BoStatusUI } from "../enum/BoStatus";

export interface BarnPeriode {
    datoFom?: string | null;
    datoTom?: string | null;
    boStatus: BoStatusType | BoStatusUI | "";
    kilde: "offentlig" | "manuelt";
}
interface Barn {
    medISaken: boolean;
    ident?: string;
    navn?: string;
    perioder: BarnPeriode[];
}

export interface BoforholdFormValues {
    husstandsBarn: Barn[];
    sivilstand: SivilstandDto[];
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
