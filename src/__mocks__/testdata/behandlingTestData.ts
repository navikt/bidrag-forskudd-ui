import { RolleType } from "../../enum/RolleType";
import { SoknadsType } from "./kodeverk";

export interface BehandlingData {
    soknadType: SoknadsType;
    soknadFra: string;
    soktFraDato: string;
    mottatDato: string;
    enhet: {
        id: string;
        navn: string;
    };
    virkningstidspunkt: string;
    aarsak: string;
    avslag: string;
    vedtakNotat: string;
    notat: string;
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
        aarsak: "NF",
        avslag: "avslag_2",
        vedtakNotat: "Some vedtak notat ",
        notat: "Some not vedtak notat",
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
