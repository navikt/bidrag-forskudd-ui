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
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandling, useGetOpplysninger, useSivilstandOpplysningerProssesert } from "../../../hooks/useApiData";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
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
    mapSivilstandProsessert,
    removeAndEditPeriods,
    sivilstandForskuddOptions,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";

export const Sivilstand = ({ datoFom }: { datoFom: Date }) => (
    <>
        <Heading level="3" size="medium">
            {text.label.sivilstand}
        </Heading>
        <SivilistandPerioder virkningstidspunkt={datoFom} />
    </>
);

const SivilistandPerioder = ({ virkningstidspunkt }: { virkningstidspunkt: Date }) => {
    const { boforholdFormValues, setBoforholdFormValues, setErrorMessage, setErrorModalOpen, lesemodus } =
        useForskudd();
    const sivilstandProssesert = useSivilstandOpplysningerProssesert();
    const [showResetButton, setShowResetButton] = useState(false);

    const saveBoforhold = useOnSaveBoforhold();
    const [editableRow, setEditableRow] = useState(undefined);
    const sivilstandOpplysninger = useGetOpplysninger<SivilstandGrunnlagDto[]>(OpplysningerType.SIVILSTAND);
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
                message: text.error.datoMåFyllesUt,
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
        setShowResetButton(true);

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
            title: text.alert.fullførRedigering,
            text: text.alert.periodeUnderRedigering,
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

    const resetTilDataFraFreg = () => {
        updatedAndSave(mapSivilstandProsessert(sivilstandProssesert.sivilstandListe));
        setShowResetButton(false);
    };

    const editButtons = (index: number) => {
        if (lesemodus) return [];
        return [
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
        ];
    };
    return (
        <div>
            <Box padding="4" background="surface-subtle" className="overflow-hidden">
                <Opplysninger />
                {(errors?.root?.sivilstand as { types: string[] })?.types && (
                    <div className="mb-4">
                        <Alert variant="warning">
                            <Heading spacing size="small" level="3">
                                {text.alert.feilIPeriodisering}
                            </Heading>
                            {Object.values((errors.root.sivilstand as { types: string[] }).types).map(
                                (type: string) => (
                                    <p key={type}>{type}</p>
                                )
                            )}
                        </Alert>
                    </div>
                )}
                {sivilstandOpplysninger != null && showResetButton && (
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="tertiary"
                            type="button"
                            size="small"
                            className="w-fit"
                            onClick={resetTilDataFraFreg}
                        >
                            {text.resetTilOpplysninger}
                        </Button>
                    </div>
                )}
                {controlledFields.length > 0 && (
                    <TableWrapper
                        heading={[
                            text.label.fraOgMed,
                            text.label.tilOgMed,
                            text.label.sivilstand,
                            text.label.kilde,
                            ...(lesemodus ? [] : ["", ""]),
                        ]}
                    >
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
                                                text: hentVisningsnavn(value.toString()),
                                            }))}
                                            hideLabel
                                        />
                                    ) : (
                                        <BodyShort key={`sivilstand.${index}.sivilstand.placeholder`}>
                                            {hentVisningsnavn(item.sivilstand)}
                                        </BodyShort>
                                    ),
                                    <BodyShort key={`sivilstand.${index}.kilde.placeholder`} className="capitalize">
                                        {KildeTexts[item.kilde]}
                                    </BodyShort>,
                                    ...editButtons(index),
                                ]}
                            />
                        ))}
                    </TableWrapper>
                )}
                {!lesemodus && (
                    <Button variant="tertiary" type="button" size="small" className="w-fit mt-4" onClick={addPeriode}>
                        {text.label.leggTilPeriode}
                    </Button>
                )}
            </Box>
        </div>
    );
};

const Opplysninger = () => {
    const sivilstandOpplysninger = useGetOpplysninger<SivilstandGrunnlagDto[]>(OpplysningerType.SIVILSTAND);
    const sivilstandProssesert = useSivilstandOpplysningerProssesert();

    const behandling = useGetBehandling();
    if (!sivilstandOpplysninger) {
        return null;
    }

    const virkingstidspunkt = dateOrNull(behandling.virkningstidspunkt.virkningstidspunkt);

    const sivilstandsOpplysningerFiltrert = () => {
        const opplysningerSortert = sivilstandOpplysninger.sort((a, b) => {
            if (a.gyldigFom == null) return -1;
            if (b.gyldigFom == null) return 1;
            return dateOrNull(a.gyldigFom) > dateOrNull(b.gyldigFom) ? 1 : -1;
        });
        if (sivilstandProssesert.status !== SivilstandBeregnetStatusEnum.OK) {
            return opplysningerSortert;
        }

        const opplysningerFiltrert = opplysningerSortert.filter((sivilstand) => {
            return virkingstidspunkt == null || dateOrNull(sivilstand.gyldigFom) >= virkingstidspunkt;
        });

        if (opplysningerFiltrert.length === 0 && opplysningerSortert.length > 0) {
            return [opplysningerSortert[opplysningerSortert.length - 1]];
        }
        return opplysningerFiltrert;
    };
    return (
        <ReadMore header={text.title.opplysningerFraFolkeregistret} size="small" className="pb-4">
            <Table className="w-[300px] opplysninger" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{text.label.fraDato}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.status}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sivilstandsOpplysningerFiltrert().map((periode, index) => (
                        <Table.Row key={`${periode.type}-${index}`}>
                            <Table.DataCell className="flex justify-start gap-2">
                                <>{periode.gyldigFom ? DateToDDMMYYYYString(new Date(periode.gyldigFom)) : "\u00A0"}</>
                            </Table.DataCell>
                            <Table.DataCell>{capitalize(periode.type)?.replaceAll("_", " ")}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </ReadMore>
    );
};
