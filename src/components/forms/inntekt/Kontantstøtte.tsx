import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Box, Button, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import { useGetBehandling, usePersonsQueries } from "../../../hooks/useApiData";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isValidDate } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import { checkOverlappingPeriods } from "../helpers/inntektFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Kontantstøtte = () => (
    <Box padding="4" background="surface-subtle" className="grid gap-y-4 overflow-hidden">
        <Heading level="3" size="medium">
            Kontantstøtte
        </Heading>
        <KontantstøtteTabel />
    </Box>
);
export const KontantstøtteTabel = () => {
    const { roller, søktFomDato } = useGetBehandling();
    const barna = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const personsQueries = usePersonsQueries(barna);
    const personQueriesSuccess = personsQueries.every((query) => query.isSuccess);
    const barnMedNavn = personsQueries.map(({ data }) => data);
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
        name: "kontantstøtte",
    });

    const watchFieldArray = useWatch({ control, name: "kontantstøtte" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const kontantstøtteList = getValues("kontantstøtte");

        if (!kontantstøtteList.length) {
            clearErrors("kontantstøtte");
            return;
        }
        const filtrertOgSorterListe = kontantstøtteList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("kontantstøtte", {
                ...errors.kontantstøtte,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("kontantstøtte.types.overlappingPerioder");
        }
    };

    return (
        <>
            {errors?.kontantstøtte?.types?.overlappingPerioder && (
                <Alert variant="warning">
                    <BodyShort>{errors.kontantstøtte.types.overlappingPerioder}</BodyShort>
                </Alert>
            )}
            {fieldArray.fields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Barn", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`kontantstøtte.${index}.datoFom`}
                                    name={`kontantstøtte.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    fromDate={fom}
                                    toDate={tom}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`kontantstøtte.${index}.datoTom`}
                                    name={`kontantstøtte.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    lastDayOfMonthPicker
                                />,
                                <FormControlledSelectField
                                    key={`kontantstøtte.${index}.ident`}
                                    name={`kontantstøtte.${index}.ident`}
                                    label="Barn"
                                    hideLabel
                                >
                                    <option key={"Velg barn"} value={""}>
                                        Velg barn
                                    </option>
                                    {personQueriesSuccess &&
                                        barnMedNavn.map((barn) => (
                                            <option key={barn.kortnavn} value={barn.ident}>
                                                {barn.kortnavn}
                                            </option>
                                        ))}
                                </FormControlledSelectField>,
                                <FormControlledTextField
                                    key={`kontantstøtte.${index}.beløp`}
                                    name={`kontantstøtte.${index}.beløp`}
                                    label="Beløp"
                                    type="number"
                                    min="0"
                                    hideLabel
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        clearErrors(`kontantstøtte.${index}`);
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
