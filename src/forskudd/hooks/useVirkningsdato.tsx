import { useMemo } from "react";

import { useGetBehandlingV2 } from "../../common/hooks/useApiData";
import { dateOrNull } from "../../utils/date-utils";

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
