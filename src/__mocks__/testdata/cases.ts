import { RolleType } from "../../enum/RolleType";
import { RolleDto } from "../../types/bidragSakTypes";
import { SoknadsType } from "./kodeverk";

interface BehandlingData {
    soknadType: SoknadsType;
    fraDato: string;
    tilDato: string;
    enhet: {
        id: string;
        navn: string;
    };
}

const behandlingData = {
    "1234": {
        soknadType: SoknadsType.SOKNAD,
        fraDato: "",
        tilDato: "",
        enhet: {
            id: "",
            navn: "",
        },
    } as BehandlingData,
};

const roller = {
    "1234": [
        {
            ident: "",
            status: "",
            type: "",
            navn: "",
        },
    ],
};

const arbeidsForhold = {
    "1234": [
        {
            periode: "",
            arbeidsgiver: "",
            inntekt: "",
            tilleg: "",
            totalt: "",
            beskrivelse: "",
        },
    ],
};

const utvidetBarnetrygd = {
    "1234": [
        {
            periode: "",
            deltBosted: "",
            beløp: "",
        },
    ],
};

const kontantStotte = {
    "1234": [
        {
            periode: "",
            barn: "",
            beløp: "",
        },
    ],
};

const inntekt = {
    "1234": [
        {
            periode: "",
            gjennomsnitt: {
                treMaaneder: "",
                tolvMaaneder: "",
            },
        },
    ],
};

const cases = [
    {
        saksnummer: "1234",
        behandling: {
            ...behandlingData["1234"],
            roller: roller["1234"],
        },
    },
];

export const getCase = (saksnummer: string) => cases.find((c) => c.saksnummer === saksnummer);
export const getInntekt = (rolle: RolleDto) =>
    inntekt[roller["1234"].find((rolle) => rolle.type === RolleType.BM).ident];

export const getInntektForPeriode = (rolle: RolleDto, periode: string) =>
    getInntekt(rolle).find((inntekt) => inntekt.periode === periode);

export const getBehandlingData = (saksnummmer: string) => behandlingData[saksnummmer];
