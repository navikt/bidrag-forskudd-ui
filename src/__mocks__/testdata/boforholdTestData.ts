import { HusstandsbarnDto } from "../../api/BidragBehandlingApi";

interface Sivilstand {
    gyldigFraOgMed: string;
    datoTom: string;
    sivilstand: string;
    kilde: string;
}

export interface BoforholdData {
    husstandsBarn: HusstandsbarnDto[];
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
