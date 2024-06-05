import { Api as BidragBehandlingApiV1 } from "@api/BidragBehandlingApiV1";
import { Api as BidragDokumentProduksjonApi } from "@api/BidragDokumentProduksjonApi";
import { Api as BidragGrunnlagApi } from "@api/BidragGrunnlagApi";
import { Api as BidragVedtakApi } from "@api/BidragVedtakApi";
import { Api as PersonApi } from "@api/PersonApi";
import { useApi } from "@navikt/bidrag-ui-common";

import environment from "../../environment";

export const PERSON_API = useApi(new PersonApi({ baseURL: process.env.BIDRAG_PERSON_URL }), "bidrag-person", "fss");
export const BIDRAG_VEDTAK_API = useApi(
    new BidragVedtakApi({ baseURL: environment.url.bidragVedtak }),
    "bidrag-vedtak",
    "gcp"
);
export const BIDRAG_GRUNNLAG_API = useApi(
    new BidragGrunnlagApi({ baseURL: environment.url.bidragGrunnlag }),
    "bidrag-grunnlag",
    "gcp"
);

export const BEHANDLING_API_V1 = useApi(
    new BidragBehandlingApiV1({ baseURL: environment.url.bidragBehandling }),
    "bidrag-behandling",
    "gcp"
);

export const BIDRAG_DOKUMENT_PRODUKSJON_API = useApi(
    new BidragDokumentProduksjonApi({ baseURL: environment.url.bidragDokumentProduksjon }),
    "bidrag-dokument-produksjon",
    "gcp"
);
