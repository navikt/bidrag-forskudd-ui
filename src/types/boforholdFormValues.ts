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

export interface HusstandOpplysningPeriode {
    fraDato: Date;
    tilDato: Date;
    boStatus: BoStatusType;
}

export interface HusstandOpplysningFraFolkeRegistre {
    foedselsDato?: string;
    ident: string;
    navn: string;
    perioder: HusstandOpplysningPeriode[];
}

export interface SavedOpplysningFraFolkeRegistrePeriode {
    fraDato: string;
    tilDato: string;
    boStatus: BoStatusType;
}

export interface SavedHustandOpplysninger {
    foedselsDato?: string;
    ident: string;
    navn: string;
    perioder: SavedOpplysningFraFolkeRegistrePeriode[];
}

export interface BoforholdOpplysninger {
    husstand: HusstandOpplysningFraFolkeRegistre[];
    sivilstand: SivilstandDto[];
}

export interface ParsedBoforholdOpplysninger {
    husstand: SavedHustandOpplysninger[];
    sivilstand: SivilstandDto[];
}
