import { Inntektsrapportering } from "../api/BidragInntektApi";
import { useGetVisningsnavn } from "./useApiData";

const inntekskodeMedÅrstall = [
    Inntektsrapportering.AINNTEKT.toString(),
    Inntektsrapportering.KAPITALINNTEKT.toString(),
    Inntektsrapportering.LIGNINGSINNTEKT.toString(),
];
const allInntektskoder = Object.values(Inntektsrapportering).map((entry) => entry.toString());
export default function useVisningsnavn() {
    const { data: visningsnavnMap } = useGetVisningsnavn();

    const toVisningsnavn = (kode: string) => visningsnavnMap.data[kode] ?? "MANGLER_VISNINGSNAVN";
    const toVisningsnavnInntekt = (kode: string, årstall?: number) => {
        if (inntekskodeMedÅrstall.includes(kode)) return `${toVisningsnavn(kode)} ${årstall ?? ""}`.trim();
        return toVisningsnavn(kode);
    };
    return (kode: string, årstall?: number) =>
        allInntektskoder.includes(kode) ? toVisningsnavnInntekt(kode, årstall) : toVisningsnavn(kode);
}
