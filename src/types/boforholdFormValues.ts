import { Bostatuskode, HusstandsbarnDto, SivilstandDto, Sivilstandskode } from "../api/BidragBehandlingApi";

export interface BoforholdFormValues {
    husstandsBarn: HusstandsbarnDto[];
    sivilstand: SivilstandDto[];
    boforholdBegrunnelseMedIVedtakNotat?: string;
    boforholdBegrunnelseKunINotat?: string;
}

export interface HusstandOpplysningPeriode {
    fraDato: Date;
    tilDato: Date;
    bostatus: Bostatuskode;
}

export interface HusstandOpplysningFraFolkeRegistre {
    foedselsdato?: string;
    ident: string;
    navn: string;
    perioder: HusstandOpplysningPeriode[];
}

export interface SavedOpplysningFraFolkeRegistrePeriode {
    fraDato: string;
    tilDato: string;
    bostatus: Bostatuskode;
}

export interface SavedHustandOpplysninger {
    foedselsdato?: string;
    ident: string;
    navn: string;
    perioder: SavedOpplysningFraFolkeRegistrePeriode[];
}

export interface SivilstandOpplysninger {
    datoFom: string;
    datoTom: string;
    sivilstand: Sivilstandskode;
}

export interface BoforholdOpplysninger {
    husstand: HusstandOpplysningFraFolkeRegistre[];
    sivilstand: SivilstandOpplysninger[];
}

export interface ParsedBoforholdOpplysninger {
    husstand: SavedHustandOpplysninger[];
    sivilstand: SivilstandOpplysninger[];
}
