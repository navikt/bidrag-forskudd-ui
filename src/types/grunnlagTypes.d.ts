export interface SkattegrunnlagRequest {
    inntektsAar: string;
    inntektsFilter: string;
    personId: string;
}

export interface Grunnlag {
    beloep: string;
    tekniskNavn: string;
}

export interface SkattegrunnlagDto {
    grunnlag: Grunnlag[];
    svalbardGrunnlag: Grunnlag[];
    skatteoppgjoersdato: string;
}
