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

export const Barnetillegg = () => (
    <Box padding="4" background="surface-subtle" className="grid gap-y-4 overflow-hidden">
        <Heading level="3" size="medium">
            Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
        </Heading>
        <BarnetilleggTabel />
    </Box>
);
export const BarnetilleggTabel = () => {
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
        name: "barnetillegg",
    });

    const watchFieldArray = useWatch({ control, name: "barnetillegg" });

    useEffect(() => {
        validatePeriods();
    }, [watchFieldArray]);

    const validatePeriods = () => {
        const barnetilleggList = getValues("barnetillegg");

        if (!barnetilleggList.length) {
            clearErrors("barnetillegg");
            return;
        }
        const filtrertOgSorterListe = barnetilleggList
            .filter((periode) => periode.datoFom && isValidDate(periode.datoFom))
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("barnetillegg", {
                ...errors.barnetillegg,
                types: {
                    overlappingPerioder: "Du har overlappende perioder",
                },
            });
        }

        if (!overlappingPerioder?.length) {
            // @ts-ignore
            clearErrors("barnetillegg.types.overlappingPerioder");
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
                <TableWrapper heading={["Fra og med", "Til og med", "Barn", "Beløp", ""]}>
                    {fieldArray.fields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`barnetillegg.${index}.datoFom`}
                                    name={`barnetillegg.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    fromDate={fom}
                                    toDate={tom}
                                    required
                                    hideLabel
                                />,
                                <FormControlledMonthPicker
                                    key={`barnetillegg.${index}.datoTom`}
                                    name={`barnetillegg.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    lastDayOfMonthPicker
                                />,
                                <FormControlledSelectField
                                    key={`barnetillegg.${index}.ident`}
                                    name={`barnetillegg.${index}.ident`}
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
                                        clearErrors(`barnetillegg.${index}`);
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
