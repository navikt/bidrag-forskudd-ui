import { Bostatuskode, BostatusperiodeDto, Kilde, OppdatereBoforholdRequestV2 } from "@api/BidragBehandlingApiV1";
import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { KildeIcon } from "@common/components/inntekt/InntektTable";
import { OverlayLoader } from "@common/components/OverlayLoader";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { andreVoksneIHusstandenBoforholdOptions } from "@common/helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "@common/helpers/virkningstidspunktHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useOnSaveBoforhold } from "@common/hooks/useOnSaveBoforhold";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { hentVisningsnavn } from "@common/hooks/useVisningsnavn";
import { BoforholdFormValues } from "@common/types/boforholdFormValues";
import { ArrowUndoIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { Alert, Box, Button, Heading, Table } from "@navikt/ds-react";
import {
    addMonthsIgnoreDay,
    dateOrNull,
    DateToDDMMYYYYString,
    formatDateToYearMonth,
    isAfterDate,
} from "@utils/date-utils";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import elementIds from "../../../../common/constants/elementIds";
import { AndreVoksneIHusstandOpplysninger } from "./AndreVoksneIHusstandOpplysninger";

export const Periode = ({
    editableRow,
    item,
    field,
    fieldName,
    label,
}: {
    editableRow: boolean;
    item: BostatusperiodeDto;
    fieldName: `andreVoksneIHusstanden.${number}`;
    field: "datoFom" | "datoTom";
    label: string;
}) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    const { erVirkningstidspunktNåværendeMånedEllerFramITid } = useBehandlingProvider();
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
            toDate={fieldIsDatoTom ? tom : addMonthsIgnoreDay(tom, 1)}
            lastDayOfMonthPicker={fieldIsDatoTom}
            required={!fieldIsDatoTom}
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item[field] && DateToDDMMYYYYString(dateOrNull(item[field]))}</div>
    );
};

