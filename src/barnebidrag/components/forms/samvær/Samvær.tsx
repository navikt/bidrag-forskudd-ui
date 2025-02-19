import {
    OppdaterSamvaerDto,
    Rolletype,
    SamvaerDto,
    Samvaersklasse,
    SletteSamvaersperiodeElementDto,
} from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { FormControlledCustomTextareaEditor } from "@common/components/formFields/FormControlledCustomTextEditor";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { OverlayLoader } from "@common/components/OverlayLoader";
import { PersonNavn } from "@common/components/PersonNavn";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "@common/components/RolleTag";
import { default as urlSearchParams } from "@common/constants/behandlingQueryKeys";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { actionOnEnter } from "@common/helpers/keyboardHelpers";
import {
    createInitialValues,
    createSamværInitialValues,
    createSamværskalkulatorDefaultvalues,
    createSamværsperiodeInitialValues,
    mapToSamværskalkulatoDetaljer,
} from "@common/helpers/samværFormHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { useOnDeleteSamværsperiode, useOnSaveSamvær } from "@common/hooks/useSaveSamvær";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { SamværBarnformvalues, SamværPeriodeFormvalues } from "@common/types/samværFormValues";
import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { deductDays } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Button, Heading, Table, Tabs } from "@navikt/ds-react";
import {
    addDays,
    addMonthsIgnoreDay,
    dateOrNull,
    DateToDDMMYYYYString,
    getStartOfNextMonth,
    toISODateString,
} from "@utils/date-utils";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { CustomTextareaEditor } from "../../../../common/components/CustomEditor";
import elementIds from "../../../../common/constants/elementIds";
import { SærligeutgifterStepper } from "../../../../særbidrag/enum/SærligeutgifterStepper";
import { STEPS } from "../../../constants/steps";
import { SamværsklasseSelector } from "./SamværklasseSelector";
import { SamværskalkulatorButton, SamværskalkulatorForm } from "./Samværskalkulator";
import { Samværsperiode } from "./Samværsperiode";

const SamværForm = () => {
    const { samvær, roller } = useGetBehandlingV2();
    const virkningsOrSoktFraDato = useVirkningsdato();
    const barnMedISaken = useMemo(() => roller.filter((rolle) => rolle.rolletype === Rolletype.BA), [roller]);
    const initialValues = useMemo(() => createInitialValues(samvær), [samvær, virkningsOrSoktFraDato, barnMedISaken]);

    const ref = useRef(null);
    const useFormMethods = useForm({
        defaultValues: initialValues,
        criteriaMode: "all",
    });

    useEffect(() => {
        const checkForBegrunnelseValidationError = (samvær: SamvaerDto) => {
            if (samvær?.valideringsfeil?.manglerBegrunnelse) {
                useFormMethods.setError(`${samvær.gjelderBarn}.begrunnelse`, {
                    type: "notValid",
                    message: text.error.feltErPåkrevd,
                });
            }
        };

        samvær.forEach(checkForBegrunnelseValidationError);
    }, []);

    return (
        <FormProvider {...useFormMethods}>
            <form ref={ref} onSubmit={(e) => e.preventDefault()}>
                <NewFormLayout title={text.title.samvær} main={<Main />} side={<Side />} />
            </form>
        </FormProvider>
    );
};

