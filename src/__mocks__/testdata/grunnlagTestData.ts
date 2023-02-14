import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";

const randomSalary = () => {
    const min = 2e5;
    const max = 1.5e6;

    return Math.round(min + Math.random() * (max - min));
};

export const createSkattegrunnlag = (year: string) =>
    ({
        grunnlag: [
            {
                beloep: randomSalary().toString(),
                tekniskNavn: "test",
            },
        ],
        skatteoppgjoersdato: year,
    } as HentSkattegrunnlagResponse);
