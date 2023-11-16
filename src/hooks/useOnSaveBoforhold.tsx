import { useFormContext } from "react-hook-form";

import { createPayload } from "../components/forms/helpers/boforholdFormHelpers";
import { useForskudd } from "../context/ForskuddContext";
import { BoforholdFormValues } from "../types/boforholdFormValues";
import { useUpdateBoforhold } from "./useApiData";

export const useOnSaveBoforhold = () => {
    const { behandlingId } = useForskudd();
    const updateBoforhold = useUpdateBoforhold(behandlingId);
    const { reset } = useFormContext<BoforholdFormValues>();
    return (values: BoforholdFormValues) => {
        console.log("MUTATE ME");
        updateBoforhold.mutation.mutate(createPayload(values), {
            onSuccess: () =>
                reset(values, {
                    keepErrors: true,
                    keepValues: true,
                    keepDefaultValues: true,
                    keepDirtyValues: true,
                }),
        });
    };
};
