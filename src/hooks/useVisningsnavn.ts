import { useSuspenseQuery } from "@tanstack/react-query";

import { Inntektsrapportering } from "../api/BidragBehandlingApiV1";
import { BEHANDLING_API_V1 } from "../constants/api";
import { dateToMMYYYY, getYearFromDate } from "../utils/date-utils";

const inntekskodeMedÅrstall = [
    Inntektsrapportering.AINNTEKT.toString(),
    Inntektsrapportering.KAPITALINNTEKT.toString(),
    Inntektsrapportering.LIGNINGSINNTEKT.toString(),
];
const inntekskodeMedPeriode = [
    Inntektsrapportering.OVERGANGSSTONAD.toString(),
    Inntektsrapportering.AINNTEKTBEREGNET12MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT.toString(),
    Inntektsrapportering.AINNTEKTBEREGNET3MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT.toString(),
];
const allInntektskoder = Object.values(Inntektsrapportering).map((entry) => entry.toString());

export function prefetchVisningsnavn() {
    return useSuspenseQuery({
        queryKey: ["visningsnavn"],
        queryFn: () =>
            BEHANDLING_API_V1.api.hentVisningsnavn().then((response) => {
                window.localStorage.setItem("visningsnavn", JSON.stringify(response.data));
                return response.data;
            }),
    });
}

export function hentVisningsnavn(kode: string, datoFom?: Date | string, datoTom?: Date | string) {
    const visningsnavnMap = JSON.parse(window.localStorage.getItem("visningsnavn") || "{}");
    const toVisningsnavn = (kode: string) => {
        return visningsnavnMap[kode] ?? "MANGLER_VISNINGSNAVN";
    };
    const toVisningsnavnInntekt = (kode: string, datoFom?: Date | string, datoTom?: Date | string) => {
        const årstall = getYearFromDate(datoFom);
        if (inntekskodeMedÅrstall.includes(kode)) return `${toVisningsnavn(kode)} ${årstall ?? ""}`.trim();
        if (inntekskodeMedPeriode.includes(kode)) {
            const dateString = `${dateToMMYYYY(datoFom)} - ${dateToMMYYYY(datoTom) ?? ""}`;
            return `${toVisningsnavn(kode)} ${dateString}`.trim();
        }
        return toVisningsnavn(kode);
    };
    return allInntektskoder.includes(kode) ? toVisningsnavnInntekt(kode, datoFom, datoTom) : toVisningsnavn(kode);
}
