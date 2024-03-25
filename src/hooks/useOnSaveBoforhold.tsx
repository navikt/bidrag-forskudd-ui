import { createPayload } from "../components/forms/helpers/boforholdFormHelpers";
import { BoforholdFormValues } from "../types/boforholdFormValues";
import { useOppdaterBehandlingV2 } from "./useApiData";

export const useOnSaveBoforhold = () => {
    const updateBoforhold = useOppdaterBehandlingV2();

    return (values: BoforholdFormValues) => updateBoforhold.mutation.mutate(createPayload(values));
};
