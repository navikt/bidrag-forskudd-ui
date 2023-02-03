import { DefaultRestService } from "@navikt/bidrag-ui-common";

import environment from "../environment";
import { PersonDto } from "../types/personTypes";

export default class PersonService extends DefaultRestService {
    constructor() {
        super("bidrag-person", environment.url.bidragPerson);
    }

    async hentPerson(personId: string): Promise<PersonDto> {
        return this.get<PersonDto>(`/informasjon/${personId}`).then((response) => response.data);
    }
}
