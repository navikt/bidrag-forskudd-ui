import { BoStatusType, HusstandsbarnDto, SivilstandDto, SivilstandType } from "../api/BidragBehandlingApi";

export interface BoforholdFormValues {
    husstandsBarn: HusstandsbarnDto[];
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

export interface SivilstandOpplysninger {
    datoFom: string;
    datoTom: string;
    sivilstandType: SivilstandType;
}

export interface BoforholdOpplysninger {
    husstand: HusstandOpplysningFraFolkeRegistre[];
    sivilstand: SivilstandOpplysninger[];
}

export interface ParsedBoforholdOpplysninger {
    husstand: SavedHustandOpplysninger[];
    sivilstand: SivilstandOpplysninger[];
}
