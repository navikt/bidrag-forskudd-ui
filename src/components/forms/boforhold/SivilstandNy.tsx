import "./Opplysninger.css";

import { ArrowUndoIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { capitalize, ObjectUtils } from "@navikt/bidrag-ui-common";
import { Box, Button, Heading, ReadMore, Table, VStack } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Kilde, OppdatereSivilstand, SivilstandDto, Sivilstandskode } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetBehandlingV2, useGetOpplysningerSivilstand } from "../../../hooks/useApiData";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import { addMonths, dateOrNull, DateToDDMMYYYYString, isAfterDate } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { ForskuddAlert } from "../../ForskuddAlert";
import { OverlayLoader } from "../../OverlayLoader";
import { calculateFraDato, sivilstandForskuddOptions } from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { KildeIcon } from "../inntekt/InntektTable";

const DeleteButton = ({ onRemovePeriode, index }: { onRemovePeriode: (index) => void; index: number }) => {
    const { lesemodus } = useForskudd();

    return index && !lesemodus ? (
        <Button
            type="button"
            onClick={() => onRemovePeriode(index)}
            icon={<TrashIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    ) : (
        <div className="min-w-[40px]"></div>
    );
};
const EditOrSaveButton = ({
    index,
    editableRow,
    onSaveRow,
    onEditRow,
}: {
    index: number;
    editableRow: boolean;
    onSaveRow: (index: number) => void;
    onEditRow: (index: number) => void;
}) => {
    const { lesemodus } = useForskudd();

    if (lesemodus) return null;

    return editableRow ? (
        <Button
            type="button"
            onClick={() => onSaveRow(index)}
            icon={<FloppydiskIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    ) : (
        <Button
            type="button"
            onClick={() => onEditRow(index)}
            icon={<PencilIcon aria-hidden />}
            variant="tertiary"
            size="small"
        />
    );
};

const Status = ({
    editableRow,
    fieldName,
    item,
}: {
    editableRow: boolean;
    fieldName: `sivilstand.${number}.sivilstand`;
    item: SivilstandDto;
}) => {
    return editableRow ? (
        <FormControlledSelectField
            name={fieldName}
            label="Sivilstand"
            className="w-52"
            options={sivilstandForskuddOptions.map((value) => ({
                value,
                text: hentVisningsnavn(value.toString()),
            }))}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{hentVisningsnavn(item.sivilstand)}</div>
    );
};

const Periode = ({
    editableRow,
    item,
    field,
    fieldName,
    label,
}: {
    editableRow: boolean;
    item: SivilstandDto;
    fieldName: `sivilstand.${number}`;
    field: "datoFom" | "datoTom";
    label: string;
}) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    const { erVirkningstidspunktNåværendeMånedEllerFramITid } = useForskudd();
    const { getValues, clearErrors, setError } = useFormContext<BoforholdFormValues>();
    const [fom, tom] = getFomAndTomForMonthPicker(virkningsOrSoktFraDato);
    const fieldIsDatoTom = field === "datoTom";

    const validateFomOgTom = () => {
        const periode = getValues(fieldName);
        const fomOgTomInvalid = !ObjectUtils.isEmpty(periode.datoTom) && isAfterDate(periode?.datoFom, periode.datoTom);

        if (fomOgTomInvalid) {
            setError(`${fieldName}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`${fieldName}.datoFom`);
        }
    };

    return editableRow && !erVirkningstidspunktNåværendeMånedEllerFramITid ? (
        <FormControlledMonthPicker
            name={`${fieldName}.${field}`}
            label={label}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item[field]}
            customValidation={validateFomOgTom}
            fromDate={fom}
            toDate={fieldIsDatoTom ? tom : addMonths(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={!fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</div>
    );
};
export const SivilstandNy = () => {
    const datoFom = useVirkningsdato();
    return (
        <div className="mt-8">
            <Heading level="2" size="small" id="sivilstand" title="Sivilstand V2">
                {text.label.sivilstand}
            </Heading>
            <SivilistandPerioder virkningstidspunkt={datoFom} />
        </div>
    );
};

const SivilistandPerioder = ({ virkningstidspunkt }: { virkningstidspunkt: Date }) => {
    const {
        setErrorMessage,
        setErrorModalOpen,
        lesemodus,
        erVirkningstidspunktNåværendeMånedEllerFramITid,
        setSaveErrorState,
        setPageErrorsOrUnsavedState,
        pageErrorsOrUnsavedState,
    } = useForskudd();
    const {
        boforhold: { valideringsfeil, sivilstand: sivilstandBehandling },
    } = useGetBehandlingV2();
    const saveBoforhold = useOnSaveBoforhold();

    const [showResetButton, setShowResetButton] = useState(false);
    const [showUndoButton, setShowUndoButton] = useState(false);

    const [editableRow, setEditableRow] = useState<number>(undefined);
    const sivilstandOpplysninger = useGetOpplysningerSivilstand();
    const {
        control,
        getValues,
        getFieldState,
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

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                ...pageErrorsOrUnsavedState.boforhold,
                openFields: {
                    ...pageErrorsOrUnsavedState.boforhold.openFields,
                    sivilstand: editableRow != undefined,
                },
            },
        });
    }, [errors, editableRow]);

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
            const updatedSivilstand = perioderValues[index];
            updateAndSave(
                {
                    nyEllerEndretSivilstandsperiode: {
                        fraOgMed: updatedSivilstand.datoFom,
                        tilOgMed: updatedSivilstand.datoTom,
                        sivilstand: updatedSivilstand.sivilstand,
                        id: updatedSivilstand.id,
                    },
                    tilbakestilleHistorikk: false,
                    angreSisteEndring: false,
                },
                index
            );
        }
    };

    const updateAndSave = (payload: OppdatereSivilstand, index?: number) => {
        saveBoforhold.mutation.mutate(
            { oppdatereSivilstand: payload },
            {
                onSuccess: (response) => {
                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                sivilstand: response.oppdatertSivilstandshistorikk,
                                valideringsfeil: {
                                    ...currentData.boforhold.valideringsfeil,
                                    sivilstand: response.valideringsfeil.sivilstand,
                                },
                            },
                        };
                    });
                    updatedPageErrorState();
                    setShowUndoButton(true);
                    setValue("sivilstand", response.oppdatertSivilstandshistorikk);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => updateAndSave(payload),
                        rollbackFn: () => {
                            if (
                                payload.nyEllerEndretSivilstandsperiode &&
                                payload.nyEllerEndretSivilstandsperiode.id == null
                            ) {
                                sivilstandPerioder.remove(index);
                            } else {
                                setValue("sivilstand", sivilstandBehandling);
                            }
                            if (payload.tilbakestilleHistorikk) {
                                setShowResetButton(true);
                            }
                        },
                    });
                },
            }
        );
        setShowResetButton(true);

        setEditableRow(undefined);
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
            if (perioderValues[index]?.id) {
                updateAndSave({
                    sletteSivilstandsperiode: perioderValues[index].id,
                    tilbakestilleHistorikk: false,
                    angreSisteEndring: false,
                });
            }
            sivilstandPerioder.remove(index);
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
            const editPeriode = controlledFields[index];
            if (editPeriode?.sivilstand == Sivilstandskode.UKJENT) {
                setValue(`sivilstand.${index}.sivilstand`, Sivilstandskode.BOR_ALENE_MED_BARN);
            }
        }
    };
    const undoAction = () => {
        updateAndSave({
            angreSisteEndring: true,
            tilbakestilleHistorikk: false,
        });
    };
    const resetTilDataFraFreg = () => {
        updateAndSave({
            tilbakestilleHistorikk: true,
            angreSisteEndring: false,
        });
        setShowResetButton(false);
    };
    const updatedPageErrorState = () => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                ...pageErrorsOrUnsavedState.boforhold,
                openFields: { ...pageErrorsOrUnsavedState.boforhold.openFields },
            },
        });
    };
    const valideringsfeilSivilstand = valideringsfeil?.sivilstand;
    return (
        <div>
            <Box padding="4" background="surface-subtle" className="overflow-hidden">
                {valideringsfeilSivilstand && valideringsfeilSivilstand.harFeil && (
                    <div className="mb-4">
                        {valideringsfeilSivilstand && (
                            <ForskuddAlert variant="warning">
                                <Heading spacing size="small" level="3">
                                    {text.alert.feilIPeriodisering}
                                </Heading>
                                {valideringsfeilSivilstand.fremtidigPeriode && (
                                    <p>{text.error.framoverPeriodisering}</p>
                                )}
                                {valideringsfeilSivilstand.hullIPerioder.length > 0 && (
                                    <p>{text.error.hullIPerioder}</p>
                                )}
                                {valideringsfeilSivilstand.manglerPerioder && (
                                    <p>{text.error.boforholdManglerPerioder}</p>
                                )}
                                {valideringsfeilSivilstand.ingenLøpendePeriode && (
                                    <p>{text.error.ingenLoependePeriode}</p>
                                )}
                                {valideringsfeilSivilstand.ugyldigStatus && <p>{text.error.ugyldigStatus}</p>}
                            </ForskuddAlert>
                        )}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Opplysninger />
                    {sivilstandOpplysninger != null && showResetButton && (
                        <div className="flex justify-end mb-4">
                            <Button
                                variant="tertiary"
                                type="button"
                                size="small"
                                className="w-fit h-fit"
                                onClick={resetTilDataFraFreg}
                            >
                                {text.resetTilOpplysninger}
                            </Button>
                        </div>
                    )}
                </div>
                {controlledFields.length > 0 && (
                    <div
                        className={`${
                            saveBoforhold.mutation.isPending ? "relative" : "inherit"
                        } block overflow-x-auto whitespace-nowrap`}
                    >
                        <OverlayLoader loading={saveBoforhold.mutation.isPending} />
                        <Table size="small" className="table-fixed table bg-white w-full">
                            <Table.Header>
                                <Table.Row className="align-baseline">
                                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                        {text.label.fraOgMed}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                                        {text.label.tilOgMed}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell textSize="small" scope="col" align="left">
                                        {text.label.sivilstand}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[54px]">
                                        {text.label.kilde}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {controlledFields.map((item, index) => (
                                    <Table.Row key={item?.id} className="align-top">
                                        <Table.DataCell textSize="small">
                                            <Periode
                                                editableRow={editableRow === index}
                                                label={text.label.fraOgMed}
                                                fieldName={`sivilstand.${index}`}
                                                field="datoFom"
                                                item={item}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell textSize="small">
                                            <Periode
                                                editableRow={editableRow === index}
                                                label={text.label.tilOgMed}
                                                fieldName={`sivilstand.${index}`}
                                                field="datoTom"
                                                item={item}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell textSize="small">
                                            <Status
                                                item={item}
                                                editableRow={editableRow === index}
                                                fieldName={`sivilstand.${index}.sivilstand`}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <KildeIcon kilde={item.kilde} />
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <EditOrSaveButton
                                                index={index}
                                                editableRow={editableRow === index}
                                                onEditRow={onEditRow}
                                                onSaveRow={onSaveRow}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <DeleteButton index={index} onRemovePeriode={onRemovePeriode} />
                                        </Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
                <VStack gap="2">
                    {showUndoButton && (
                        <Button
                            variant="tertiary"
                            type="button"
                            size="small"
                            className="w-fit mt-2"
                            onClick={undoAction}
                            iconPosition="right"
                            icon={<ArrowUndoIcon aria-hidden />}
                        >
                            {text.label.angreSisteSteg}
                        </Button>
                    )}
                    {!lesemodus && !erVirkningstidspunktNåværendeMånedEllerFramITid && (
                        <Button
                            variant="tertiary"
                            type="button"
                            size="small"
                            className="w-fit mt-4"
                            onClick={addPeriode}
                        >
                            {text.label.leggTilPeriode}
                        </Button>
                    )}
                </VStack>
            </Box>
        </div>
    );
};

const Opplysninger = () => {
    const sivilstandOpplysninger = useGetOpplysningerSivilstand();

    if (!sivilstandOpplysninger) {
        return null;
    }

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
                    {sivilstandOpplysninger.grunnlag.map((periode, index) => (
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
