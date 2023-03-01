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
        soknadType: SoknadsType.SOKNAD,
        soknadFra: RolleType.BM,
        soktFraDato: "2022-01-05",
        mottatDato: "2022-12-05",
        enhet: {
            id: "",
            navn: "",
        },
        virkningstidspunkt: mockDates[0],
        aarsak: Object.keys(ForskuddBeregningKodeAarsak)[2],
        avslag: "avslag_2",
        begrunnelseMedIVedtakNotat: "Some vedtak notat ",
        begrunnelseKunINotat: "Some not vedtak notat",
    };
    return {
        ...initialData,
        ...data,
    } as BehandlingData;
};

export const mockDates = {
    0: "2021-10-15",
    1: "2020-10-15",
    2: "2019-10-15",
    3: "2018-10-15",
    4: "2017-10-15",
};
