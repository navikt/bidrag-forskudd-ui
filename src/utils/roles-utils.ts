import { BidragSakDto } from "../api/BidragSakApi";
import { PERSON_IKKE_FINNES } from "../constants/error";
import { PersonDto } from "../types/personTypes";
import { removePlaceholder } from "./string-utils";

export const mapPersonsToRoles = (sak: BidragSakDto, personer: PersonDto[]) =>
    personer.map((person) => {
        const rolle = sak.roller.find((rolle) => rolle.fodselsnummer === person.ident);
        if (!rolle) throw new Error(removePlaceholder(PERSON_IKKE_FINNES, person.ident));
        return { ...rolle, ...person };
    });
