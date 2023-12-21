import { createPayload } from "../components/forms/helpers/boforholdFormHelpers";
import { BoforholdFormValues } from "../types/boforholdFormValues";
import { useOppdaterBehandling } from "./useApiData";

export const useOnSaveBoforhold = () => {
    const updateBoforhold = useOppdaterBehandling();

    return (values: BoforholdFormValues) => updateBoforhold.mutation.mutate(createPayload(values));
};
