import { RolleType } from "../enum/RolleType";
import { Sakskategori } from "../enum/Sakskategori";
import { Saksstatus } from "../enum/Saksstatus";

export interface IBidragSak {
    eierfogd: string;
    saksnummer: string;
    saksstatus: Saksstatus;
    kategori: Sakskategori;
    erParagraf19: boolean;
    begrensetTilgang: boolean;
    roller: IRollerUi[];
}

export interface IRollerUi extends IRoller {
    navn?: string;
    fulltNavn?: string;
    reellMottagerNavn?: string;
    requiredReellMottager?: boolean;
    checked?: boolean;
    isAddedManually?: boolean;
    confirmMissingRelation?: boolean;
    error?: string;
}

export interface IRoller {
    fodselsnummer: string;
    type: RolleType;
    objektnummer?: string | null;
    reellMottager?: string | null;
    mottagerErVerge?: boolean;
    samhandlerIdent?: string | null;
}
