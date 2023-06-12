import { BehandlingDto, BehandlingType, RolleType, SoknadFraType, SoknadType } from "../../api/BidragBehandlingApi";
import { generateName } from "../msw/personMock";

export const behandlingMockApiData: BehandlingDto = {
    id: 1,
    behandlingType: BehandlingType.FORSKUDD,
    soknadType: SoknadType.INNKREVING,
    datoFom: "01.01.2023",
    datoTom: "10.03.2123",
    mottatDato: "17.03.2023",
    saksnummer: "2300138",
    behandlerEnhet: "4806",
    soknadFraType: SoknadFraType.BIDRAGSMOTTAKER,
    roller: [
        {
            id: 1,
            rolleType: RolleType.BARN,
            ident: "03522150877",
            opprettetDato: "17.03.2020",
        },
        {
            id: 4,
            rolleType: RolleType.BARN,
            ident: "07512150855",
            opprettetDato: "17.03.2020",
        },
        {
            id: 2,
            rolleType: RolleType.BIDRAGS_PLIKTIG,
            ident: "31459900198",
            opprettetDato: "17.03.2020",
        },
        {
            id: 3,
            rolleType: RolleType.BIDRAGS_MOTTAKER,
            ident: "21470262629",
            opprettetDato: "17.03.2020",
        },
    ],
    behandlingBarn: [
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
