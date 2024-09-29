import { InntekterDtoV2, RolleDto, Rolletype } from "@api/BidragBehandlingApiV1";
import { transformInntekt } from "@common/helpers/inntektFormHelpers";
import { InntektFormValues } from "@common/types/inntektFormValues";

export const createInitialForskuddInntektValues = (
    roller: RolleDto[],
    inntekter: InntekterDtoV2,
    virkningsdato: Date
): InntektFormValues => {
    const barnListe = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const bm = roller.find((rolle) => rolle.rolletype === Rolletype.BM);
    const transformFn = transformInntekt(virkningsdato);

    return {
        årsinntekter: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.årsinntekter
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        barnetillegg: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: barnListe.reduce(
                    (acc, barn) => ({
                        ...acc,
                        [barn.ident]: inntekter.barnetillegg
                            ?.filter((inntekt) => inntekt.gjelderBarn === barn.ident && inntekt.ident === rolle.ident)
                            .map(transformFn),
                    }),
                    {}
                ),
            }),
            {}
        ),
        kontantstøtte: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: barnListe.reduce(
                    (acc, barn) => ({
                        ...acc,
                        [barn.ident]: inntekter.kontantstøtte
                            ?.filter((inntekt) => inntekt.gjelderBarn === barn.ident && inntekt.ident === rolle.ident)
                            .map(transformFn),
                    }),
                    {}
                ),
            }),
            {}
        ),
        småbarnstillegg: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.småbarnstillegg
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        utvidetBarnetrygd: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.utvidetBarnetrygd
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        begrunnelser: {
            [bm.id]: inntekter.begrunnelser?.find((begrunnelse) => begrunnelse.gjelder?.id === bm.id)?.innhold ?? "",
        },
    };
};
