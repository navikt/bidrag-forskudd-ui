import { BarnDto, SletteUnderholdselementTypeEnum } from "@api/BidragBehandlingApiV1";
import { AddBarnForm } from "@common/components/AddBarnForm";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Button } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { useOnCreateUnderholdForBarn } from "../../../hooks/useOnCreateUnderholdForBarn";
import { useOnDeleteUnderholdsObjekt } from "../../../hooks/useOnDeleteUnderholdsObjekt";
import { FaktiskTilsynsutgiftPeriode, UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { RolleInfoBox } from "./Barnetilsyn";
import { FaktiskeTilsynsutgifterTabel } from "./FaktiskeTilsynsutgifterTabel";

export const AndreBarn = () => {
    const { setSaveErrorState } = useBehandlingProvider();
    const { control, clearErrors } = useFormContext<UnderholdskostnadFormValues>();
    const createBarnQuery = useOnCreateUnderholdForBarn();
    const deleteUnderhold = useOnDeleteUnderholdsObjekt();
    const [openForm, setOpenForm] = useState<boolean>(false);
    const fieldArray = useFieldArray({
        control,
        name: "underholdskostnaderAndreBarn",
    });
    const watchFieldArray = useWatch({ control, name: "underholdskostnaderAndreBarn" });
    const andreBarnFieldArray = fieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const onCreateBarn = (barn: BarnDto) => {
        createBarnQuery.mutation.mutate(barn, {
            onSuccess: (underhold) => {
                fieldArray.append({
                    ...underhold,
                    faktiskTilsynsutgift: [] as FaktiskTilsynsutgiftPeriode[],
                });
                setOpenForm(false);
                createBarnQuery.queryClientUpdater((currentData) => {
                    return {
                        ...currentData,
                        underholdskostnader: currentData.underholdskostnader.concat(underhold),
                    };
                });
            },
            onError: () => {},
        });
    };

    const onDelete = (index: number) => {
        const underhold = andreBarnFieldArray[index];
        const payload = {
            idUnderhold: underhold.id,
            idElement: underhold.gjelderBarn.id,
            type: SletteUnderholdselementTypeEnum.BARN,
        };

        deleteUnderhold.mutation.mutate(payload, {
            onSuccess: (_) => {
                clearErrors(`underholdskostnaderAndreBarn.${index}`);
                fieldArray.remove(Number(index));

                deleteUnderhold.queryClientUpdater((currentData) => {
                    const updatedList = currentData.underholdskostnader.filter(
                        (underhold) => underhold.gjelderBarn.id !== payload.idElement
                    );

                    return {
                        ...currentData,
                        underholdskostnader: updatedList,
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => onDelete(index),
                });
            },
        });
    };

    return (
        <>
            {!openForm && (
                <Button
                    type="button"
                    onClick={() => setOpenForm(true)}
                    variant="secondary"
                    iconPosition="right"
                    className="w-max"
                    size="small"
                >
                    {text.label.leggTilBarn}
                </Button>
            )}
            {openForm && <AddBarnForm setOpenAddBarnForm={setOpenForm} onSave={onCreateBarn} />}
            {andreBarnFieldArray.map((_, index) => {
                const underholdFieldName = `underholdskostnaderAndreBarn.${index}` as const;
                return (
                    <>
                        <RolleInfoBox underholdFieldName={underholdFieldName} onDelete={() => onDelete(index)} />
                        <FaktiskeTilsynsutgifterTabel underholdFieldName={underholdFieldName} />
                    </>
                );
            })}
        </>
    );
};
