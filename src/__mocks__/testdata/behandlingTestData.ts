import { RolleType } from "../../enum/RolleType";
import { SoknadsType } from "./kodeverk";

export interface BehandlingData {
    soknadType: SoknadsType;
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
let count = 0;
export const behandlingData = () => {
    // fake updates on server
    count += 1;
    return {
        "1234": {
            soknadType: SoknadsType.SOKNAD,
            soknadFra: RolleType.BM,
            soktFraDato: "2022-01-05",
            mottatDato: "2022-12-05",
            enhet: {
                id: "",
                navn: "",
            },
            virkningstidspunkt: date[count],
            aarsak: "NF",
            avslag: "avslag_2",
            vedtakNotat: "Some vedtak notat " + count,
            notat: "Some not vedtak notat",
        } as BehandlingData,
    };
};

const date = {
    0: "2021-10-15",
    1: "2020-10-15",
    2: "2019-10-15",
    3: "2018-10-15",
    4: "2017-10-15",
};
