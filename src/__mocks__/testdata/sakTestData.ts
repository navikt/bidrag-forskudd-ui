import { RolleType } from "../../enum/RolleType";
import { Sakskategori } from "../../enum/Sakskategori";
import { Saksstatus } from "../../enum/Saksstatus";
import { BidragSakDto } from "../../types/bidragSakTypes";

export const bidragsak: BidragSakDto = {
    eierfogd: "2990",
    saksnummer: "2235166",
    saksstatus: Saksstatus.NY,
    kategori: Sakskategori.NASJONAL,
    erParagraf19: false,
    begrensetTilgang: false,
    roller: [
        {
            fodselsnummer: "05431672709",
            type: RolleType.BA,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            rolleType: RolleType.BA,
        },
        {
            fodselsnummer: "06510985255",
            type: RolleType.BA,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            rolleType: RolleType.BA,
        },
        {
            fodselsnummer: "07456732334",
            type: RolleType.BM,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            rolleType: RolleType.BM,
        },
        {
            fodselsnummer: "16384750983",
            type: RolleType.BP,
            objektnummer: null,
            reellMottager: null,
            mottagerErVerge: false,
            samhandlerIdent: null,
            rolleType: RolleType.BP,
        },
    ],
};
