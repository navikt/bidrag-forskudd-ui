import { BarnDto } from "@api/BidragBehandlingApiV1";
import { AddBarnForm } from "@common/components/AddBarnForm";
import text from "@common/constants/texts";
import { Button } from "@navikt/ds-react";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";

import { useOnCreateUnderholdForBarn } from "../../../hooks/useOnCreateUnderholdForBarn";
import { UnderholdskostnadFormValues } from "../../../types/underholdskostnadFormValues";
import { RolleInfoBox } from "./Barnetilsyn";
import { FaktiskeTilsynsutgifterTabel } from "./FaktiskeTilsynsutgifterTabel";

export const AndreBarn = () => {
    const { getValues } = useFormContext<UnderholdskostnadFormValues>();
    const barnSomErIkkeMedIBehandlingUnderholdskostnader = getValues("underholdskostnaderAndreBarn");
    const createBarnQuery = useOnCreateUnderholdForBarn();
    const [openForm, setOpenForm] = useState<boolean>(false);

    const onCreateBarn = (barn: BarnDto) => {
        createBarnQuery.mutation.mutate(barn, {
            onSuccess: (underhold) => {
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
            {barnSomErIkkeMedIBehandlingUnderholdskostnader.map((_, index) => {
                const underholdFieldName = `underholdskostnaderAndreBarn.${index}` as const;
                return (
                    <>
                        <RolleInfoBox underholdFieldName={underholdFieldName} />
                        <FaktiskeTilsynsutgifterTabel underholdFieldName={underholdFieldName} />
                    </>
                );
            })}
        </>
    );
};
