import { useFormContext } from "react-hook-form";

import { createInntektPayload } from "../components/forms/helpers/inntektFormHelpers";
import { InntektFormValues } from "../types/inntektFormValues";
import { useOppdaterBehandlingV2 } from "./useApiData";

export const useOnSaveInntekt = () => {
    const updateInntekter = useOppdaterBehandlingV2();
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
