import { Heading } from "@navikt/ds-react";
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
    const { setActiveStep, boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const { watch } = useFormContext<BoforholdFormValues>();
    const saveBoforhold = useOnSaveBoforhold();
    const onSave = () =>
        saveBoforhold.mutation.mutate(
            { oppdatereNotat: boforholdFormValues.notat },
            {
                onSuccess: (response) => {
                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                husstandsbarn: currentData.boforhold.husstandsbarn.concat(
                                    response.oppdatertHusstandsbarn
                                ),
                            },
                        };
                    });
                },
            }
        );
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.INNTEKT]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch(({ notat }, { name }) => {
            if (["notat.medIVedtaket", "notat.kunINotat"].includes(name)) {
                setBoforholdFormValues((prev) => ({
                    ...prev,
                    notat,
                }));
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <Heading level="3" size="medium">
                {text.title.begrunnelse}
            </Heading>
            <FormControlledTextarea name="notat.medIVedtaket" label={text.label.begrunnelseMedIVedtaket} />
            <FormControlledTextarea name="notat.kunINotat" label={text.label.begrunnelseKunINotat} />
            <ActionButtons onNext={onNext} />
        </>
    );
};
