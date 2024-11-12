import {
    FaktiskTilsynsutgiftDto,
    StonadTilBarnetilsynDto,
    TilleggsstonadDto,
    UnderholdDto,
} from "@api/BidragBehandlingApiV1";

import {
    FaktiskTilsynsutgiftPeriode,
    StønadTilBarnetilsynPeriode,
    TilleggsstonadPeriode,
    UnderholdskostnadFormValues,
} from "../../../types/underholdskostnadFormValues";

const transformUnderholdskostnadPeriode = (
    periode: StonadTilBarnetilsynDto | FaktiskTilsynsutgiftDto | TilleggsstonadDto
) => ({
    ...periode,
    datoFom: periode.periode.fom,
    datoTom: periode.periode.tom,
    kanRedigeres: true,
    erRedigerbart: false,
});
export const createInitialValues = (underholdskostnader: UnderholdDto[]): UnderholdskostnadFormValues => {
    return {
        underholdskostnader: underholdskostnader.map((underhold) => ({
            ...underhold,
            stønadTilBarnetilsyn:
                underhold.stønadTilBarnetilsyn?.map((barnetilsyn) => ({
                    ...(transformUnderholdskostnadPeriode(barnetilsyn) as StønadTilBarnetilsynPeriode),
                })) ?? [],
            faktiskeTilsynsutgifter:
                underhold.faktiskeTilsynsutgifter?.map((tilsynsutgift) => ({
                    ...(transformUnderholdskostnadPeriode(tilsynsutgift) as FaktiskTilsynsutgiftPeriode),
                })) ?? [],
            tilleggsstønad:
                underhold.tilleggsstønad?.map((tillegsstonad) => ({
                    ...(transformUnderholdskostnadPeriode(tillegsstonad) as TilleggsstonadPeriode),
                })) ?? [],
        })),
    };
};
