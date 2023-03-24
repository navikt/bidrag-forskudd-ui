import { createAInntektData } from "../testdata/aInntektTestData";
import { arbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { createSkattegrunnlag } from "../testdata/grunnlagTestData";
import { inntektData } from "../testdata/inntektTestData";

export const initMockData = () => {
    if (!localStorage.getItem("inntekt")) {
        localStorage.setItem(`inntekt`, JSON.stringify(inntektData()));
    }
    if (!localStorage.getItem("arbeidsforhold")) {
        localStorage.setItem(`arbeidsforhold`, JSON.stringify(arbeidsforholdData()));
    }
    if (!localStorage.getItem("skattegrunlag")) {
        localStorage.setItem(`skattegrunlag`, JSON.stringify(createSkattegrunnlag()));
    }
    if (!localStorage.getItem("ainntekt")) {
        localStorage.setItem(`ainntekt`, JSON.stringify(createAInntektData()));
    }

    // setInterval(
    //     () =>
    //         sessionStorage.setItem(
    //             `behandling`,
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
