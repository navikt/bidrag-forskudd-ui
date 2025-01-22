import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledCustomTextareaEditor } from "@common/components/formFields/FormControlledCustomTextEditor";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { useOnSaveBoforhold } from "@common/hooks/useOnSaveBoforhold";
import { BoforholdFormValues } from "@common/types/boforholdFormValues";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { CustomTextareaEditor } from "../../../../common/components/CustomEditor";
import { STEPS } from "../../../constants/steps";
import { SærligeutgifterStepper } from "../../../enum/SærligeutgifterStepper";

export const Begrunnelse = () => {
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
    const {
        boforhold: { begrunnelseFraOpprinneligVedtak },
    } = useGetBehandlingV2();
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
    const onNext = () => onStepChange(STEPS[SærligeutgifterStepper.VEDTAK]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (["begrunnelse"].includes(name) && (type === "change" || type === undefined)) {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <FormControlledCustomTextareaEditor label={text.title.begrunnelse} name="begrunnelse" resize />
            {begrunnelseFraOpprinneligVedtak?.innhold && (
                <CustomTextareaEditor
                    name="begrunnelseFraOpprinneligVedtak"
                    label={text.label.begrunnelseFraOpprinneligVedtak}
                    value={begrunnelseFraOpprinneligVedtak.innhold}
                    resize
                    readOnly
                />
            )}
            <ActionButtons onNext={onNext} />
        </>
    );
};
