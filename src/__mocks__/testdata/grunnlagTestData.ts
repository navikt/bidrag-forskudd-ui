import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";

const randomSalary = () => {
    const min = 2e5;
    const max = 1.5e6;

    return Math.round(min + Math.random() * (max - min));
};

export const createSkattegrunnlag = () =>
    [
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2023",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2022",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "loenn_og_trekk",
                },
            ],
            skatteoppgjoersdato: "2021",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2020",
        },
    ] as HentSkattegrunnlagResponse[];
