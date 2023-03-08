import { arbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { behandlingData } from "../testdata/behandlingTestData";
import { createSkattegrunnlag } from "../testdata/grunnlagTestData";
import { inntektData } from "../testdata/inntektTestData";

export const initMockData = () => {
    if (!localStorage.getItem("behandling-1234")) {
        localStorage.setItem(`behandling-1234`, JSON.stringify(behandlingData()));
    }
    if (!localStorage.getItem("inntekt-1234")) {
        localStorage.setItem(`inntekt-1234`, JSON.stringify(inntektData()));
    }
    if (!localStorage.getItem("arbeidsforhold-1234")) {
        localStorage.setItem(`arbeidsforhold-1234`, JSON.stringify(arbeidsforholdData()));
    }
    if (!localStorage.getItem("skattegrunlag-1234")) {
        localStorage.setItem(`skattegrunlag-1234`, JSON.stringify(createSkattegrunnlag()));
    }

    // setInterval(
    //     () =>
    //         sessionStorage.setItem(
    //             `behandling-1234`,
    //             JSON.stringify(
    //                 behandlingData({
    //                     virkningstidspunkt: mockDates[1],
    //                     aarsak: "AF",
    //                     avslag: "avslag_1",
    //                     vedtakNotat: "Different vedtak notat ",
    //                     notat: "Different not vedtak notat",
    //                 })
    //             )
    //         ),
    //     15000
    // );
};
