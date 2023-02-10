import { RolleType } from "../../enum/RolleType";
import { Sakskategori } from "../../enum/Sakskategori";
import { Saksstatus } from "../../enum/Saksstatus";
import { IBidragSak } from "../../types/bidrag-sak";


export const bidragsak: IBidragSak = {
    eierfogd: "2990",
    saksnummer: "2235166",
    saksstatus: Saksstatus.NY,
    kategori: Sakskategori.NASJONAL,
    erParagraf19: false,
    begrensetTilgang: false,
    roller: [
        {
            fodselsnummer: "05431672709",
            navn: "Barn2 Navnesen",
            type: RolleType.BA,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            fulltNavn: "Barn2 Mellomnavn Navnesen",
        },
        {
            fodselsnummer: "06510985255",
            navn: "Barn1 Navnesen",
            type: RolleType.BA,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            fulltNavn: "Barn1 Mellomnavn Navnesen",
        },
        {
            fodselsnummer: "07456732334",
            navn: "Mor Navnesen",
            type: RolleType.BM,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            fulltNavn: "Mor Mellomnavn Navnesen",
        },
        {
            fodselsnummer: "16384750983",
            navn: "Far Navnesen",
            type: RolleType.BP,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            fulltNavn: "Far Mellomnavn Navnesen",
        },
    ],
};
