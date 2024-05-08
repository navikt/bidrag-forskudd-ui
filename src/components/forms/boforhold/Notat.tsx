import React, { useEffect } from "react";
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
    const { setActiveStep } = useForskudd();
    const { watch, getValues } = useFormContext<BoforholdFormValues>();
    const saveBoforhold = useOnSaveBoforhold();
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
                },
            }
        );
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.INNTEKT]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name }) => {
            if (["notat.kunINotat"].includes(name)) {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <FormControlledTextarea name="notat.kunINotat" label={text.label.begrunnelseKunINotat} />
            <ActionButtons onNext={onNext} />
        </>
    );
};
