import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import { useGetBehandling } from "../../../hooks/useApiData";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { checkOverlappingPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Småbarnstillegg = () => (
    <Box padding="4" background="surface-subtle" className="grid gap-y-4 overflow-hidden">
        <Heading level="3" size="medium">
            Småbarnstillegg
        </Heading>
        <SmåbarnstilleggTabel />
    </Box>
);
export const SmåbarnstilleggTabel = () => {
    const { roller, søktFomDato } = useGetBehandling();
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(søktFomDato));

    const {
        control,
        getValues,
        clearErrors,
        setError,
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const fieldArray = useFieldArray({
        control: control,
        name: "småbarnstillegg",
    });

    const watchFieldArray = useWatch({ control, name: "småbarnstillegg" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const barnetilleggList = getValues("småbarnstillegg");

        if (!barnetilleggList.length) {
            clearErrors("småbarnstillegg");
            return;
        }
        const filtrertOgSorterListe = barnetilleggList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("småbarnstillegg", {
                ...errors.barnetillegg,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("småbarnstillegg.types.overlappingPerioder");
        }
    };

    return (
        <>
            {errors?.barnetillegg?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.barnetillegg.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`småbarnstillegg.${index}.datoFom`}
                                    name={`småbarnstillegg.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    fromDate={fom}
                                    toDate={tom}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`småbarnstillegg.${index}.datoTom`}
                                    name={`småbarnstillegg.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    lastDayOfMonthPicker
                                />,
                                <FormControlledTextField
                                    key={`barnetillegg.${index}.barnetillegg`}
                                    name={`barnetillegg.${index}.barnetillegg`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        clearErrors(`småbarnstillegg.${index}`);
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
                        ident: roller.find((rolle) => rolle.rolletype === Rolletype.BM).ident,
                        kilde: Kilde.MANUELL,
                        datoFom: null,
                        datoTom: null,
                        beløp: 0,
                        rapporteringstype: Inntektsrapportering.BARNETILLEGG,
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
