import { useMemo } from "react";

import { dateOrNull } from "../utils/date-utils";
import { useGetBehandlingV2 } from "./useApiData";

export const useVirkningsdato = () => {
    const {
        søktFomDato,
        virkningstidspunkt: { virkningstidspunkt: virkningsdato },
    } = useGetBehandlingV2();
    const virkningsOrSoktFraDato = useMemo(
        () => dateOrNull(virkningsdato) ?? dateOrNull(søktFomDato),
        [virkningsdato, søktFomDato]
    );

    return virkningsOrSoktFraDato;
};
