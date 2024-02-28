import { useSuspenseQuery } from "@tanstack/react-query";

import { Inntektsrapportering } from "../api/BidragBehandlingApiV1";
import { BEHANDLING_API_V1 } from "../constants/api";

const inntekskodeMedÅrstall = [
    Inntektsrapportering.AINNTEKT.toString(),
    Inntektsrapportering.KAPITALINNTEKT.toString(),
    Inntektsrapportering.LIGNINGSINNTEKT.toString(),
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

export function hentVisningsnavn(kode: string, årstall?: number) {
    const visningsnavnMap = JSON.parse(window.localStorage.getItem("visningsnavn") || "{}");
    const toVisningsnavn = (kode: string) => {
        return visningsnavnMap[kode] ?? "MANGLER_VISNINGSNAVN";
    };
    const toVisningsnavnInntekt = (kode: string, årstall?: number) => {
        if (inntekskodeMedÅrstall.includes(kode)) return `${toVisningsnavn(kode)} ${årstall ?? ""}`.trim();
        return toVisningsnavn(kode);
    };
    return allInntektskoder.includes(kode) ? toVisningsnavnInntekt(kode, årstall) : toVisningsnavn(kode);
}