const Side = () => {
    const [searchParams] = useSearchParams();
    const { samvær, roller } = useGetBehandlingV2();
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
    const saveSamværFn = useOnSaveSamvær();
    const { watch, getValues, setValue } = useFormContext<SamværBarnformvalues>();
    const selectedRolleId = searchParams.get(urlSearchParams.tab);
    const selectedRolleIdNumber = selectedRolleId != null ? Number(selectedRolleId) : undefined;
    const rolle = roller.find((rolle) => rolle.id === selectedRolleIdNumber);
    const oppdaterSamvær = rolle ? samvær.find((s) => s.gjelderBarn === rolle.ident) : samvær?.[0];
    const [previousValues, setPreviousValues] = useState<string>(
        getValues(`${oppdaterSamvær.gjelderBarn}.begrunnelse`)
    );

    const onSave = () => {
        const begrunnelse = getValues(`${oppdaterSamvær.gjelderBarn}.begrunnelse`);
        saveSamværFn.mutation.mutate(
            {
                gjelderBarn: oppdaterSamvær.gjelderBarn,
                oppdatereBegrunnelse: {
                    nyBegrunnelse: begrunnelse,
                },
            },
            {
                onSuccess: (response) => {
                    saveSamværFn.queryClientUpdater((currentData) => {
                        const updatedSamvær = currentData.samvær.map((s) => {
                            if (s.id === Number(oppdaterSamvær.id)) {
                                return response.oppdatertSamvær;
                            }
                            return s;
                        });
                        return {
                            ...currentData,
                            samvær: updatedSamvær,
                        };
                    });
                    setPreviousValues(response.oppdatertSamvær.begrunnelse.innhold);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue(`${oppdaterSamvær.gjelderBarn}.begrunnelse`, previousValues ?? "");
                        },
                    });
                },
            }
        );
    };
    const onNext = () => onStepChange(STEPS[SærligeutgifterStepper.VEDTAK]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (name.includes("begrunnelse") && (type === "change" || type === undefined)) {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <Fragment key={oppdaterSamvær.id}>
            <FormControlledCustomTextareaEditor
                label={text.title.begrunnelse}
                name={`${oppdaterSamvær.gjelderBarn}.begrunnelse`}
                description={text.description.samværBegrunnelse}
                resize
            />
            {oppdaterSamvær.begrunnelseFraOpprinneligVedtak && (
                <CustomTextareaEditor
                    name={`${oppdaterSamvær.gjelderBarn}.begrunnelseFraOpprinneligVedtak`}
                    label={text.label.begrunnelseFraOpprinneligVedtak}
                    value={oppdaterSamvær.begrunnelseFraOpprinneligVedtak.innhold}
                    resize
                    readOnly
                />
            )}
            <ActionButtons onNext={onNext} />
        </Fragment>
    );
};

