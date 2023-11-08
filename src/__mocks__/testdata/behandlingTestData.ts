import {
    BehandlingDto,
    BehandlingType,
    RolleDtoRolleType,
    SoknadType,
    SoktAvType,
} from "../../api/BidragBehandlingApi";
import { generateName } from "../msw/personMock";

export const behandlingMockApiData: BehandlingDto = {
    id: 1,
    soknadId: 1234,
    erVedtakFattet: false,
    behandlingType: BehandlingType.FORSKUDD,
    soknadType: SoknadType.INNKREVING,
    datoFom: "2019-04-01",
    datoTom: "2019-10-03",
    mottatDato: "2019-11-03",
    saksnummer: "2300138",
    behandlerEnhet: "4806",
    soknadFraType: SoktAvType.BIDRAGSMOTTAKER,
    roller: [
        {
            id: 1,
            rolleType: RolleDtoRolleType.BARN,
            ident: "03522150877",
            opprettetDato: "2023-06-14T11:33:06.769Z",
        },
        {
            id: 4,
            rolleType: RolleDtoRolleType.BARN,
            ident: "07512150855",
            opprettetDato: "2023-06-14T11:33:06.769Z",
        },
        {
            id: 2,
            rolleType: RolleDtoRolleType.BIDRAGSPLIKTIG,
            ident: "31459900198",
            opprettetDato: "2023-06-14T11:33:06.769Z",
        },
        {
            id: 3,
            rolleType: RolleDtoRolleType.BIDRAGSMOTTAKER,
            ident: "21470262629",
            opprettetDato: "2023-06-14T11:33:06.769Z",
        },
    ],
    husstandsBarn: [
        {
            id: 1,
            medISaken: true,
            perioder: [],
            ident: "03522150877",
            navn: generateName(),
            foedselsDato: "2023-05-02T11:24:12.190Z",
        },
        {
            id: 4,
            medISaken: true,
            perioder: [],
            ident: "07512150855",
            navn: generateName(),
            foedselsDato: "2023-05-02T11:24:12.190Z",
        },
    ],
    sivilstand: [],
    virkningsTidspunktBegrunnelseMedIVedtakNotat: "",
    virkningsTidspunktBegrunnelseKunINotat: "",
    boforholdBegrunnelseMedIVedtakNotat: "",
    boforholdBegrunnelseKunINotat: "",
    inntektBegrunnelseMedIVedtakNotat: "",
    inntektBegrunnelseKunINotat: "",
};
