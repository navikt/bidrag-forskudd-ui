import { useFormContext } from "react-hook-form";

import { createInntektPayload } from "../components/forms/helpers/inntektFormHelpers";
import { useForskudd } from "../context/ForskuddContext";
import { InntektFormValues } from "../types/inntektFormValues";
import { useUpdateInntekter } from "./useApiData";

export const useOnSaveInntekt = () => {
    const { behandlingId } = useForskudd();
    const updateInntekter = useUpdateInntekter(behandlingId);
    const { reset } = useFormContext<InntektFormValues>();
    return (values: InntektFormValues) => {
        updateInntekter.mutation.mutate(createInntektPayload(values), {
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
