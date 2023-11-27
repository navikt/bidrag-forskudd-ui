import { firstDayOfMonth, lastDayOfMonth } from "@navikt/bidrag-ui-common";
import { expect } from "chai";
import { describe } from "mocha";

import { behandlingMockApiData } from "../../__mocks__/testdata/behandlingTestData";
import { ForskuddAarsakType } from "../../api/BidragBehandlingApi";
import {
    aarsakToVirkningstidspunktMapper,
    getFomAndTomForMonthPicker,
    getSoktFraOrMottatDato,
} from "../../components/forms/helpers/virkningstidspunktHelpers";
import { addMonths, deductMonths } from "../../utils/date-utils";

describe("VirkningstidspunktFormHelpers", () => {
    it("should return later date of the two - soktFraDato or mottatoDato", () => {
        const soktFra = new Date("2019-04-01");
        const mottatDato = new Date("2019-11-03");
        const virkningsDato = getSoktFraOrMottatDato(soktFra, mottatDato);
        expect(virkningsDato.toLocaleDateString()).equals(mottatDato.toLocaleDateString());
    });

    it("should set the date to mottatoDate if soktFraDato is earlier when årsak is fra kravfremsettelse", () => {
        const behandling = behandlingMockApiData;
        const aarsak = ForskuddAarsakType.DF;
        const virkningsDato = aarsakToVirkningstidspunktMapper(aarsak, behandling);
        expect(virkningsDato.toLocaleDateString()).equals(
            firstDayOfMonth(new Date(behandling.mottatDato)).toLocaleDateString()
        );
    });

    it("should set the date to soktFraDato if mottatoDato is later when årsak is fra kravfremsettelse", () => {
        const behandling = { ...behandlingMockApiData, mottatDato: "2019-04-03", datoFom: "2019-10-03" };
        const aarsak = ForskuddAarsakType.DF;
        const virkningsDato = aarsakToVirkningstidspunktMapper(aarsak, behandling);
        expect(virkningsDato.toLocaleDateString()).equals(
            firstDayOfMonth(new Date(behandling.datoFom)).toLocaleDateString()
        );
    });

    it("should set the date to 3 months back in time if soktFraDato is in past and not earlier than mottatDato when årsak is 3 måneder tilbake", () => {
        const mottatDato = "2019-07-03";
        const behandling = { ...behandlingMockApiData, mottatDato, datoFom: "2019-02-03" };
        const aarsak = ForskuddAarsakType.EF;
        const threeMonthsBackInTimeFromMottatDato = firstDayOfMonth(deductMonths(new Date(mottatDato), 3));
        const virkningsDato = aarsakToVirkningstidspunktMapper(aarsak, behandling);
        expect(virkningsDato.toLocaleDateString()).equals(threeMonthsBackInTimeFromMottatDato.toLocaleDateString());
    });

    it("should set the date to soktFraDato if it is in past and less than 3 months earlier than mottatDato when årsak is 3 måneder tilbake", () => {
        const mottatDato = "2019-07-03";
        const behandling = { ...behandlingMockApiData, mottatDato, datoFom: "2019-05-03" };
        const aarsak = ForskuddAarsakType.EF;
        const virkningsDato = aarsakToVirkningstidspunktMapper(aarsak, behandling);
        expect(virkningsDato.toLocaleDateString()).equals(
            firstDayOfMonth(new Date(behandling.datoFom)).toLocaleDateString()
        );
    });

    it("should set the date to soktFraDato if it is in past and earlier than mottatDato when årsak is 3 måneder tilbake", () => {
        const mottatDato = "2019-07-03";
        const behandling = { ...behandlingMockApiData, mottatDato, datoFom: "2019-08-03" };
        const aarsak = ForskuddAarsakType.EF;
        const virkningsDato = aarsakToVirkningstidspunktMapper(aarsak, behandling);
        expect(virkningsDato.toLocaleDateString()).equals(
            firstDayOfMonth(new Date(behandling.datoFom)).toLocaleDateString()
        );
    });

    it("should set the date to soktFraDato when årsak is fra søknadstidspunkt", () => {
        const behandling = { ...behandlingMockApiData };
        const aarsak = ForskuddAarsakType.HF;
        const virkningsDato = aarsakToVirkningstidspunktMapper(aarsak, behandling);
        expect(virkningsDato.toLocaleDateString()).equals(
            firstDayOfMonth(new Date(behandling.datoFom)).toLocaleDateString()
        );
    });

    it("getFomAndTomForMonthPicker should set fom to first day of month of virkningstidspunkt and tom to last day of current month", () => {
        const virkningsDato = new Date("2019-07-03");
        const [fom, tom] = getFomAndTomForMonthPicker(virkningsDato);
        expect(fom.toLocaleDateString()).equals(firstDayOfMonth(virkningsDato).toLocaleDateString());
        expect(tom.toLocaleDateString()).equals(lastDayOfMonth(new Date()).toLocaleDateString());
    });

    it("getFomAndTomForMonthPicker should set fom to first day of month of virkningstidspunkt and tom to last day of virkningstidspunkt month if virkningstidspunkt is in future", () => {
        const virkningsDato = addMonths(new Date(), 3);
        const [fom, tom] = getFomAndTomForMonthPicker(virkningsDato);
        expect(fom.toLocaleDateString()).equals(firstDayOfMonth(virkningsDato).toLocaleDateString());
        expect(tom.toLocaleDateString()).equals(lastDayOfMonth(virkningsDato).toLocaleDateString());
    });
});
