import { useUpdateInntekt } from "./useApiData";

export const useOnSaveInntekt = () => {
    const updateInntekter = useUpdateInntekt();

    return updateInntekter;
};
