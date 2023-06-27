import { BoStatusType } from "../../api/BidragBehandlingApi";

interface Periode {
    fraDato: string;
    tilDato: string;
    boStatus: BoStatusType | "";
    kilde: string;
}

interface Sivilstand {
    gyldigFraOgMed: string;
    datoTom: string;
    sivilstandType: string;
}
interface Barn {
    medISaken: boolean;
    ident: string;
    perioder: Periode[];
}
export interface BoforholdData {
    husstandsBarn: Barn[];
    sivilstand: Sivilstand[];
    boforholdBegrunnelseMedIVedtakNotat: string;
    boforholdBegrunnelseKunINotat: string;
}

export const boforholdData: BoforholdData = {
    husstandsBarn: [],
    sivilstand: [],
    boforholdBegrunnelseMedIVedtakNotat: "",
    boforholdBegrunnelseKunINotat: "",
};
