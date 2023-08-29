import { BoStatusType, SivilstandDto } from "../api/BidragBehandlingApi";

export interface BarnPeriode {
    datoFom?: string | null;
    datoTom?: string | null;
    boStatus: BoStatusType | "";
    kilde: string;
}
interface Barn {
    medISaken: boolean;
    ident?: string;
    navn?: string;
    foedselsDato?: string | null;
    perioder: BarnPeriode[];
}

export interface BoforholdFormValues {
    husstandsBarn: Barn[];
    sivilstand: SivilstandDto[];
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
}

export interface OpplysningFraFolkeRegistrePeriode {
    fraDato: Date;
    tilDato: Date;
    boStatus: BoStatusType;
}

export interface OpplysningFraFolkeRegistre {
    ident: string;
    navn: string;
    perioder: OpplysningFraFolkeRegistrePeriode[];
}
