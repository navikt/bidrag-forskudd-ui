import { dateOrNull } from "../utils/date-utils";
import { useGetBehandlingV2 } from "./useApiData";

export const useVirkningsdato = () => {
    const {
        søktFomDato,
        virkningstidspunkt: { virkningstidspunkt: virkningsdato },
    } = useGetBehandlingV2();
    const datoFom = dateOrNull(virkningsdato) ?? dateOrNull(søktFomDato);

    return datoFom;
};
