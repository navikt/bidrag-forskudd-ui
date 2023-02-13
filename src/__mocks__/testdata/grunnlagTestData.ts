import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";

export const defaultSkattegrunnlag: HentSkattegrunnlagResponse = {
    grunnlag: [
        {
            beloep: "750000",
            tekniskNavn: "test",
        },
    ],
    skatteoppgjoersdato: "2022",
};

export const createSkattegrunnlag = (year: string) => ({ ...defaultSkattegrunnlag, skatteoppgjoersdato: year });
