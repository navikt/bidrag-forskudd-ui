import { useOppdaterBehandlingV2 } from "./useApiData";

export const useOnSaveInntekt = () => {
    const updateInntekter = useOppdaterBehandlingV2();
    return updateInntekter.mutation;
};
