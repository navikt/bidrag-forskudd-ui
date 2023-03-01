import { behandlingData } from "../testdata/behandlingTestData";
import { inntektData } from "../testdata/inntektTestData";

export const initMockData = () => {
    sessionStorage.setItem(`behandling-1234`, JSON.stringify(behandlingData()));
    sessionStorage.setItem(`inntekt-1234`, JSON.stringify(inntektData()));

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
