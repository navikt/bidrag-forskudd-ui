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
        soktFraDato: "2022-01-04",
        mottatDato: "2022-01-05",
        enhet: {
            id: "",
            navn: "",
        },
        virkningstidspunkt: "",
        aarsak: Object.keys(ForskuddBeregningKodeAarsak)[2],
        avslag: "avslag_2",
        begrunnelseMedIVedtakNotat:
            "Du har søkt om bidragsforskudd fra 01.05.2022 med den begrunnelse at du ikke har har blitt informert muligheten for å søke tidligere. I brev av 05.10.2022 er du blitt bedt om å dokumentere påstanden, men NAV har ikke mottatt etterspurt dokumentasjon innen fristen.  Bidragsforskuddet er fastsatt med virkning fra 01.07.2022, som er tre måneder før NAV fikk søknaden din.",
        begrunnelseKunINotat: "",
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

export const behandlingMockApiData = {
    id: 1,
    behandlingType: "FORSKUDD",
    soknadType: "SOKNAD",
    datoFom: "01-01-2023",
    datoTom: "10-03-2123",
    mottatDato: "17-03-2023",
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
