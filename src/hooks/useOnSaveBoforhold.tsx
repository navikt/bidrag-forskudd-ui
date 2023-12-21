import { createPayload } from "../components/forms/helpers/boforholdFormHelpers";
import { useForskudd } from "../context/ForskuddContext";
import { BoforholdFormValues } from "../types/boforholdFormValues";
import { useOppdaterBehandling } from "./useApiData";

export const useOnSaveBoforhold = () => {
    const { behandlingId } = useForskudd();
    const updateBoforhold = useOppdaterBehandling(behandlingId);

    return (values: BoforholdFormValues) => updateBoforhold.mutation.mutate(createPayload(values));
};
