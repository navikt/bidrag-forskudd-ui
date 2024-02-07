import "./Opplysninger.css";

import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { capitalize, lastDayOfMonth } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Box, Button, Heading, ReadMore, Table } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
    Kilde,
    OpplysningerType,
    SivilstandBeregnetStatusEnum,
    SivilstandDto,
    Sivilstandskode,
} from "../../../api/BidragBehandlingApiV1";
import { SivilstandGrunnlagDto } from "../../../api/BidragGrunnlagApi";
import { boforholdPeriodiseringErros } from "../../../constants/error";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetOpplysninger, useSivilstandOpplysningerProssesert } from "../../../hooks/useApiData";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { dateOrNull, DateToDDMMYYYYString, deductMonths, isAfterDate, toDateString } from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import {
    calculateFraDato,
    checkPeriodizationErrors,
    editPeriods,
    removeAndEditPeriods,
    sivilstandForskuddOptions,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Sivilstand = ({ datoFom }: { datoFom: Date }) => (
    <>
        <Heading level="3" size="medium">
            Sivilstand
        </Heading>
        <SivilistandPerioder virkningstidspunkt={datoFom} />
    </>
);

const SivilistandPerioder = ({ virkningstidspunkt }: { virkningstidspunkt: Date }) => {
    const { boforholdFormValues, setBoforholdFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const sivilstandProssesert = useSivilstandOpplysningerProssesert();

    const saveBoforhold = useOnSaveBoforhold();
    const toVisningsnavn = useVisningsnavn();
    const [editableRow, setEditableRow] = useState(undefined);
    const [fom, tom] = getFomAndTomForMonthPicker(virkningstidspunkt);
    const {
        control,
        getValues,
        getFieldState,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const sivilstandPerioder = useFieldArray({
        control,
        name: `sivilstand`,
    });

    const watchFieldArray = useWatch({ control, name: `sivilstand` });
    const controlledFields = sivilstandPerioder.fields.map((field, index) => ({
        ...field,
        ...watchFieldArray[index],
    }));
    const sivilistand = getValues(`sivilstand`);

    useEffect(() => {
        validatePeriods(sivilistand);
    }, [sivilistand]);

    const validatePeriods = (perioderValues: SivilstandDto[]) => {
        const errorTypes = checkPeriodizationErrors(perioderValues, virkningstidspunkt);

        if (sivilstandProssesert.status != SivilstandBeregnetStatusEnum.OK && controlledFields.length == 0) {
            errorTypes.push("kunneIkkeBeregneSivilstandPerioder");
        }
        if (errorTypes.length) {
            setError(`root.sivilstand`, {
                types: errorTypes.reduce(
                    (acc, errorType) => ({
                        ...acc,
                        [errorType]:
                            errorType === "hullIPerioder"
                                ? removePlaceholder(
                                      boforholdPeriodiseringErros[errorType],
                                      toDateString(virkningstidspunkt),
                                      toDateString(new Date(perioderValues[0].datoFom))
                                  )
                                : boforholdPeriodiseringErros[errorType],
                    }),
                    {}
                ),
            });
        } else {
            clearErrors(`root.sivilstand`);
        }
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`sivilstand`);
        if (perioderValues[index].datoFom === null) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        const fieldState = getFieldState(`sivilstand.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
        }
    };

    const updatedAndSave = (sivilstand: SivilstandDto[]) => {
        const updatedValues = {
            ...boforholdFormValues,
            sivilstand,
        };
        setBoforholdFormValues(updatedValues);
        setValue("sivilstand", sivilstand);
        saveBoforhold(updatedValues);
        setEditableRow(undefined);
    };

    const validateFomOgTom = (index) => {
        const sivilstandPerioder = getValues("sivilstand");
        const fomOgTomInvalid =
            sivilstandPerioder[index].datoTom !== null &&
            isAfterDate(sivilstandPerioder[index].datoFom, sivilstandPerioder[index].datoTom);

        if (fomOgTomInvalid) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`sivilstand.${index}.datoFom`);
        }
    };

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const sivilstandPerioderValues = getValues("sivilstand");
            sivilstandPerioder.append({
                datoFom: calculateFraDato(sivilstandPerioderValues, virkningstidspunkt),
                datoTom: null,
                sivilstand: Sivilstandskode.BOR_ALENE_MED_BARN,
                kilde: Kilde.MANUELL,
            });
            setEditableRow(sivilstandPerioderValues.length);
        }
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`sivilstand`) as SivilstandDto[];
            const updatedPeriods = removeAndEditPeriods(perioderValues, index);
            updatedAndSave(updatedPeriods);
        }
    };

    const checkIfAnotherRowIsEdited = (index?: number) => {
        return editableRow !== undefined && Number(editableRow) !== index;
    };

    const showErrorModal = () => {
        setErrorMessage({
            title: "Fullfør redigering",
            text: "Det er en periode som er under redigering. Fullfør redigering eller slett periode.",
        });
        setErrorModalOpen(true);
    };

    const onEditRow = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            setEditableRow(index);
        }
    };

    return (
        <div>
            <Box padding="4" background="surface-subtle" className="overflow-hidden">
                <Opplysninger />
                {(errors?.root?.sivilstand as { types: string[] })?.types && (
                    <div className="mb-4">
                        <Alert variant="warning">
                            <Heading spacing size="small" level="3">
                                Feil i periodisering
                            </Heading>
                            {Object.values((errors.root.sivilstand as { types: string[] }).types).map(
                                (type: string) => (
                                    <p key={type}>{type}</p>
                                )
                            )}
                        </Alert>
                    </div>
                )}

                {controlledFields.length > 0 && (
                    <TableWrapper heading={["Fra og med", "Til og med", "Sivilstand", "Kilde", "", ""]}>
                        {controlledFields.map((item, index) => (
                            <TableRowWrapper
                                key={item.id}
                                cells={[
                                    editableRow === index ? (
                                        <FormControlledMonthPicker
                                            key={`sivilstand.${index}.datoFom`}
                                            name={`sivilstand.${index}.datoFom`}
                                            label="Periode"
                                            placeholder="DD.MM.ÅÅÅÅ"
                                            defaultValue={item.datoFom}
                                            customValidation={() => validateFomOgTom(index)}
                                            fromDate={fom}
                                            toDate={tom}
                                            hideLabel
                                            required
                                        />
                                    ) : (
                                        <BodyShort key={`sivilstand.${index}.datoFom.placeholder`}>
                                            {item.datoFom && DateToDDMMYYYYString(dateOrNull(item.datoFom))}
                                        </BodyShort>
                                    ),
                                    editableRow === index ? (
                                        <FormControlledMonthPicker
                                            key={`sivilstand.${index}.datoTom`}
                                            name={`sivilstand.${index}.datoTom`}
                                            label="Periode"
                                            placeholder="DD.MM.ÅÅÅÅ"
                                            defaultValue={item.datoTom}
                                            customValidation={() => validateFomOgTom(index)}
                                            fromDate={fom}
                                            toDate={lastDayOfMonth(deductMonths(new Date(), 1))}
                                            lastDayOfMonthPicker
                                            hideLabel
                                        />
                                    ) : (
                                        <BodyShort key={`sivilstand.${index}.datoTom.placeholder`}>
                                            {item.datoTom && DateToDDMMYYYYString(dateOrNull(item.datoTom))}
                                        </BodyShort>
                                    ),
                                    editableRow === index ? (
                                        <FormControlledSelectField
                                            key={`sivilstand.${index}.sivilstand`}
                                            name={`sivilstand.${index}.sivilstand`}
                                            label="Sivilstand"
                                            className="w-52"
                                            options={sivilstandForskuddOptions.map((value) => ({
                                                value,
                                                text: toVisningsnavn(value.toString()),
                                            }))}
                                            hideLabel
                                        />
                                    ) : (
                                        <BodyShort key={`sivilstand.${index}.sivilstand.placeholder`}>
                                            {toVisningsnavn(item.sivilstand)}
                                        </BodyShort>
                                    ),
                                    <BodyShort key={`sivilstand.${index}.kilde.placeholder`} className="capitalize">
                                        {KildeTexts[item.kilde]}
                                    </BodyShort>,
                                    editableRow === index ? (
                                        <Button
                                            key={`save-button-${index}`}
                                            type="button"
                                            onClick={() => onSaveRow(index)}
                                            icon={<FloppydiskIcon aria-hidden />}
                                            variant="tertiary"
                                            size="small"
                                        />
                                    ) : (
                                        <Button
                                            key={`edit-button-${index}`}
                                            type="button"
                                            onClick={() => onEditRow(index)}
                                            icon={<PencilIcon aria-hidden />}
                                            variant="tertiary"
                                            size="small"
                                        />
                                    ),
                                    index ? (
                                        <Button
                                            key={`delete-button-${index}`}
                                            type="button"
                                            onClick={() => onRemovePeriode(index)}
                                            icon={<TrashIcon aria-hidden />}
                                            variant="tertiary"
                                            size="small"
                                        />
                                    ) : (
                                        <div key={`delete-button-${index}.placeholder`} className="min-w-[40px]"></div>
                                    ),
                                ]}
                            />
                        ))}
                    </TableWrapper>
                )}
                <Button variant="tertiary" type="button" size="small" className="w-fit mt-4" onClick={addPeriode}>
                    + Legg til periode
                </Button>
            </Box>
        </div>
    );
};

const Opplysninger = () => {
    const sivilstandOpplysninger = useGetOpplysninger<SivilstandGrunnlagDto[]>(OpplysningerType.SIVILSTAND);
    if (!sivilstandOpplysninger) {
        return null;
    }
    return (
        <ReadMore header="Opplysninger fra Folkeregistret" size="small" className="pb-4">
            <Table className="w-[300px] opplysninger" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Fra dato</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sivilstandOpplysninger.map((periode, index) => (
                        <Table.Row key={`${periode.type}-${index}`}>
                            <Table.DataCell className="flex justify-start gap-2">
                                <>{DateToDDMMYYYYString(new Date(periode.gyldigFom))}</>
                            </Table.DataCell>
                            <Table.DataCell>{capitalize(periode.type)}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </ReadMore>
    );
};
