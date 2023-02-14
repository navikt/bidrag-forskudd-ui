import { DefaultRestService, SecureLoggerService } from "@navikt/bidrag-ui-common";

import { HTTPStatus } from "../enum/HttpStatus";
import environment from "../environment";
import { HentSkattegrunnlagRequest, HentSkattegrunnlagResponse } from "../types/bidragGrunnlagTypes";

export default class GrunnlagService extends DefaultRestService {
    constructor() {
        super("bidrag-grunnlag", environment.url.bidragGrunnlag);
    }

    async hentSkatteGrunnlag(skattegrunnlagRequest: HentSkattegrunnlagRequest): Promise<HentSkattegrunnlagResponse> {
        const response = await this.post<HentSkattegrunnlagResponse>(
            "/integrasjoner/skattegrunnlag",
            JSON.stringify(skattegrunnlagRequest)
        );

        if (response.status !== HTTPStatus.OK) {
            throw new Error("Det skjedde en feil ved henting av skattegrunnlag");
        }

        await SecureLoggerService.info(`Hentet skattegrunnlag ferdig`);

        return response.data;
    }
}
