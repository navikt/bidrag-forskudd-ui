import { BarnDto, SletteUnderholdselementTypeEnum } from "@api/BidragBehandlingApiV1";
import { AddBarnForm } from "@common/components/AddBarnForm";
import StatefulAlert from "@common/components/StatefulAlert";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { PlusIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { calculateAge } from "@utils/date-utils";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { useOnCreateUnderholdForBarn } from "../../../hooks/useOnCreateUnderholdForBarn";
import { useOnDeleteUnderholdsObjekt } from "../../../hooks/useOnDeleteUnderholdsObjekt";
import { FaktiskTilsynsutgiftPeriode, UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { displayOver12Alert, mapBeregnetUnderholdskostnadToRole } from "../helpers/UnderholdskostnadFormHelpers";
import { RolleInfoBox } from "./Barnetilsyn";
import { FaktiskeTilsynsutgifterTabel } from "./FaktiskeTilsynsutgifterTabel";

export const AndreBarn = () => {
    const { setSaveErrorState, lesemodus } = useBehandlingProvider();
    const { control, clearErrors, setValue, getValues } = useFormContext<UnderholdskostnadFormValues>();
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
            onSuccess: (response) => {
                fieldArray.append({
                    ...response.underholdskostnad,
                    faktiskTilsynsutgift: [] as FaktiskTilsynsutgiftPeriode[],
                });
                setOpenForm(false);
                createBarnQuery.queryClientUpdater((currentData) => {
                    return {
                        ...currentData,
                        underholdskostnader: currentData.underholdskostnader
                            .concat(response.underholdskostnad)
                            .map(mapBeregnetUnderholdskostnadToRole(response.beregnetUnderholdskostnader)),
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
            onSuccess: (response) => {
                clearErrors(`underholdskostnaderAndreBarn.${index}`);
                fieldArray.remove(Number(index));
                const underholdskostnaderAndreBarn = getValues("underholdskostnaderAndreBarn");

                if (!underholdskostnaderAndreBarn.length) {
                    setValue("underholdskostnaderAndreBarnBegrunnelse", "");
                }

                deleteUnderhold.queryClientUpdater((currentData) => {
                    const updatedList = currentData.underholdskostnader
                        .filter((underhold) => underhold.gjelderBarn.id !== payload.idElement)
                        .map(mapBeregnetUnderholdskostnadToRole(response.beregnetUnderholdskostnader));

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
            {!openForm && !lesemodus && (
                <Button
                    type="button"
                    onClick={() => setOpenForm(true)}
                    variant="secondary"
                    iconPosition="left"
                    className="w-max"
                    icon={<PlusIcon />}
                    size="small"
                >
                    {text.label.leggTilBarn}
                </Button>
            )}
            {openForm && <AddBarnForm setOpenAddBarnForm={setOpenForm} onSave={onCreateBarn} />}
            {andreBarnFieldArray.map((underhold, index) => {
                const underholdFieldName = `underholdskostnaderAndreBarn.${index}` as const;
                return (
                    underhold?.gjelderBarn && (
                        <div key={underholdFieldName} id={underhold.gjelderBarn.id.toString()} className="grid gap-y-2">
                            <RolleInfoBox underholdFieldName={underholdFieldName} onDelete={() => onDelete(index)} />
                            {displayOver12Alert(calculateAge(underhold.gjelderBarn.fødselsdato)) && (
                                <StatefulAlert
                                    variant="info"
                                    size="small"
                                    alertKey={`12åralert-underhold-${underhold.id}`}
                                    className="w-[708px]"
                                    closeButton
                                >
                                    <Heading size="small" level="3">
                                        {text.title.barnOver12}
                                    </Heading>
                                    {text.barnetHarFylt12SjekkPerioder}
                                </StatefulAlert>
                            )}
                            <FaktiskeTilsynsutgifterTabel underholdFieldName={underholdFieldName} />
                        </div>
                    )
                );
            })}
        </>
    );
};
