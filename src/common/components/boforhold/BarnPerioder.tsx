import { Kilde } from "@api/BidragBehandlingApiV1";
import { Rolletype } from "@api/BidragDokumentProduksjonApi";
import { AddBarnForm } from "@common/components/boforhold/AddBarnForm";
import { Perioder } from "@common/components/boforhold/Perioder";
import { RemoveButton } from "@common/components/boforhold/RemoveButton";
import { PersonNavn } from "@common/components/PersonNavn";
import { RolleTag } from "@common/components/RolleTag";
import elementIds from "@common/constants/elementIds";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useOnSaveBoforhold } from "@common/hooks/useOnSaveBoforhold";
import { BodyShort, Box, Button } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString } from "@utils/date-utils";
import React, { Fragment, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { BoforholdFormValues } from "../../../særligeutgifter/types/boforholdFormValues";

export const BarnPerioder = () => {
    const { setPageErrorsOrUnsavedState, pageErrorsOrUnsavedState, lesemodus, setSaveErrorState } =
        useBehandlingProvider();
    const saveBoforhold = useOnSaveBoforhold();
    const [openAddBarnForm, setOpenAddBarnForm] = useState(false);
    const { control, getValues } = useFormContext<BoforholdFormValues>();
    const barnFieldArray = useFieldArray({
        control,
        name: "husstandsbarn",
    });
    const watchFieldArray = useWatch({ control, name: "husstandsbarn" });
    const controlledFields = barnFieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const onOpenAddBarnForm = () => {
        setOpenAddBarnForm(true);
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                ...pageErrorsOrUnsavedState.boforhold,
                openFields: { ...pageErrorsOrUnsavedState.boforhold.openFields, newBarn: true },
            },
        });
    };

    const onRemoveBarn = (index: number) => {
        const barn = getValues(`husstandsbarn.${index}`);

        saveBoforhold.mutation.mutate(
            { oppdatereHusstandsmedlem: { slettHusstandsmedlem: barn.id } },
            {
                onSuccess: () => {
                    barnFieldArray.remove(index);
                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                husstandsbarn: currentData.boforhold.husstandsbarn.filter((b) => b.id !== barn.id),
                            },
                        };
                    });

                    const openFields = { ...pageErrorsOrUnsavedState.boforhold.openFields };
                    delete openFields[`husstandsbarn.${index}`];

                    setPageErrorsOrUnsavedState({
                        ...pageErrorsOrUnsavedState,
                        boforhold: {
                            ...pageErrorsOrUnsavedState.boforhold,
                            openFields,
                        },
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onRemoveBarn(index),
                        rollbackFn: () => {},
                    });
                },
            }
        );
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Box
                        background="surface-subtle"
                        className="overflow-hidden grid gap-2 py-2 px-4"
                        id={`${elementIds.seksjon_boforhold}_${item.id}`}
                    >
                        <div className="grid grid-cols-[max-content,max-content,auto] p-2 bg-white border border-[var(--a-border-default)]">
                            <div>{item.medIBehandling && <RolleTag rolleType={Rolletype.BA} />}</div>
                            <div className="flex items-center gap-4">
                                <BodyShort size="small" className="font-bold">
                                    {item.medIBehandling && <PersonNavn ident={item.ident}></PersonNavn>}
                                    {!item.medIBehandling && item.navn}
                                </BodyShort>
                                <BodyShort size="small">{DateToDDMMYYYYString(dateOrNull(item.fødselsdato))}</BodyShort>
                            </div>
                            {!item.medIBehandling && !lesemodus && item.kilde === Kilde.MANUELL && (
                                <RemoveButton index={index} onRemoveBarn={onRemoveBarn} />
                            )}
                        </div>
                        <Perioder barnIndex={index} />
                    </Box>
                </Fragment>
            ))}
            {openAddBarnForm && <AddBarnForm setOpenAddBarnForm={setOpenAddBarnForm} barnFieldArray={barnFieldArray} />}
            {!openAddBarnForm && !lesemodus && (
                <Button variant="secondary" type="button" size="small" className="w-fit" onClick={onOpenAddBarnForm}>
                    + Legg til barn
                </Button>
            )}
        </>
    );
};
