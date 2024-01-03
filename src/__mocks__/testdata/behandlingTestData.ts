import { BehandlingDto, Rolletype, SoktAvType, Stonadstype, Vedtakstype } from "../../api/BidragBehandlingApiV1";

export const behandlingMockApiData: BehandlingDto = {
    id: 1,
    søknadsid: 1234,
    erVedtakFattet: false,
    vedtakstype: Vedtakstype.FASTSETTELSE,
    stønadstype: Stonadstype.FORSKUDD,
    søktFomDato: "2019-04-01",
    mottattdato: "2019-11-03",
    saksnummer: "2300138",
    behandlerenhet: "4806",
    søktAv: SoktAvType.BIDRAGSMOTTAKER,
    roller: [
        {
            id: 1,
            rolletype: Rolletype.BA,
            ident: "03522150877",
        },
        {
            id: 4,
            rolletype: Rolletype.BA,
            ident: "07512150855",
        },
        {
            id: 2,
            rolletype: Rolletype.BP,
            ident: "31459900198",
        },
        {
            id: 3,
            rolletype: Rolletype.BM,
            ident: "21470262629",
        },
    ],
    boforhold: {
        husstandsbarn: [],
        sivilstand: [],
        notat: {
            kunINotat: "",
            medIVedtaket: "",
        },
    },
    inntekter: {
        inntekter: [],
        barnetillegg: [],
        småbarnstillegg: [],
        kontantstøtte: [],
        utvidetbarnetrygd: [],
        notat: {
            kunINotat: "",
            medIVedtaket: "",
        },
    },
    virkningstidspunkt: {
        virkningsdato: "",
        årsak: null,
        notat: {
            kunINotat: "",
            medIVedtaket: "",
        },
    },
    opplysninger: [],
};