const DeleteButton = ({ onRemovePeriode, index }: { onRemovePeriode: (index) => void; index: number }) => {
    const { lesemodus } = useBehandlingProvider();
    const showDeleteButton = !!index;

    return showDeleteButton && !lesemodus ? (
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
    const { lesemodus } = useBehandlingProvider();

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
    fieldName: `andreVoksneIHusstanden.${number}`;
    item: BostatusperiodeDto;
}) => {
    const { clearErrors } = useFormContext<BoforholdFormValues>();

    const boforholdOptions = andreVoksneIHusstandenBoforholdOptions;

    return editableRow ? (
        <FormControlledSelectField
            name={`${fieldName}.bostatus`}
            className="w-fit"
            label={text.label.status}
            options={boforholdOptions.map((value) => ({
                value,
                text: hentVisningsnavn(value),
            }))}
            hideLabel
            onSelect={() => clearErrors(`${fieldName}.bostatus`)}
        />
    ) : (
        <div className="h-8 flex items-center">{hentVisningsnavn(item.bostatus)}</div>
    );
};
export const AndreVoksneIHusstanden = () => {
    const {
        lesemodus,
        erVirkningstidspunktNåværendeMånedEllerFramITid,
        setErrorMessage,
        setErrorModalOpen,
        setPageErrorsOrUnsavedState,
        pageErrorsOrUnsavedState,
        setSaveErrorState,
    } = useBehandlingProvider();
    const [showUndoButton, setShowUndoButton] = useState(false);
    const [editableRow, setEditableRow] = useState<number>(undefined);
    const behandling = useGetBehandlingV2();
    const [showResetButton, setShowResetButton] = useState(false);
    const saveBoforhold = useOnSaveBoforhold();
    const { control, getValues, clearErrors, setError, setValue, getFieldState, formState } =
        useFormContext<BoforholdFormValues>();
    const perioder = useFieldArray({
        control,
        name: `andreVoksneIHusstanden`,
    });
    const watchFieldArray = useWatch({ control, name: `andreVoksneIHusstanden` });
    const controlledFields = perioder.fields.map((field, index) => ({
        ...field,
        ...watchFieldArray[index],
    }));

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                error:
                    !ObjectUtils.isEmpty(formState.errors?.husstandsbarn) ||
                    !ObjectUtils.isEmpty(formState.errors?.sivilstand),
                openFields: {
                    ...pageErrorsOrUnsavedState.boforhold.openFields,
                    andreVoksneIHusstanden: !!editableRow,
                },
            },
        });
    }, [formState.errors, editableRow]);

    const onSaveRow = (index: number) => {
        const periodeValues = getValues(`andreVoksneIHusstanden.${index}`);
        if (periodeValues?.datoFom === null) {
            setError(`andreVoksneIHusstanden.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        const selectedPeriodeId = periodeValues.id;
        const selectedStatus = periodeValues.bostatus;
        const selectedDatoFom = periodeValues?.datoFom;
        const selectedDatoTom = periodeValues?.datoTom;

        const fieldState = getFieldState(`andreVoksneIHusstanden.${index}`);

        if (!fieldState.error) {
            updateAndSave({
                oppdaterePeriodeMedAndreVoksneIHusstand: {
                    oppdaterePeriode: {
                        idPeriode: selectedPeriodeId,
                        periode: {
                            fom: formatDateToYearMonth(selectedDatoFom),
                            til: formatDateToYearMonth(selectedDatoTom),
                        },
                        borMedAndreVoksne: selectedStatus === Bostatuskode.BOR_MED_ANDRE_VOKSNE,
                    },
                    tilbakestilleHistorikk: false,
                    angreSisteEndring: false,
                },
            });
        }
    };

    const undoAction = () => {
        updateAndSave({
            oppdaterePeriodeMedAndreVoksneIHusstand: {
                angreSisteEndring: true,
                tilbakestilleHistorikk: false,
            },
        });
    };

    const updateAndSave = (payload: OppdatereBoforholdRequestV2) => {
        saveBoforhold.mutation.mutate(payload, {
            onSuccess: (response) => {
                // Set datoTom til null ellers resettes den ikke
                perioder.replace(
                    response.oppdatertePerioderMedAndreVoksne.map((d) => ({
                        ...d,
                        datoTom: d.datoTom ?? null,
                    }))
                );

                saveBoforhold.queryClientUpdater((currentData) => {
                    return {
                        ...currentData,
                        boforhold: {
                            ...currentData.boforhold,
                            andreVoksneIHusstanden: response.oppdatertePerioderMedAndreVoksne,
                            egetBarnErEnesteVoksenIHusstanden: response.egetBarnErEnesteVoksenIHusstanden,
                        },
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => updateAndSave(payload),
                    rollbackFn: () => {
                        const oppdaterPeriode = payload.oppdaterePeriodeMedAndreVoksneIHusstand.oppdaterePeriode;
                        if (oppdaterPeriode && oppdaterPeriode.idPeriode == null) {
                            const andreVoksneIHusstandenPerioder = getValues(`andreVoksneIHusstanden`);
                            perioder.remove(andreVoksneIHusstandenPerioder.length - 1);
                        } else {
                            setValue(`andreVoksneIHusstanden`, behandling.boforhold.andreVoksneIHusstanden);
                        }

                        if (payload.oppdaterePeriodeMedAndreVoksneIHusstand.tilbakestilleHistorikk) {
                            setShowResetButton(true);
                        }
                    },
                });
            },
        });

        setShowUndoButton(true);
        setShowResetButton(true);
        setEditableRow(undefined);
    };

    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`andreVoksneIHusstanden`);
            perioder.append({
                datoFom: behandling.virkningstidspunkt?.virkningstidspunkt,
                datoTom: null,
                bostatus: Bostatuskode.BOR_MED_ANDRE_VOKSNE,
                kilde: Kilde.MANUELL,
            });

            setEditableRow(perioderValues.length);
        }
    };

    const removeAndCleanUpPeriodeAndErrors = (index: number) => {
        clearErrors(`andreVoksneIHusstanden.${index}`);
        perioder.remove(index);
        setEditableRow(undefined);
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const periode = getValues(`andreVoksneIHusstanden.${index}`);

            if (periode.id) {
                updateAndSave({ oppdatereHusstandsmedlem: { slettPeriode: periode.id } });
            } else {
                removeAndCleanUpPeriodeAndErrors(index);
            }
        }
    };

    const resetTilDataFraFreg = () => {
        updateAndSave({
            oppdaterePeriodeMedAndreVoksneIHusstand: { tilbakestilleHistorikk: true, angreSisteEndring: false },
        });
        setShowResetButton(false);
    };

    const checkIfAnotherRowIsEdited = (index?: number) => {
        return editableRow && Number(editableRow) !== index;
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

    return (
        <Box
            background="surface-subtle"
            className="overflow-hidden grid gap-2 py-2 px-4"
            id={`${elementIds.seksjon_andreVoksneIHusstand}`}
        >
            {behandling.boforhold?.egetBarnErEnesteVoksenIHusstanden && (
                <Alert variant="info" size="small" className="w-[708px]">
                    <Heading size="xsmall" level="4">
                        18-åring regnes som voksen
                    </Heading>
                    Det legges til grunn at BP deler bolig med voksne, uavhengig av status som legges til grunn i
                    tabellen under
                </Alert>
            )}

            <div className="grid gap-2">
                <AndreVoksneIHusstandOpplysninger
                    showResetButton={showResetButton}
                    onActivateOpplysninger={(overskrevetManuelleOpplysninger) => {
                        setShowUndoButton((prevValue) => prevValue || overskrevetManuelleOpplysninger);
                        setShowResetButton(!overskrevetManuelleOpplysninger);
                    }}
                    resetTilDataFraFreg={resetTilDataFraFreg}
                />
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
                                        {text.label.status}
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
                                                fieldName={`andreVoksneIHusstanden.${index}`}
                                                field="datoFom"
                                                item={item}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell textSize="small">
                                            <Periode
                                                editableRow={editableRow === index}
                                                label={text.label.tilOgMed}
                                                fieldName={`andreVoksneIHusstanden.${index}`}
                                                field="datoTom"
                                                item={item}
                                            />
                                        </Table.DataCell>
                                        <Table.DataCell textSize="small">
                                            <Status
                                                item={item}
                                                editableRow={editableRow === index}
                                                fieldName={`andreVoksneIHusstanden.${index}`}
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
                <div className="grid gap-2">
                    {showUndoButton && (
                        <Button
                            variant="tertiary"
                            type="button"
                            size="small"
                            className="w-fit"
                            onClick={undoAction}
                            iconPosition="right"
                            icon={<ArrowUndoIcon aria-hidden />}
                        >
                            {text.label.angreSisteSteg}
                        </Button>
                    )}
                    {!lesemodus &&
                        (!erVirkningstidspunktNåværendeMånedEllerFramITid || controlledFields.length === 0) && (
                            <Button
                                variant="tertiary"
                                type="button"
                                size="small"
                                className="w-fit"
                                onClick={addPeriode}
                            >
                                {text.label.leggTilPeriode}
                            </Button>
                        )}
                </div>
            </div>
        </Box>
    );
};