const Main = () => {
    const { roller: behandlingRoller } = useGetBehandlingV2();
    const { onNavigateToTab } = useBehandlingProvider();
    const [searchParams] = useSearchParams();

    const roller = behandlingRoller
        .filter((rolle) => rolle.rolletype === Rolletype.BA)
        .sort((a, b) => a.ident.localeCompare(b.ident));

    const defaultTab = useMemo(() => {
        const roleId = roller
            .find((rolle) => rolle.id?.toString() === searchParams.get(urlSearchParams.tab))
            ?.id?.toString();
        return roleId ?? roller[0].id.toString();
    }, []);
    const selectedTab = searchParams.get(urlSearchParams.tab) ?? defaultTab;

    if (roller.length > 1) {
        return (
            <Tabs
                defaultValue={defaultTab}
                value={selectedTab}
                onChange={onNavigateToTab}
                className="lg:max-w-[960px] md:max-w-[720px] sm:max-w-[598px] w-full"
            >
                <Tabs.List>
                    {roller.map((rolle) => (
                        <Tabs.Tab
                            key={rolle.ident}
                            value={rolle.id.toString()}
                            label={`${ROLE_FORKORTELSER[rolle.rolletype]} ${rolle.ident}`}
                        />
                    ))}
                </Tabs.List>
                {roller.map((rolle) => {
                    return (
                        <Tabs.Panel key={rolle.ident} value={rolle.id.toString()} className="grid gap-y-4">
                            <SamværBarn gjelderBarn={rolle.ident} />
                        </Tabs.Panel>
                    );
                })}
            </Tabs>
        );
    }
    const rolle = roller[0];
    return (
        <>
            <SamværBarn gjelderBarn={rolle.ident} />
        </>
    );
};
export const SamværBarn = ({ gjelderBarn }: { gjelderBarn: string }) => {
    const {
        lesemodus,
        erVirkningstidspunktNåværendeMånedEllerFramITid,
        setErrorMessage,
        setErrorModalOpen,
        setSaveErrorState,
    } = useBehandlingProvider();

    const [editableRow, setEditableRow] = useState<number>(undefined);
    const behandling = useGetBehandlingV2();
    const saveSamværFn = useOnSaveSamvær();
    const deleteSamværFn = useOnDeleteSamværsperiode();
    const { control, getValues, clearErrors, setError, getFieldState, setValue } =
        useFormContext<SamværBarnformvalues>();
    const perioder = useFieldArray({
        control,
        name: `${gjelderBarn}.perioder`,
    });
    const watchFieldArray = useWatch({ control, name: `${gjelderBarn}.perioder` });
    const samvær = behandling.samvær.find((s) => s.gjelderBarn === gjelderBarn);
    const samværId = samvær.id;
    const controlledFields = perioder.fields.map((field, index) => ({
        ...field,
        ...watchFieldArray?.[index],
    }));

    const onSaveRow = (index: number) => {
        const periodeValues = getValues(`${gjelderBarn}.perioder.${index}`);
        if (periodeValues?.fom === null) {
            setError(`${gjelderBarn}.perioder.${index}.fom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        const selectedPeriodeId = periodeValues.id;
        const selectedSamvær = periodeValues.samværsklasse;
        const selectedDatoFom = periodeValues?.fom;
        const selectedDatoTom = periodeValues?.tom;

        const fieldState = getFieldState(`${gjelderBarn}.perioder.${index}`);

        if (!fieldState.error) {
            const beregningMapped = mapToSamværskalkulatoDetaljer(periodeValues.beregning);
            updateAndSave({
                periode: {
                    id: Number(selectedPeriodeId),
                    samværsklasse: beregningMapped ? null : selectedSamvær,
                    periode: {
                        fom: selectedDatoFom,
                        tom: selectedDatoTom,
                    },
                    beregning: beregningMapped,
                },
                gjelderBarn: gjelderBarn,
            });
        }
    };

    const deleteAndSave = (payload: SletteSamvaersperiodeElementDto) => {
        deleteSamværFn.mutation.mutate(payload, {
            onSuccess: (response) => {
                // Set datoTom til null ellers resettes den ikke
                perioder.replace(response.oppdatertSamvær.perioder.map((d) => createSamværsperiodeInitialValues(d)));

                saveSamværFn.queryClientUpdater((currentData) => {
                    return {
                        ...currentData,
                        samvær: currentData.samvær.map((s) => {
                            if (s.id === samværId) {
                                return response.oppdatertSamvær;
                            }
                            return s;
                        }),
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => deleteAndSave(payload),
                    rollbackFn: () => {
                        setValue(`${gjelderBarn}.perioder`, createSamværInitialValues(samvær).perioder);
                    },
                });
            },
        });

        setEditableRow(undefined);
    };

    const updateAndSave = (payload: OppdaterSamvaerDto) => {
        saveSamværFn.mutation.mutate(payload, {
            onSuccess: (response) => {
                perioder.replace(response.oppdatertSamvær.perioder.map((d) => createSamværsperiodeInitialValues(d)));

                saveSamværFn.queryClientUpdater((currentData) => {
                    return {
                        ...currentData,
                        samvær: currentData.samvær.map((s) => {
                            if (s.gjelderBarn === gjelderBarn) {
                                return response.oppdatertSamvær;
                            }
                            return s;
                        }),
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => updateAndSave(payload),
                    rollbackFn: () => {
                        const oppdaterPeriode = payload.periode;
                        if (oppdaterPeriode && oppdaterPeriode.id == null) {
                            const samværperioder = getValues(`${gjelderBarn}.perioder`);
                            perioder.remove(samværperioder.length - 1);
                        } else {
                            setValue(`${gjelderBarn}.perioder`, createSamværInitialValues(samvær).perioder);
                        }
                    },
                });
            },
        });

        setEditableRow(undefined);
    };
    const findTomdato = (previousPeriode?: SamværPeriodeFormvalues) => {
        if (previousPeriode) {
            const fomDato = findFomdato(previousPeriode);
            if (!fomDato) return previousPeriode.tom;

            return toISODateString(deductDays(new Date(fomDato), 1));
        }
        return null;
    };
    const findFomdato = (previousPeriode?: SamværPeriodeFormvalues) => {
        if (previousPeriode) {
            const fomDato = previousPeriode.tom
                ? toISODateString(addDays(new Date(previousPeriode.tom), 1))
                : toISODateString(addMonthsIgnoreDay(new Date(previousPeriode.fom), 1));

            if (
                new Date(fomDato) > getStartOfNextMonth() ||
                new Date(fomDato) < new Date(behandling.virkningstidspunkt?.virkningstidspunkt)
            ) {
                return null;
            }
            return fomDato;
        }
        return behandling.virkningstidspunkt?.virkningstidspunkt;
    };
    const addPeriode = () => {
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`${gjelderBarn}.perioder`);

            const sortedPerioderValues = perioderValues?.sort((a, b) => (new Date(a.fom) > new Date(b.fom) ? 1 : -1));
            const previousPeriode = sortedPerioderValues?.[perioderValues.length - 1];
            if (previousPeriode) {
                const previousPeriodeIndex = perioderValues.indexOf(previousPeriode);
                perioder.update(previousPeriodeIndex, { ...previousPeriode, tom: findTomdato(previousPeriode) });
            }
            perioder.append({
                fom: findFomdato(previousPeriode),
                tom: null,
                samværsklasse: previousPeriode?.samværsklasse ?? Samvaersklasse.SAMVAeRSKLASSE0,
                beregning: previousPeriode?.beregning ?? createSamværskalkulatorDefaultvalues(),
            });

            setEditableRow(perioderValues.length);
        }
    };

    const removeAndCleanUpPeriodeAndErrors = (index: number) => {
        clearErrors(`${gjelderBarn}.perioder.${index}`);
        perioder.remove(index);
        setEditableRow(undefined);
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const periode = getValues(`${gjelderBarn}.perioder.${index}`);

            if (periode.id) {
                deleteAndSave({ samværsperiodeId: Number(periode.id), gjelderBarn });
            } else {
                removeAndCleanUpPeriodeAndErrors(index);
            }
        }
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

    const valideringsfeil = samvær.valideringsfeil;
    return (
        <>
            <Box
                background="surface-subtle"
                className="overflow-hidden grid gap-2 py-2 px-4 w-full"
                id={`${elementIds.seksjon_samvær}_${samværId}`}
            >
                <div className="grid grid-cols-[max-content,auto] items-center p-2 bg-white">
                    <div>
                        <RolleTag rolleType={Rolletype.BA} />
                    </div>
                    <BodyShort size="small" className="flex items-center gap-4">
                        <PersonNavn bold ident={gjelderBarn}></PersonNavn>
                        <span>{DateToDDMMYYYYString(dateOrNull())}</span>
                    </BodyShort>
                </div>
                {valideringsfeil?.harPeriodiseringsfeil && (
                    <div className="mb-4">
                        <BehandlingAlert variant="warning">
                            <Heading size="xsmall" level="6">
                                {text.alert.feilIPeriodisering}
                            </Heading>
                            {valideringsfeil.hullIPerioder.length > 0 && (
                                <BodyShort size="small">Det er perioder uten samvær.</BodyShort>
                            )}
                            {valideringsfeil.ingenLøpendeSamvær && (
                                <BodyShort size="small">{text.error.ingenLøpendeSamvær}</BodyShort>
                            )}
                            {valideringsfeil.overlappendePerioder.length > 0 && (
                                <BodyShort size="small">{text.error.overlappendeSamværsperioder}</BodyShort>
                            )}
                            {valideringsfeil.manglerSamvær && (
                                <BodyShort size="small">{text.error.manglerSamværsperioder}</BodyShort>
                            )}
                            {valideringsfeil.ugyldigSluttperiode && (
                                <BodyShort size="small">
                                    {text.error.sistePeriodeMåSluttePåOpphørsdato.replace(
                                        "{}",
                                        DateToDDMMYYYYString(
                                            deductDays(
                                                dateOrNull(behandling.virkningstidspunkt?.opphør?.opphørsdato),
                                                1
                                            )
                                        )
                                    )}
                                </BodyShort>
                            )}
                        </BehandlingAlert>
                    </div>
                )}
                <div className="grid gap-2 w-full">
                    {controlledFields.length > 0 && (
                        <div
                            className={`${
                                saveSamværFn.mutation.isPending ? "relative" : "inherit"
                            } block overflow-x-auto whitespace-nowrap w-full`}
                        >
                            <OverlayLoader loading={saveSamværFn.mutation.isPending} />
                            <SamværsperiodeTable
                                onSaveRow={onSaveRow}
                                onEditRow={onEditRow}
                                fieldName={`${gjelderBarn}.perioder`}
                                onRemovePeriode={onRemovePeriode}
                                controlledFields={controlledFields}
                                editableRowIndex={editableRow}
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
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
        </>
    );
};

interface SamværsperiodeTableProps {
    controlledFields: SamværPeriodeFormvalues[];
    editableRowIndex: number;
    fieldName: `${string}.perioder`;
    onSaveRow: (index: number) => void;
    onEditRow: (index: number) => void;
    onRemovePeriode: (index: number) => void;
}

const SamværsperiodeTable: React.FC<SamværsperiodeTableProps> = ({
    editableRowIndex,
    controlledFields,
    fieldName,
    onSaveRow,
    onEditRow,
    onRemovePeriode,
}) => {
    const [isExpanded, setIsExpanded] = useState<{ [index: number]: boolean }>({});

    const isSamværsklasseCalculated = (item: SamværPeriodeFormvalues) => item.beregning.isSaved === true;
    useEffect(() => {
        controlledFields.forEach((item, index) => {
            setIsExpanded((prev) => ({ ...prev, [index]: isSamværsklasseCalculated(item) ? prev[index] : false }));
        });
    }, [controlledFields]);

    return (
        <Table size="small" className="table-auto table bg-white w-full">
            <Table.Header>
                <Table.Row className="align-baseline">
                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                        {text.label.fraOgMed}
                    </Table.HeaderCell>
                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[134px]">
                        {text.label.tilOgMed}
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        textSize="small"
                        scope="col"
                        align="right"
                        className="w-[350px]"
                    ></Table.HeaderCell>

                    <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[154px]">
                        {text.label.samvær}
                    </Table.HeaderCell>
                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                    <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {controlledFields.map((item, index) => (
                    <Table.ExpandableRow
                        key={item?.id}
                        className="align-top"
                        onKeyDown={actionOnEnter(() => onSaveRow(index))}
                        togglePlacement="right"
                        open={!isSamværsklasseCalculated(item) ? false : isExpanded[index] === true}
                        onOpenChange={(isOpen) => {
                            setIsExpanded((prev) => ({ ...prev, [index]: isOpen }));
                        }}
                        expansionDisabled={!isSamværsklasseCalculated(item)}
                        content={<SamværskalkulatorForm fieldname={`${fieldName}.${index}`} viewOnly />}
                    >
                        <Table.DataCell textSize="small">
                            <Samværsperiode
                                editableRow={editableRowIndex === index}
                                label={text.label.fraOgMed}
                                fieldName={`${fieldName}.${index}`}
                                field="fom"
                                item={item}
                            />
                        </Table.DataCell>
                        <Table.DataCell textSize="small">
                            <Samværsperiode
                                editableRow={editableRowIndex === index}
                                label={text.label.tilOgMed}
                                fieldName={`${fieldName}.${index}`}
                                field="tom"
                                item={item}
                            />
                        </Table.DataCell>
                        <Table.DataCell textSize="small" align="right" className="align-middle">
                            <SamværskalkulatorButton
                                editableRow={editableRowIndex === index}
                                fieldname={`${fieldName}.${index}`}
                            />
                        </Table.DataCell>
                        <Table.DataCell>
                            <SamværsklasseSelector
                                editableRow={editableRowIndex === index}
                                fieldName={`${fieldName}.${index}`}
                                item={item}
                            />
                        </Table.DataCell>
                        <Table.DataCell>
                            <EditOrSaveButton
                                index={index}
                                editableRow={editableRowIndex === index}
                                onEditRow={onEditRow}
                                onSaveRow={onSaveRow}
                            />
                        </Table.DataCell>
                        <Table.DataCell>
                            <DeleteButton index={index} onRemovePeriode={onRemovePeriode} />
                        </Table.DataCell>
                    </Table.ExpandableRow>
                ))}
            </Table.Body>
        </Table>
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
const DeleteButton = ({ onRemovePeriode, index }: { onRemovePeriode: (index) => void; index: number }) => {
    const { lesemodus } = useBehandlingProvider();

    return !lesemodus ? (
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

export default () => {
    return (
        <QueryErrorWrapper>
            <SamværForm />
        </QueryErrorWrapper>
    );
};
