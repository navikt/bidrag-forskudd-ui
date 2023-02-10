import { DefaultRestService, SecureLoggerService } from "@navikt/bidrag-ui-common";

import { SAK_IKKE_FINNES } from "../constants/error";
import { HTTPStatus } from "../enum/HttpStatus";
import environment from "../environment";
import { IBidragSak } from "../types/bidrag-sak";
import { removePlaceholder } from "../utils/string-utils";

export default class SakService extends DefaultRestService {
    constructor() {
        super("bidrag-sak", environment.url.bidragSak);
    }

    async hentSak(saksnummer: string): Promise<IBidragSak> {
        const response = await this.get<IBidragSak>(`/bidrag-sak/sak/${saksnummer}`);
        if (response.status === HTTPStatus.NOT_FOUND) {
            throw new Error(removePlaceholder(SAK_IKKE_FINNES, saksnummer));
        }

        if (response.status !== HTTPStatus.OK) {
            throw new Error("Det skjedde en feil ved henting av sak");
        }

        await SecureLoggerService.info(`Hentet sak med id ${saksnummer} ferdig`);
        return response.data;
    }
}
