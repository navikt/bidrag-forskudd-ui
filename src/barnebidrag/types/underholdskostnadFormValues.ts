import {
    FaktiskTilsynsutgiftDto,
    Kilde,
    StonadTilBarnetilsynDto,
    TilleggsstonadDto,
    UnderholdDto,
} from "@api/BidragBehandlingApiV1";

interface UnderholdPeriode {
    datoFom: string;
    datoTom: string;
    kanRedigeres: boolean;
    erRedigerbart: boolean;
}

export interface StønadTilBarnetilsynPeriode extends UnderholdPeriode, StonadTilBarnetilsynDto {
    kilde: Kilde;
}
export interface FaktiskTilsynsutgiftPeriode extends UnderholdPeriode, FaktiskTilsynsutgiftDto {}
export interface TilleggsstonadPeriode extends UnderholdPeriode, TilleggsstonadDto {}

export type UnderholdkostnadsFormPeriode =
    | StønadTilBarnetilsynPeriode
    | FaktiskTilsynsutgiftPeriode
    | TilleggsstonadPeriode;

export interface Underhold
    extends Omit<UnderholdDto, "stønadTilBarnetilsyn" | "faktiskeTilsynsutgifter" | "tilleggsstønad"> {
    stønadTilBarnetilsyn?: StønadTilBarnetilsynPeriode[];
    faktiskeTilsynsutgifter?: FaktiskTilsynsutgiftPeriode[];
    tilleggsstønad?: TilleggsstonadPeriode[];
}
export type UnderholdskostnadFormValues = {
    underholdskostnader: Underhold[];
};
