import sinon, { SinonSandbox } from "sinon";

import PersonService from "../../service/PersonService";
export function mockPerson(sinonSandbox: SinonSandbox = sinon.createSandbox()) {
    sinonSandbox.stub(PersonService.prototype, "hentPerson").callsFake(() => {
        return Promise.resolve({ ident: "213213213" });
    });

    return sinonSandbox;
}
