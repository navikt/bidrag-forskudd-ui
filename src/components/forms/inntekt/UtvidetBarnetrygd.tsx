import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { useGetBehandling } from "../../../hooks/useApiData";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { checkOverlappingPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const UtvidetBarnetrygd = () => (
    <Box padding="4" background="surface-subtle" className="grid gap-y-4 overflow-hidden">
        <Heading level="3" size="medium">
            Utvidet barnetrygd
        </Heading>
        <UtvidetBarnetrygdTabel />
    </Box>
);
export const UtvidetBarnetrygdTabel = () => {
    const { søktFomDato } = useGetBehandling();
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(søktFomDato));
    const {
        control,
        getValues,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "utvidetbarnetrygd",
    });

    const watchFieldArray = useWatch({ control, name: "utvidetbarnetrygd" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const utvidetBarnetrygdList = getValues("utvidetbarnetrygd");

        if (!utvidetBarnetrygdList.length) {
            clearErrors("utvidetbarnetrygd");
            return;
        }
        const filtrertOgSorterListe = utvidetBarnetrygdList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("utvidetbarnetrygd", {
                ...errors.utvidetbarnetrygd,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("utvidetbarnetrygd.types.overlappingPerioder");
        }
    };

    return (
        <>
            {errors?.utvidetbarnetrygd?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.utvidetbarnetrygd.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Periode", "Delt bosted", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <div key={`utvidetbarnetrygd.${index}.fraDato`} className="flex gap-x-4">
                                    <FormControlledMonthPicker
                                        key={`utvidetbarnetrygd.${index}.datoFom`}
                                        name={`utvidetbarnetrygd.${index}.datoFom`}
                                        label="Fra og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoFom}
                                        fromDate={fom}
                                        toDate={tom}
                                        required
                                        hideLabel
                                    />
                                    <FormControlledMonthPicker
                                        key={`utvidetbarnetrygd.${index}.datoTom`}
                                        name={`utvidetbarnetrygd.${index}.datoTom`}
                                        label="Til og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        fromDate={fom}
                                        toDate={tom}
                                        hideLabel
                                        lastDayOfMonthPicker
                                    />
                                </div>,
                                <FormControlledCheckbox
                                    key={`utvidetbarnetrygd.${index}.deltBosted`}
                                    name={`utvidetbarnetrygd.${index}.deltBosted`}
                                    className="m-auto"
                                    legend=""
                                />,
                                <FormControlledTextField
                                    key={`utvidetbarnetrygd.${index}.beløp`}
                                    name={`utvidetbarnetrygd.${index}.beløp`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        clearErrors(`utvidetbarnetrygd.${index}`);
                                        fieldArray.remove(index);
                                    }}
                                    icon={<TrashIcon aria-hidden />}
                                    variant="tertiary"
                                    size="small"
                                />,
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <Button
                variant="tertiary"
                type="button"
                size="small"
                className="w-fit"
                onClick={() =>
                    fieldArray.append({
                        datoFom: null,
                        datoTom: null,
                        deltBosted: false,
                        beløp: 0,
                    })
                }
            >
                + Legg til periode
            </Button>
        </>
    );
};
