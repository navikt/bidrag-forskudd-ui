import { OppdatereManuellInntekt, OppdaterePeriodeInntekt, OppdaterNotat } from "../api/BidragBehandlingApiV1";
import { useOppdaterBehandlingV2 } from "./useApiData";

export const useOnSaveInntekt = () => {
    const updateInntekter = useOppdaterBehandlingV2();
    return (updatedValues: {
        oppdatereInntektsperioder?: OppdaterePeriodeInntekt[];
        oppdatereManuelleInntekter?: OppdatereManuellInntekt[];
        sletteInntekter?: number[];
        notat?: OppdaterNotat;
    }) =>
        updateInntekter.mutation.mutate({
            inntekter: {
                oppdatereInntektsperioder: [],
                oppdatereManuelleInntekter: [],
                sletteInntekter: [],
                ...updatedValues,
            },
        });
};
