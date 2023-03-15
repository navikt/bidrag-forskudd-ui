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
export const behandlingData = (data = {}) => {
    const initialData = {
        id: 1,
        behandlingType: "FORSKUDD",
        soknadType: "SOKNAD",
        datoFom: 1672527600000,
        datoTom: 4834076400000,
        saksnummer: "2300138",
        behandlerEnhet: "4806",
        roller: [
            {
                id: 1,
                rolleType: "BARN",
                ident: "03522150877",
                opprettetDato: 1678402800000,
                navn: "Forsikring, Kognitiv",
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
    return {
        ...initialData,
        ...data,
    };
};

export const mockDates = {
    0: "2021-10-15",
    1: "2020-10-15",
    2: "2019-10-15",
    3: "2018-10-15",
    4: "2017-10-15",
};
