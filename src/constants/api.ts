import { useApi } from "@navikt/bidrag-ui-common";

import { Api as BidragBehandlingApi } from "../api/BidragBehandlingApi";
import { Api as BidragGrunnlagApi } from "../api/BidragGrunnlagApi";
import { Api as BidragSakApi } from "../api/BidragSakApi";
import { Api as PersonApi } from "../api/PersonApi";
import environment from "../environment";

export const BIDRAG_SAK_API = useApi(new BidragSakApi({ baseURL: environment.url.bidragSak }), "bidrag-sak", "fss");
export const PERSON_API = useApi(new PersonApi({ baseURL: process.env.BIDRAG_PERSON_URL }), "bidrag-person", "fss");
export const BIDRAG_GRUNNLAG_API = useApi(
    new BidragGrunnlagApi({ baseURL: environment.url.bidragGrunnlag }),
    "bidrag-grunnlag",
    "fss"
);
export const BEHANDLING_API = useApi(
    new BidragBehandlingApi({ baseURL: environment.url.bidragBehandling }),
    "bidrag-behandling",
    "fss-gcp"
);
