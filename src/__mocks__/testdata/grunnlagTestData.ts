import { SkattegrunnlagDto } from "../../types/grunnlagTypes";

export const defaultSkattegrunnlag: SkattegrunnlagDto = {
    grunnlag: [
        {
            beloep: "750000",
            tekniskNavn: "test",
        },
    ],
    svalbardGrunnlag: [],
    skatteoppgjoersdato: "2022",
};

export const createSkattegrunnlag = (year: string) => ({ ...defaultSkattegrunnlag, skatteoppgjoersdato: year });
