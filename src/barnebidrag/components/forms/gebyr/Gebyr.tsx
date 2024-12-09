import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { NyOpplysningerAlert } from "@common/components/inntekt/NyOpplysningerAlert";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { PersonNavn } from "@common/components/PersonNavn";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "@common/components/RolleTag";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { BodyShort, Label } from "@navikt/ds-react";
import { formatterBeløp } from "@utils/number-utils";
import React, { Fragment, useEffect, useMemo } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";
import { useOnUpdateGebyr } from "../../../hooks/useOnUpdateGebyr";
import { EndeligIlagtGebyr, GebyrFormValues } from "../../../types/gebyrFormValues";
import { createInitialValues } from "../helpers/GebryFormHelpers";

const Begrunnelse = ({ fieldName, onSave }: { fieldName: `gebyrRoller.${number}`; onSave: () => void }) => {
    const { control } = useFormContext<GebyrFormValues>();
    const watchBegrunnelse = useWatch({ control, name: `${fieldName}.begrunnelse` });

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (watchBegrunnelse !== undefined) {
            debouncedOnSave();
        }
    }, [watchBegrunnelse]);

    return (
        <FormControlledTextarea
            name={`${fieldName}.begrunnelse`}
            label={text.label.begrunnelse}
            className="w-[444px]"
            minRows={1}
        />
    );
};

const GebyrSelect = ({ fieldName, onSave }: { fieldName: `gebyrRoller.${number}`; onSave: () => void }) => {
    return (
        <FormControlledSelectField
            name={`${fieldName}.endeligIlagtGebyr`}
            className="w-fit"
            label={text.label.gebyr}
            options={[
                { value: EndeligIlagtGebyr.Fritatt, text: text.select.fritatt },
                { value: EndeligIlagtGebyr.Ilagt, text: text.select.ilagt },
            ]}
            onSelect={() => onSave()}
        />
    );
};

const booleanValueOfEndeligIlagtGebyr = {
    [EndeligIlagtGebyr.Ilagt]: true,
    [EndeligIlagtGebyr.Fritatt]: false,
};

const Side = () => {
    const { onStepChange } = useBehandlingProvider();

    return <ActionButtons onNext={() => onStepChange(STEPS[BarnebidragStepper.BOFORHOLD])} />;
};

const Main = () => {
    const { setSaveErrorState } = useBehandlingProvider();
    const {
        gebyr: { gebyrRoller },
    } = useGetBehandlingV2();
    const { control, getValues, setValue } = useFormContext<GebyrFormValues>();
    const barnFieldArray = useFieldArray({
        control,
        name: "gebyrRoller",
    });
    const watchFieldArray = useWatch({ control, name: "gebyrRoller" });
    const controlledFields = barnFieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const updateGebyr = useOnUpdateGebyr();

    const onSave = (fieldName: `gebyrRoller.${number}`) => () => {
        const gebyrRolle = getValues(fieldName);
        const overstyrGebyr =
            booleanValueOfEndeligIlagtGebyr[gebyrRolle.endeligIlagtGebyr] !== gebyrRolle.beregnetIlagtGebyr;
        const payload = {
            overstyrGebyr,
            rolleId: gebyrRolle.rolle.id,
            begrunnelse: overstyrGebyr ? gebyrRolle.begrunnelse : null,
        };
        updateGebyr.mutation.mutate(payload, {
            onSuccess: (response) => {
                if (!overstyrGebyr) {
                    setValue(`${fieldName}.begrunnelse`, "");
                }

                updateGebyr.queryClientUpdater((currentData) => {
                    const updatedGebyrIndex = currentData.gebyr.gebyrRoller.findIndex(
                        (gR) => gR.rolle.id === gebyrRolle.rolle.id
                    );
                    const updatedGebyrList = currentData.gebyr.gebyrRoller.toSpliced(updatedGebyrIndex, 1, response);
                    return {
                        ...currentData,
                        gebyr: {
                            ...currentData.gebyr,
                            gebyrRoller: updatedGebyrList,
                        },
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => onSave(fieldName)(),
                    rollbackFn: () => {
                        const cachedGebryRolle = gebyrRoller.find((gR) => gR.rolle.id === gebyrRolle.rolle.id);
                        setValue(fieldName, {
                            ...cachedGebryRolle,
                            endeligIlagtGebyr: cachedGebryRolle.endeligIlagtGebyr
                                ? EndeligIlagtGebyr.Ilagt
                                : EndeligIlagtGebyr.Fritatt,
                        });
                    },
                });
            },
        });
    };

    return (
        <>
            {controlledFields.map((item, index) => {
                const onSaveFn = onSave(`gebyrRoller.${index}`);
                return (
                    <Fragment key={item.id}>
                        <div className="grid gap-y-2">
                            <div className="grid grid-cols-[max-content,max-content,auto] p-2 bg-white border border-solid border-[var(--a-border-default)]">
                                <div>
                                    <RolleTag rolleType={item.rolle.rolletype} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <BodyShort size="small" className="font-bold">
                                        <PersonNavn ident={item.rolle.ident}></PersonNavn>
                                    </BodyShort>
                                    <BodyShort size="small">{item.rolle.ident}</BodyShort>
                                </div>
                            </div>

                            <div className="flex gap-x-2">
                                <Label size="small">{text.label.skattepliktigeInntekt}:</Label>
                                <BodyShort size="small">{formatterBeløp(item.inntekt.skattepliktigInntekt)}</BodyShort>
                            </div>
                            <div className="flex gap-x-2">
                                <Label size="small">{text.label.høyesteBarnetillegg}:</Label>
                                <BodyShort size="small">{formatterBeløp(item.inntekt.maksBarnetillegg)}</BodyShort>
                            </div>
                            <div className="flex gap-x-2">
                                <Label size="small">{text.label.totalt}:</Label>
                                <BodyShort size="small">{formatterBeløp(item.inntekt.totalInntekt)}</BodyShort>
                            </div>
                            <div className="flex gap-x-2">
                                <GebyrSelect fieldName={`gebyrRoller.${index}`} onSave={onSaveFn} />
                                {item.endeligIlagtGebyr === EndeligIlagtGebyr.Ilagt && (
                                    <div className="self-end flex gap-x-2">
                                        <Label size="small">{text.label.beløp}:</Label>
                                        <BodyShort size="small">{formatterBeløp(item.beløpGebyrsats)}</BodyShort>
                                    </div>
                                )}
                            </div>
                            {booleanValueOfEndeligIlagtGebyr[item.endeligIlagtGebyr] !== item.beregnetIlagtGebyr && (
                                <div>
                                    <Begrunnelse fieldName={`gebyrRoller.${index}`} onSave={onSaveFn} />
                                </div>
                            )}
                        </div>
                    </Fragment>
                );
            })}
        </>
    );
};

const GebyrForm = () => {
    const {
        gebyr: { gebyrRoller },
    } = useGetBehandlingV2();
    const initialValues = useMemo(() => createInitialValues(gebyrRoller), [gebyrRoller]);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <NewFormLayout title="Gebyr" main={<Main />} side={<Side />} pageAlert={<NyOpplysningerAlert />} />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <GebyrForm />
        </QueryErrorWrapper>
    );
};
