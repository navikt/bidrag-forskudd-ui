import { Periode } from "./inntektTestData";

export interface ArbeidsforholdData {
    periode: Periode;
    arbeidsgiverNavn: string;
    stillingsprosent: number;
    sisteLoennsendring: string;
}

export const arbeidsforholdData = () => {
    const initialData = [
        {
            periode: {
                fraDato: "2021-11-05",
                tilDato: "2022-10-05",
            },
            arbeidsgiverNavn: "Arbeidsgiver 1",
            stillingsprosent: 90,
            sisteLoennsendring: "2022-10-05",
        },
    ] as ArbeidsforholdData[];

    return initialData;
};
