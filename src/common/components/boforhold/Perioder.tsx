import {
    Bostatuskode,
    BostatusperiodeDto,
    HusstandsmedlemDtoV2,
    Kilde,
    OppdatereBoforholdRequestV2,
} from "@api/BidragBehandlingApiV1";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { BoforholdOpplysninger } from "@common/components/boforhold/BoforholdOpplysninger";
import { Periode } from "@common/components/boforhold/Periode";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { KildeIcon } from "@common/components/inntekt/InntektTable";
import { OverlayLoader } from "@common/components/OverlayLoader";
import StatefulAlert from "@common/components/StatefulAlert";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import {
    boforholdOptions,
    getFirstDayOfMonthAfterEighteenYears,
    gyldigBostatusOver18År,
    isOver18YearsOld,
} from "@common/helpers/boforholdFormHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useOnSaveBoforhold } from "@common/hooks/useOnSaveBoforhold";
import { hentVisningsnavn } from "@common/hooks/useVisningsnavn";
import { ArrowUndoIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { Button, Heading, Table } from "@navikt/ds-react";
import { formatDateToYearMonth, isAfterEqualsDate } from "@utils/date-utils";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { BoforholdFormValues } from "../../types/boforholdFormValues";

const DeleteButton = ({
    onRemovePeriode,
    barn,
    index,
}: {
    onRemovePeriode: (index) => void;
    barn: HusstandsmedlemDtoV2;
    index: number;
}) => {
    const { lesemodus } = useBehandlingProvider();
    const { type } = useGetBehandlingV2();
    const barnIsOver18 = isOver18YearsOld(barn.fødselsdato);
    const firstOver18PeriodIndex = barn.perioder.findIndex((period) =>
        gyldigBostatusOver18År[type].includes(period.bostatus)
    );
    const showDeleteButton = barnIsOver18 && index === firstOver18PeriodIndex ? false : !!index;

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
    barn,
    item,
}: {
    editableRow: boolean;
    fieldName: `husstandsbarn.${number}.perioder.${number}`;
    barn: HusstandsmedlemDtoV2;
    item: BostatusperiodeDto;
}) => {
    const { clearErrors } = useFormContext<BoforholdFormValues>();
    const { type } = useGetBehandlingV2();
    const bosstatusToVisningsnavn = (bostsatus: Bostatuskode): string => {
        const visningsnavn = hentVisningsnavn(bostsatus);
        if (gyldigBostatusOver18År[type].includes(bostsatus) && isOver18YearsOld(barn.fødselsdato)) {
            return `18 ${text.år}: ${visningsnavn}`;
        }
        return visningsnavn;
    };

    const boforholdStatusOptions = isOver18YearsOld(barn.fødselsdato)
        ? boforholdOptions[type].likEllerOver18År
        : boforholdOptions[type].under18År;

    return editableRow ? (
        <FormControlledSelectField
            name={`${fieldName}.bostatus`}
            className="w-fit"
            label={text.label.status}
            options={boforholdStatusOptions.map((value) => ({
                value,
                text: bosstatusToVisningsnavn(value),
            }))}
            hideLabel
            onSelect={() => clearErrors(`${fieldName}.bostatus`)}
        />
    ) : (
        <div className="h-8 flex items-center">{bosstatusToVisningsnavn(item.bostatus)}</div>
    );
};
export const Perioder = ({ barnIndex }: { barnIndex: number }) => {
    const {
        boforhold: { valideringsfeil },
    } = useGetBehandlingV2();
    const {
        behandlingId,
        lesemodus,
        erVirkningstidspunktNåværendeMånedEllerFramITid,
        setErrorMessage,
        setErrorModalOpen,
        setPageErrorsOrUnsavedState,
        pageErrorsOrUnsavedState,
        setSaveErrorState,
    } = useBehandlingProvider();
    const [showUndoButton, setShowUndoButton] = useState(false);
    const [showResetButton, setShowResetButton] = useState(false);
    const [editableRow, setEditableRow] = useState<`${number}.${number}`>(undefined);
    const behandling = useGetBehandlingV2();
    const saveBoforhold = useOnSaveBoforhold();
    const { control, getValues, clearErrors, setError, setValue, getFieldState, formState } =
        useFormContext<BoforholdFormValues>();
    const barnPerioder = useFieldArray({
        control,
        name: `husstandsbarn.${barnIndex}.perioder`,
    });
    const watchFieldArray = useWatch({ control, name: `husstandsbarn.${barnIndex}.perioder` });
    const controlledFields = barnPerioder.fields.map((field, index) => ({
        ...field,
        ...watchFieldArray[index],
    }));
    const barn = getValues(`husstandsbarn.${barnIndex}`);
    const barnIsOver18 = isOver18YearsOld(barn.fødselsdato);
    const monthAfter18 = getFirstDayOfMonthAfterEighteenYears(new Date(barn.fødselsdato));

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                error:
                    !ObjectUtils.isEmpty(formState.errors?.husstandsbarn) ||
                    !ObjectUtils.isEmpty(formState.errors?.sivilstand),
                openFields: {
                    ...pageErrorsOrUnsavedState.boforhold.openFields,
                    [`husstandsbarn.${barnIndex}`]: !!editableRow,
                },
            },
        });
    }, [formState.errors, editableRow]);

    const onSaveRow = (index: number) => {
        const periodeValues = getValues(`husstandsbarn.${barnIndex}.perioder.${index}`);
        if (periodeValues?.datoFom === null) {
            setError(`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        const selectedPeriodeId = periodeValues.id;
        const selectedStatus = periodeValues.bostatus;
        const selectedDatoFom = periodeValues?.datoFom;
        const selectedDatoTom = periodeValues?.datoTom;

        if (barnIsOver18) {
            const selectedStatusIsOver18 = gyldigBostatusOver18År[behandling.type].includes(selectedStatus);
            const selectedDatoFomIsAfterOrSameAsMonthOver18 = isAfterEqualsDate(selectedDatoFom, monthAfter18);
            const isInvalidStatusOver18 =
                !selectedStatusIsOver18 &&
                (selectedDatoFomIsAfterOrSameAsMonthOver18 ||
                    selectedDatoTom === null ||
                    isAfterEqualsDate(selectedDatoTom, monthAfter18));
            const isInvalidStatusUnder18 = selectedStatusIsOver18 && !selectedDatoFomIsAfterOrSameAsMonthOver18;

            if (isInvalidStatusOver18) {
                setError(`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`, {
                    message: text.error.ugyldigBoststatusEtter18,
                });
            } else if (isInvalidStatusUnder18) {
                setError(`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`, {
                    message: text.error.ugyldigBoststatusFør18,
                });
            } else {
                clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`);
            }
        }

        const fieldState = getFieldState(`husstandsbarn.${barnIndex}.perioder.${index}`);

        if (!fieldState.error) {
            updateAndSave({
                oppdatereHusstandsmedlem: {
                    oppdaterPeriode: {
                        idHusstandsbarn: barn.id,
                        idHusstandsmedlem: barn.id,
                        idPeriode: selectedPeriodeId,
                        periode: {
                            fom: formatDateToYearMonth(selectedDatoFom),
                            til: formatDateToYearMonth(selectedDatoTom),
                        },
                        datoFom: selectedDatoFom,
                        datoTom: selectedDatoTom,
                        bostatus: selectedStatus,
                    },
                },
            });
        }
    };

    const undoAction = () => {
        updateAndSave({
            oppdatereHusstandsmedlem: {
                angreSisteStegForHusstandsmedlem: barn.id,
            },
        });
    };

    const updateAndSave = (payload: OppdatereBoforholdRequestV2) => {
        saveBoforhold.mutation.mutate(payload, {
            onSuccess: (response) => {
                // Set datoTom til null ellers resettes den ikke
                barnPerioder.replace(
                    response.oppdatertHusstandsbarn.perioder.map((d) => ({
                        ...d,
                        datoTom: d.datoTom ?? null,
                    }))
                );

                saveBoforhold.queryClientUpdater((currentData) => {
                    const updatedHusstandsbarnIndex = currentData.boforhold.husstandsbarn.findIndex(
                        (husstandsbarn) => husstandsbarn.id === response.oppdatertHusstandsbarn.id
                    );

                    const updatedHusstandsbarnListe =
                        updatedHusstandsbarnIndex === -1
                            ? currentData.boforhold.husstandsbarn.concat(response.oppdatertHusstandsbarn)
                            : currentData.boforhold.husstandsbarn.toSpliced(
                                  updatedHusstandsbarnIndex,
                                  1,
                                  response.oppdatertHusstandsbarn
                              );

                    return {
                        ...currentData,
                        boforhold: {
                            ...currentData.boforhold,
                            husstandsbarn: updatedHusstandsbarnListe,
                            valideringsfeil: response.valideringsfeil,
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
                        const oppdaterPeriode = payload.oppdatereHusstandsmedlem.oppdaterPeriode;
                        if (oppdaterPeriode && oppdaterPeriode.idPeriode == null) {
                            const perioder = getValues(`husstandsbarn.${barnIndex}.perioder`);
                            barnPerioder.remove(perioder.length - 1);
                        } else {
                            setValue(
                                `husstandsbarn.${barnIndex}`,
                                behandling.boforhold.husstandsbarn.find((b) => b.id === barn.id)
                            );
                        }

                        if (payload.oppdatereHusstandsmedlem.tilbakestillPerioderForHusstandsmedlem) {
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
            const perioderValues = getValues(`husstandsbarn.${barnIndex}.perioder`);
            barnPerioder.append({
                datoFom: null,
                datoTom: null,
                bostatus: isOver18YearsOld(barn.fødselsdato)
                    ? Bostatuskode.REGNES_IKKE_SOM_BARN
                    : Bostatuskode.MED_FORELDER,
                kilde: Kilde.MANUELL,
            });

            setEditableRow(`${barnIndex}.${perioderValues.length}`);
        }
    };

    const removeAndCleanUpPeriodeAndErrors = (index: number) => {
        clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}`);
        barnPerioder.remove(index);
        setEditableRow(undefined);
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const periode = getValues(`husstandsbarn.${barnIndex}.perioder.${index}`);

            if (periode.id) {
                if (periode.kilde === Kilde.MANUELL) {
                    saveBoforhold.mutation.mutate(
                        { oppdatereHusstandsmedlem: { slettPeriode: periode.id } },
                        {
                            onSuccess: (response) => {
                                barnPerioder.replace(
                                    response.oppdatertHusstandsbarn.perioder.map((d) => ({
                                        ...d,
                                        datoTom: d.datoTom ?? null,
                                    }))
                                );
                                clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}`);
                                setEditableRow(undefined);

                                saveBoforhold.queryClientUpdater((currentData) => {
                                    const updatedHusstandsbarnIndex = currentData.boforhold.husstandsbarn.findIndex(
                                        (husstandsbarn) => husstandsbarn.id === response.oppdatertHusstandsbarn.id
                                    );
                                    const updatedHusstandsbarnListe = currentData.boforhold.husstandsbarn.toSpliced(
                                        updatedHusstandsbarnIndex,
                                        1,
                                        response.oppdatertHusstandsbarn
                                    );

                                    return {
                                        ...currentData,
                                        boforhold: {
                                            ...currentData.boforhold,
                                            husstandsbarn: updatedHusstandsbarnListe,
                                            valideringsfeil: response.valideringsfeil,
                                            egetBarnErEnesteVoksenIHusstanden:
                                                response.egetBarnErEnesteVoksenIHusstanden,
                                        },
                                    };
                                });
                            },
                            onError: () => {
                                setSaveErrorState({
                                    error: true,
                                    retryFn: () => onRemovePeriode(index),
                                    rollbackFn: () => {
                                        setValue(
                                            `husstandsbarn.${barnIndex}`,
                                            behandling.boforhold.husstandsbarn.find((b) => b.id === barn.id)
                                        );
                                    },
                                });
                            },
                        }
                    );
                }

                if (periode.kilde === Kilde.OFFENTLIG) {
                    updateAndSave({
                        oppdatereHusstandsmedlem: {
                            oppdaterPeriode: {
                                idHusstandsbarn: barn.id,
                                idHusstandsmedlem: barn.id,
                                idPeriode: periode.id,
                                datoFom: periode.datoFom,
                                datoTom: periode.datoTom,
                                periode: {
                                    fom: formatDateToYearMonth(periode.datoFom),
                                    til: formatDateToYearMonth(periode.datoTom),
                                },
                                bostatus:
                                    periode.bostatus === Bostatuskode.MED_FORELDER
                                        ? Bostatuskode.IKKE_MED_FORELDER
                                        : Bostatuskode.MED_FORELDER,
                            },
                        },
                    });
                }
            } else {
                removeAndCleanUpPeriodeAndErrors(index);
            }
        }
    };

    const resetTilDataFraFreg = () => {
        const barn = getValues(`husstandsbarn.${barnIndex}`);
        updateAndSave({ oppdatereHusstandsmedlem: { tilbakestillPerioderForHusstandsmedlem: barn.id } });
        setShowResetButton(false);
    };

    const checkIfAnotherRowIsEdited = (index?: number) => {
        const editableRowIndex = editableRow?.split(".")[1];
        return editableRowIndex && Number(editableRowIndex) !== index;
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
            setEditableRow(`${barnIndex}.${index}`);
        }
    };

    const valideringsfeilForBarn = valideringsfeil?.husstandsmedlem?.find(
        (feil) => feil.barn.husstandsmedlemId === barn.id
    );

    return (
        <div className="grid gap-2">
            <BoforholdOpplysninger
                ident={barn.ident}
                showResetButton={showResetButton}
                onActivateOpplysninger={(overskrevetManuelleOpplysninger) => {
                    setShowUndoButton((prevValue) => prevValue || overskrevetManuelleOpplysninger);
                    setShowResetButton(!overskrevetManuelleOpplysninger);
                }}
                resetTilDataFraFreg={resetTilDataFraFreg}
                fieldName={`husstandsbarn.${barnIndex}.perioder`}
            />
            {barnIsOver18 && !lesemodus && (
                <StatefulAlert
                    variant="info"
                    size="small"
                    alertKey={"18åralert" + behandlingId + barn.ident}
                    className="w-[708px] mb-2"
                    closeButton
                >
                    <Heading size="small" level="3">
                        {text.title.barnOver18}
                    </Heading>
                    {text.barnetHarFylt18SjekkBostatus}
                </StatefulAlert>
            )}
            {valideringsfeilForBarn && (
                <div className="mb-4">
                    <BehandlingAlert variant="warning">
                        <Heading spacing size="small" level="3">
                            {text.alert.feilIPeriodisering}
                        </Heading>
                        {valideringsfeilForBarn.fremtidigPeriode && <p>{text.error.framoverPeriodisering}</p>}
                        {valideringsfeilForBarn.hullIPerioder.length > 0 && <p>{text.error.hullIPerioder}</p>}
                        {valideringsfeilForBarn.ingenLøpendePeriode && <p>{text.error.ingenLoependePeriode}</p>}
                    </BehandlingAlert>
                </div>
            )}

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
                                            editableRow={editableRow === `${barnIndex}.${index}`}
                                            label={text.label.fraOgMed}
                                            fieldName={`husstandsbarn.${barnIndex}.perioder.${index}`}
                                            field="datoFom"
                                            item={item}
                                            barn={barn}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <Periode
                                            editableRow={editableRow === `${barnIndex}.${index}`}
                                            label={text.label.tilOgMed}
                                            fieldName={`husstandsbarn.${barnIndex}.perioder.${index}`}
                                            field="datoTom"
                                            item={item}
                                            barn={barn}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <Status
                                            item={item}
                                            editableRow={editableRow === `${barnIndex}.${index}`}
                                            fieldName={`husstandsbarn.${barnIndex}.perioder.${index}`}
                                            barn={barn}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <KildeIcon kilde={item.kilde} />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <EditOrSaveButton
                                            index={index}
                                            editableRow={editableRow === `${barnIndex}.${index}`}
                                            onEditRow={onEditRow}
                                            onSaveRow={onSaveRow}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <DeleteButton index={index} onRemovePeriode={onRemovePeriode} barn={barn} />
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
                {!lesemodus && !erVirkningstidspunktNåværendeMånedEllerFramITid && (
                    <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                        {text.label.leggTilPeriode}
                    </Button>
                )}
            </div>
        </div>
    );
};
