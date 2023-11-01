import { BoStatusType, SivilstandDto } from "../api/BidragBehandlingApi";
import { SivilstandDto as SivilstandDtoGrunnlag } from "../api/BidragGrunnlagApi";

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
    ident: string;
    navn: string;
    perioder: SavedOpplysningFraFolkeRegistrePeriode[];
}

export interface BoforholdOpplysninger {
    husstand: HusstandOpplysningFraFolkeRegistre[];
    sivilstand: SivilstandDtoGrunnlag[];
}

export interface ParsedBoforholdOpplysninger {
    husstand: SavedHustandOpplysninger[];
    sivilstand: SivilstandDtoGrunnlag[];
}
