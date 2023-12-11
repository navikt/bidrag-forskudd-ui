import { createPayload } from "../components/forms/helpers/boforholdFormHelpers";
import { useForskudd } from "../context/ForskuddContext";
import { BoforholdFormValues } from "../types/boforholdFormValues";
import { useUpdateBoforhold } from "./useApiData";

export const useOnSaveBoforhold = () => {
    const { behandlingId } = useForskudd();
    const updateBoforhold = useUpdateBoforhold(behandlingId);

    return (values: BoforholdFormValues) => updateBoforhold.mutation.mutate(createPayload(values));
};
