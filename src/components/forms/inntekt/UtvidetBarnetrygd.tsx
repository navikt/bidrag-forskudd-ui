import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Inntektsrapportering, Kilde } from "../../../api/BidragBehandlingApiV1";
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
        name: "barnetilsyn",
    });

    const watchFieldArray = useWatch({ control, name: "barnetilsyn" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const utvidetBarnetrygdList = getValues("barnetilsyn");

        if (!utvidetBarnetrygdList?.length) {
            clearErrors("barnetilsyn");
            return;
        }
        const filtrertOgSorterListe = utvidetBarnetrygdList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("barnetilsyn", {
                ...errors.barnetilsyn,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("barnetilsyn.types.overlappingPerioder");
        }
    };

    return (
        <>
            {errors?.barnetilsyn?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.barnetilsyn.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`barnetilsyn.${index}.datoFom`}
                                    name={`barnetilsyn.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    fromDate={fom}
                                    toDate={tom}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`barnetilsyn.${index}.datoTom`}
                                    name={`barnetilsyn.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    lastDayOfMonthPicker
                                />,
                                <FormControlledCheckbox
                                    key={`barnetilsyn.${index}.deltBosted`}
                                    name={`barnetilsyn.${index}.deltBosted`}
                                    className="m-auto"
                                    legend=""
                                />,
                                <FormControlledTextField
                                    key={`barnetilsyn.${index}.beløp`}
                                    name={`barnetilsyn.${index}.beløp`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        clearErrors(`barnetilsyn.${index}`);
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
                        taMed: false,
                        ident: "ads",
                        kilde: Kilde.MANUELL,
                        datoFom: null,
                        datoTom: null,
                        beløp: 0,
                        rapporteringstype: Inntektsrapportering.UTVIDET_BARNETRYGD,
                        inntektsposter: [],
                        inntektstyper: [],
                    })
                }
            >
                + Legg til periode
            </Button>
        </>
    );
};
