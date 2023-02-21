import sinon, { SinonSandbox } from "sinon";

import { Api as BidragSakApi } from "../../api/BidragSakApi";
import PersonService from "../../service/PersonService";
import { bidragsak } from "../testdata/sakTestData";
export function mockPerson(sinonSandbox: SinonSandbox = sinon.createSandbox()) {
    sinonSandbox.stub(PersonService.prototype, "hentPerson").callsFake(() => {
        return Promise.resolve({ ident: "213213213" });
    });

    return sinonSandbox;
}

export function mockSak(sinonSandbox: SinonSandbox = sinon.createSandbox()) {
    const mockBidragSakApi = new BidragSakApi();
    sinonSandbox.stub(mockBidragSakApi, "bidragSak").value({
        findMetadataForSak: () => Promise.resolve(bidragsak),
    });

    return sinonSandbox;
}
