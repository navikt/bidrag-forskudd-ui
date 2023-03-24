import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { RolleType } from "../../enum/RolleType";
import { SoknadsType } from "../../enum/SoknadsTypes";

export interface BehandlingData {
    soknadType: SoknadsType;
    soknadFra: RolleType;
    soktFraDato: string;
    mottatDato: string;
    enhet: {
        id: string;
        navn: string;
    };
    virkningstidspunkt: string;
    aarsak: ForskuddBeregningKodeAarsak;
    avslag: string;
    begrunnelseMedIVedtakNotat: string;
    begrunnelseKunINotat: string;
}

export const behandlingMockApiData = {
    id: 1,
    behandlingType: "FORSKUDD",
    soknadType: "SOKNAD",
    datoFom: "01.01.2023",
    datoTom: "10.03.2123",
    mottatDato: "17.03.2023",
    saksnummer: "2300138",
    behandlerEnhet: "4806",
    soknadFraType: "BM",
    roller: [
        {
            id: 1,
            rolleType: "BARN",
            ident: "03522150877",
            opprettetDato: 1678402800000,
            navn: "Forsikring, Kognitiv",
        },
        {
            id: 4,
            rolleType: "BARN",
            ident: "07512150855",
            opprettetDato: 1678402800000,
            navn: "Forsikring, Inkognitiv",
        },
        {
            id: 2,
            rolleType: "BIDRAGS_PLIKTIG",
            ident: "31459900198",
            opprettetDato: 1678402800000,
            navn: "Skål, Personlig",
        },
        {
            id: 3,
            rolleType: "BIDRAGS_MOTTAKER",
            ident: "21470262629",
            opprettetDato: 1678402800000,
            navn: "Lunge, Farlig",
        },
    ],
};
