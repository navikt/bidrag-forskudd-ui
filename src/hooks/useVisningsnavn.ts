import { useSuspenseQuery } from "@tanstack/react-query";

import { Inntektsrapportering } from "../api/BidragInntektApi";
import { BEHANDLING_API_V1 } from "../constants/api";
import { useGetVisningsnavn } from "./useApiData";

const inntekskodeMedÅrstall = [
    Inntektsrapportering.AINNTEKT.toString(),
    Inntektsrapportering.KAPITALINNTEKT.toString(),
    Inntektsrapportering.LIGNINGSINNTEKT.toString(),
];
const allInntektskoder = Object.values(Inntektsrapportering).map((entry) => entry.toString());
export default function useVisningsnavn() {
    const { data: visningsnavnMap } = useGetVisningsnavn();

    const toVisningsnavn = (kode: string) => {
        return visningsnavnMap.data[kode] ?? "MANGLER_VISNINGSNAVN";
    };
    const toVisningsnavnInntekt = (kode: string, årstall?: number) => {
        if (inntekskodeMedÅrstall.includes(kode)) return `${toVisningsnavn(kode)} ${årstall ?? ""}`.trim();
        return toVisningsnavn(kode);
    };
    return (kode: string, årstall?: number) =>
        allInntektskoder.includes(kode) ? toVisningsnavnInntekt(kode, årstall) : toVisningsnavn(kode);
}
export function prefetchVisningsnavn() {
    return useSuspenseQuery({
        queryKey: ["visningsnavn"],
        queryFn: () => lagreVisningsnavn(),
    });
}
export async function lagreVisningsnavn() {
    return BEHANDLING_API_V1.api.hentVisningsnavn().then((response) => {
        window.localStorage.setItem("visningsnavn", JSON.stringify(response.data));
        return response.data;
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
