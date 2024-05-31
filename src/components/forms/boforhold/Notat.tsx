import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { STEPS } from "../../../constants/steps";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useDebounce } from "../../../hooks/useDebounce";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { ActionButtons } from "../inntekt/ActionButtons";

export const Notat = () => {
    const { onStepChange, setSaveErrorState } = useForskudd();
    const { watch, getValues, setValue } = useFormContext<BoforholdFormValues>();
    const saveBoforhold = useOnSaveBoforhold();
    const [previousValues, setPreviousValues] = useState<string>(getValues("notat.kunINotat"));

    const onSave = () =>
        saveBoforhold.mutation.mutate(
            { oppdatereNotat: { kunINotat: getValues("notat.kunINotat") } },
            {
                onSuccess: (response) => {
                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                notat: response.oppdatertNotat,
                            },
                        };
                    });
                    setPreviousValues(response.oppdatertNotat.kunINotat);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue("notat.kunINotat", previousValues ?? "");
                        },
                    });
                },
            }
        );
    const onNext = () => onStepChange(STEPS[ForskuddStepper.INNTEKT]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (["notat.kunINotat"].includes(name) && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <FormControlledTextarea name="notat.kunINotat" label={text.title.begrunnelse} />
            <ActionButtons onNext={onNext} />
        </>
    );
};
