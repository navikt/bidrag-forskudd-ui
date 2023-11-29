import {
    BehandlingDto,
    Behandlingstype,
    RolleDtoRolleType,
    SoknadType,
    SoktAvType,
} from "../../api/BidragBehandlingApi";
import { generateName } from "../msw/personMock";

export const behandlingMockApiData: BehandlingDto = {
    id: 1,
    soknadsid: 1234,
    erVedtakFattet: false,
    behandlingtype: Behandlingstype.FORSKUDD,
    søknadstype: SoknadType.INNKREVING,
    datoFom: "2023-08-01",
    datoTom: "2023-10-03",
    mottatDato: "2023-11-14",
    saksnummer: "2300138",
    behandlerenhet: "4806",
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
    husstandsbarn: [
        {
            id: 1,
            medISak: true,
            perioder: [],
            ident: "03522150877",
            navn: generateName(),
            foedselsdato: "2023-05-02",
        },
        {
            id: 4,
            medISak: true,
            perioder: [],
            ident: "07512150855",
            navn: generateName(),
            foedselsdato: "2023-05-02",
        },
    ],
    sivilstand: [],
    virkningstidspunktBegrunnelseMedIVedtaksnotat: "",
    virkningstidspunktBegrunnelseKunINotat: "",
    boforholdsbegrunnelseMedIVedtaksnotat: "",
    boforholdsbegrunnelseKunINotat: "",
    inntektsbegrunnelseMedIVedtaksnotat: "",
    inntektsbegrunnelseKunINotat: "",
};
