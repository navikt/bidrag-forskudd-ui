import { arbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { behandlingData } from "../testdata/behandlingTestData";
import { createSkattegrunnlag } from "../testdata/grunnlagTestData";
import { inntektData } from "../testdata/inntektTestData";

export const initMockData = () => {
    sessionStorage.setItem(`behandling-1234`, JSON.stringify(behandlingData()));
    sessionStorage.setItem(`inntekt-1234`, JSON.stringify(inntektData()));
    sessionStorage.setItem(`arbeidsforhold-1234`, JSON.stringify(arbeidsforholdData()));
    sessionStorage.setItem(`skattegrunlag-1234`, JSON.stringify(createSkattegrunnlag()));

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
