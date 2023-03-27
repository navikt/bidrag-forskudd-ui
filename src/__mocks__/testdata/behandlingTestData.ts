import { BehandlingDto, BehandlingType, RolleType, SoknadFraType, SoknadType } from "../../api/BidragBehandlingApi";

export const behandlingMockApiData: BehandlingDto = {
    id: 1,
    behandlingType: BehandlingType.FORSKUDD,
    soknadType: SoknadType.SOKNAD,
    datoFom: "01.01.2023",
    datoTom: "10.03.2123",
    mottatDato: "17.03.2023",
    saksnummer: "2300138",
    behandlerEnhet: "4806",
    soknadFraType: SoknadFraType.BM,
    roller: [
        {
            id: 1,
            rolleType: RolleType.BARN,
            ident: "03522150877",
            opprettetDato: "17.03.2020",
            navn: "Forsikring, Kognitiv",
        },
        {
            id: 4,
            rolleType: RolleType.BARN,
            ident: "07512150855",
            opprettetDato: "17.03.2020",
            navn: "Forsikring, Inkognitiv",
        },
        {
            id: 2,
            rolleType: RolleType.BIDRAGS_PLIKTIG,
            ident: "31459900198",
            opprettetDato: "17.03.2020",
            navn: "Skål, Personlig",
        },
        {
            id: 3,
            rolleType: RolleType.BIDRAGS_MOTTAKER,
            ident: "21470262629",
            opprettetDato: "17.03.2020",
            navn: "Lunge, Farlig",
        },
    ],
};
