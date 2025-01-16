import { ActionButtons } from "@common/components/ActionButtons";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useDebounce } from "@common/hooks/useDebounce";
import { useOnSaveBoforhold } from "@common/hooks/useOnSaveBoforhold";
import { BoforholdFormValues } from "@common/types/boforholdFormValues";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { CustomTextareaEditor } from "../../../../common/components/CustomEditor";
import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";

export const Begrunnelse = () => {
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
    const { watch, getValues, setValue } = useFormContext<BoforholdFormValues>();
    const saveBoforhold = useOnSaveBoforhold();
    const [previousValue, setPreviousValues] = useState<string>(getValues("begrunnelse"));

    const onSave = () =>
        saveBoforhold.mutation.mutate(
            { oppdatereBegrunnelse: { nyBegrunnelse: getValues("begrunnelse") } },
            {
                onSuccess: (response) => {
                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                begrunnelse: {
                                    innhold: response.begrunnelse,
                                    kunINotat: response.begrunnelse,
                                },
                            },
                        };
                    });
                    setPreviousValues(response.begrunnelse);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue("begrunnelse", previousValue ?? "");
                        },
                    });
                },
            }
        );
    const onNext = () => onStepChange(STEPS[BarnebidragStepper.SAMVÆR]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (["begrunnelse"].includes(name) && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <CustomTextareaEditor label={text.title.begrunnelse} name={`begrunnelse`} resize />
            <ActionButtons onNext={onNext} />
        </>
    );
};
