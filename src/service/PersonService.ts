import { DefaultRestService } from "@navikt/bidrag-ui-common";

import environment from "../environment";

export default class PersonService extends DefaultRestService {
    constructor() {
        super("bidrag-person", environment.url.bidragPerson);
    }

    async hentPerson(personId: string): Promise<PersonResponse> {
        return this.get<PersonResponse>(`/informasjon/${personId}`).then((response) => response.data);
    }
}
