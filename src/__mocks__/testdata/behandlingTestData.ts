import { BehandlingDtoV2, Rolletype, SoktAvType, Stonadstype, Vedtakstype } from "../../api/BidragBehandlingApiV1";

export const behandlingMockApiData: BehandlingDtoV2 = {
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
        valideringsfeil: null,
    },
    inntekter: {
        månedsinntekter: [],
        årsinntekter: [],
        barnetillegg: [],
        småbarnstillegg: [],
        kontantstøtte: [],
        utvidetBarnetrygd: [],
        beregnetInntekter: [],
        notat: {
            kunINotat: "",
            medIVedtaket: "",
        },
        valideringsfeil: null,
    },
    virkningstidspunkt: {
        virkningstidspunkt: "",
        årsak: null,
        notat: {
            kunINotat: "",
            medIVedtaket: "",
        },
    },
    aktiveGrunnlagsdata: [],
    ikkeAktiverteEndringerIGrunnlagsdata: [],
};
