import { useGetVisningsnavn } from "./useApiData";

export default function useVisningsnavn() {
    const { data: visningsnavnMap } = useGetVisningsnavn();

    return (kode: string) => visningsnavnMap.data[kode] ?? "MANGLER_VISNINGSNAVN";
}
