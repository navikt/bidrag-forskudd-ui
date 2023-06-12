import { useApi } from "@navikt/bidrag-ui-common";

import { Api as BidragBehandlingApi, BehandlingDto } from "../api/BidragBehandlingApi";
import { Api as BidragGrunnlagApi } from "../api/BidragGrunnlagApi";
import { Api as PersonApi } from "../api/PersonApi";
import environment from "../environment";

export const PERSON_API = useApi(new PersonApi({ baseURL: process.env.BIDRAG_PERSON_URL }), "bidrag-person", "fss");
export const BIDRAG_GRUNNLAG_API = useApi(
    new BidragGrunnlagApi({ baseURL: environment.url.bidragGrunnlag }),
    "bidrag-grunnlag",
    "fss"
);

export const BEHANDLING_API: BidragBehandlingApi<BehandlingDto> = useApi(
    new BidragBehandlingApi({ baseURL: environment.url.bidragBehandling }),
    "bidrag-behandling",
    "gcp"
);
