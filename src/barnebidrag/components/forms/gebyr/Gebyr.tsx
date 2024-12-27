import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { NyOpplysningerAlert } from "@common/components/inntekt/NyOpplysningerAlert";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "@common/components/RolleTag";
import elementIds from "@common/constants/elementIds";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { BodyShort, Box, Label } from "@navikt/ds-react";
import { formatterBeløp } from "@utils/number-utils";
import React, { Fragment, useEffect, useMemo } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import PersonNavnIdent from "../../../../common/components/PersonNavnIdent";
import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";
import { useOnUpdateGebyr } from "../../../hooks/useOnUpdateGebyr";
import { EndeligIlagtGebyr, GebyrFormValues } from "../../../types/gebyrFormValues";
import { createInitialValues } from "../helpers/GebryFormHelpers";

const Begrunnelse = ({ fieldName, onSave }: { fieldName: `gebyrRoller.${number}`; onSave: () => void }) => {
    const { watch } = useFormContext<GebyrFormValues>();
    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (`${fieldName}.begrunnelse` === name && type === "change") {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, [fieldName, watch]);

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
            className="w-fit h-max"
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
    const {
        virkningstidspunkt: { avslag },
    } = useGetBehandlingV2();

    return (
        <ActionButtons
            onNext={() => onStepChange(avslag ? STEPS[BarnebidragStepper.VEDTAK] : STEPS[BarnebidragStepper.BOFORHOLD])}
        />
    );
};

const Main = () => {
    const { setSaveErrorState } = useBehandlingProvider();
    const {
        gebyr: { gebyrRoller },
        virkningstidspunkt: { avslag },
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
                    <Fragment key={item?.rolle?.id}>
                        <Box
                            background="surface-subtle"
                            className="grid gap-2 py-2 px-4"
                            id={`${elementIds.seksjon_gebyr}_${item?.rolle?.id}`}
                        >
                            <div className="grid grid-cols-[max-content,max-content,auto] p-2 bg-white">
                                <div>
                                    <RolleTag rolleType={item.rolle.rolletype} />
                                </div>
                                <PersonNavnIdent ident={item.rolle.ident} />
                            </div>

                            <div className="flex gap-x-2">
                                <Label size="small">{text.label.skattepliktigeInntekt}:</Label>
                                <BodyShort size="small">{formatterBeløp(item.inntekt.skattepliktigInntekt)}</BodyShort>
                            </div>
                            {!avslag && (
                                <>
                                    <div className="flex gap-x-2">
                                        <Label size="small">{text.label.høyesteBarnetillegg}:</Label>
                                        <BodyShort size="small">
                                            {formatterBeløp(item.inntekt.maksBarnetillegg)}
                                        </BodyShort>
                                    </div>
                                    <div className="flex gap-x-2">
                                        <Label size="small">{text.label.totalt}:</Label>
                                        <BodyShort size="small">{formatterBeløp(item.inntekt.totalInntekt)}</BodyShort>
                                    </div>
                                </>
                            )}
                            <div className="flex gap-x-2">
                                <GebyrSelect fieldName={`gebyrRoller.${index}`} onSave={onSaveFn} />
                                {item.endeligIlagtGebyr === EndeligIlagtGebyr.Ilagt && (
                                    <div className="h-[60px] flex">
                                        <div className="flex self-end gap-x-2">
                                            <Label size="small">{text.label.beløp}:</Label>
                                            <BodyShort size="small">{formatterBeløp(item.beløpGebyrsats)}</BodyShort>
                                        </div>
                                    </div>
                                )}
                                {booleanValueOfEndeligIlagtGebyr[item.endeligIlagtGebyr] !==
                                    item.beregnetIlagtGebyr && (
                                    <div>
                                        <Begrunnelse fieldName={`gebyrRoller.${index}`} onSave={onSaveFn} />
                                    </div>
                                )}
                            </div>
                        </Box>
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
