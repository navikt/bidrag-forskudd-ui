import {
    OppdatereUtgiftRequest,
    Resultatkode,
    Saerbidragskategori,
    SaerbidragUtgifterDto,
    UtgiftspostDto,
    Utgiftstype,
} from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledCheckbox } from "@common/components/formFields/FormControlledCheckbox";
import { FormControlledDatePicker } from "@common/components/formFields/FormControlledDatePicker";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { FormControlledTextField } from "@common/components/formFields/FormControlledTextField";
import LeggTilPeriodeButton from "@common/components/formFields/FormLeggTilPeriode";
import { FlexRow } from "@common/components/layout/grid/FlexRow";
import { FormLayout } from "@common/components/layout/grid/FormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { SOKNAD_LABELS } from "@common/constants/soknadFraLabels";
import text from "@common/constants/texts";
import texts from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { hentVisningsnavn, hentVisningsnavnVedtakstype } from "@common/hooks/useVisningsnavn";
import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { capitalize, ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Button, Heading, Label, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString, deductMonths, isBeforeDate } from "@utils/date-utils";
import React, { useEffect } from "react";
import { FieldPath, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { AvslagListe } from "../../../constants/avslag";
import { STEPS } from "../../../constants/steps";
import { SærligeutgifterStepper } from "../../../enum/SærligeutgifterStepper";
import { useOnSaveUtgifter } from "../../../hooks/useOnSaveUtgifter";
import { UtgiftFormValues, Utgiftspost } from "../../../types/utgifterFormValues";

const createInitialValues = (response: SaerbidragUtgifterDto): UtgiftFormValues => ({
    beregning: response.beregning,
    avslag: response.avslag ?? "",
    utgifter: response.utgifter.map((v) => ({
        ...v,
        erRedigerbart: false,
    })),
    notat: {
        kunINotat: response.notat?.kunINotat,
    },
});

const getUtgiftType = (kategori: Saerbidragskategori): Utgiftstype | "" => {
    switch (kategori) {
        case Saerbidragskategori.OPTIKK:
            return Utgiftstype.OPTIKK;
        case Saerbidragskategori.TANNREGULERING:
            return Utgiftstype.TANNREGULERING;
        default:
            return "";
    }
};

const Forfallsdato = ({ item, index }: { item: Utgiftspost; index: number }) => {
    const { lesemodus } = useBehandlingProvider();

    return item.erRedigerbart && !lesemodus ? (
        <FormControlledDatePicker
            name={`utgifter.${index}.dato`}
            label={text.label.forfallsdato}
            placeholder="DD.MM.ÅÅÅÅ"
            defaultValue={item["dato"]}
            toDate={new Date()}
            required
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item.dato && DateToDDMMYYYYString(dateOrNull(item.dato))}</div>
    );
};

const UtgiftType = ({ index, item }: { index: number; item: Utgiftspost }) => {
    const { lesemodus } = useBehandlingProvider();
    const behandling = useGetBehandlingV2();
    const { clearErrors } = useFormContext<UtgiftFormValues>();
    const readOnly =
        lesemodus ||
        [Saerbidragskategori.OPTIKK, Saerbidragskategori.TANNREGULERING].includes(behandling.utgift.kategori.kategori);

    const utgifstyperKonfirmasjon = [
        Utgiftstype.KONFIRMASJONSAVGIFT,
        Utgiftstype.KONFIRMASJONSLEIR,
        Utgiftstype.KLAeR,
        Utgiftstype.REISEUTGIFT,
        Utgiftstype.SELSKAP,
    ];

    return item.erRedigerbart && !readOnly ? (
        <FormControlledSelectField
            className="w-fit"
            name={`utgifter.${index}.type`}
            label={text.label.utgift}
            options={[{ value: "", text: text.select.typePlaceholder }].concat(
                utgifstyperKonfirmasjon.map((value) => ({
                    value,
                    text: hentVisningsnavn(value),
                }))
            )}
            hideLabel
            onSelect={() => clearErrors(`utgifter.${index}.type`)}
        />
    ) : (
        <div className="h-8 flex items-center">{hentVisningsnavn(item.type)}</div>
    );
};

const DeleteButton = ({ onRemoveUtgift, index }: { onRemoveUtgift: (index) => void; index: number }) => {
    const { lesemodus } = useBehandlingProvider();

    return index && !lesemodus ? (
        <Button
            type="button"
            onClick={() => onRemoveUtgift(index)}
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
    item,
    onEditRow,
    onSaveRow,
}: {
    item: Utgiftspost;
    index: number;
    onEditRow: (index: number) => void;
    onSaveRow: (index: number) => void;
}) => {
    const { lesemodus } = useBehandlingProvider();

    return (
        <div className="h-8 flex items-center justify-center">
            {!lesemodus && !item.erRedigerbart && (
                <Button
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
            {!lesemodus && item.erRedigerbart && (
                <Button
                    type="button"
                    onClick={() => onSaveRow(index)}
                    icon={<FloppydiskIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            )}
        </div>
    );
};

const Main = () => {
    const behandling = useGetBehandlingV2();
    const { getValues } = useFormContext();
    const erAvslagValgt = getValues("avslag") != "";

    return (
        <>
            <FlexRow className="gap-x-12">
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søknadstype}:</Label>
                    <BodyShort size="small">
                        {capitalize(behandling.stønadstype ?? behandling.engangsbeløptype)}
                    </BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.kategori}:</Label>
                    <BodyShort size="small">{hentVisningsnavn(behandling.utgift.kategori.kategori)}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søknadfra}:</Label>
                    <BodyShort size="small">{SOKNAD_LABELS[behandling.søktAv]}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.mottattdato}:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.mottattdato))}</BodyShort>
                </div>
            </FlexRow>
            <FlexRow>
                <FormControlledSelectField name="avslag" label={text.label.avslagsGrunn} className="w-max">
                    {<option value="">{text.select.avslagPlaceholder}</option>}
                    {AvslagListe.map((value) => (
                        <option key={value} value={value}>
                            {hentVisningsnavnVedtakstype(value, behandling.vedtakstype)}
                        </option>
                    ))}
                </FormControlledSelectField>
            </FlexRow>
            {!erAvslagValgt && (
                <>
                    <Box background="surface-subtle" className="overflow-hidden grid gap-2 py-2 px-4">
                        <FlexRow>
                            <Heading level="2" size="small">
                                {text.title.oversiktOverUtgifter}
                            </Heading>
                        </FlexRow>
                        <UtgifterListe />
                    </Box>
                    <FlexRow>
                        <Label size="small">{text.label.godkjentBeløp}:</Label>
                        <BodyShort size="small">{behandling.utgift.beregning?.totalGodkjentBeløp}</BodyShort>
                    </FlexRow>
                    <hr className="w-full bg-[var(--a-border-divider)] h-px" />
                    <FlexRow>
                        <Heading level="2" size="small">
                            {text.title.betaltAvBp}
                        </Heading>
                    </FlexRow>
                    <FlexRow>
                        <FormControlledTextField
                            name={`beregning.beløpDirekteBetaltAvBp`}
                            label={text.label.direkteBetalt}
                            type="number"
                            min="1"
                            inputMode="numeric"
                        />
                    </FlexRow>
                    <FlexRow>
                        <Label size="small">{text.label.totalt}:</Label>
                        <BodyShort size="small">{behandling.utgift.beregning?.totalBeløpBetaltAvBp}</BodyShort>
                    </FlexRow>
                </>
            )}
        </>
    );
};

const UtgifterListe = () => {
    const { pageErrorsOrUnsavedState, setSaveErrorState, setPageErrorsOrUnsavedState } = useBehandlingProvider();
    const behandling = useGetBehandlingV2();
    const saveUtgifter = useOnSaveUtgifter();
    const { control, clearErrors, formState, getFieldState, getValues, setValue, setError } =
        useFormContext<UtgiftFormValues>();
    const utgifter = useFieldArray({
        control,
        name: "utgifter",
    });
    const watchFieldArray = useWatch({ control, name: "utgifter" });
    const controlledFields = utgifter.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray?.[index],
        };
    });

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            utgifter: {
                error: !ObjectUtils.isEmpty(formState.errors),
                openFields: controlledFields.some((utgift) => utgift.erRedigerbart),
            },
        });
    }, [formState.errors, controlledFields]);

    const addUtgift = (utgift: Utgiftspost) => {
        utgifter.append(utgift);
    };

    const onSaveRow = (index: number) => {
        const utgift = getValues(`utgifter.${index}`);

        const erUtgiftForeldet = isBeforeDate(utgift.dato, deductMonths(dateOrNull(behandling.mottattdato), 12));
        if (utgift?.dato === null) {
            setError(`utgifter.${index}.dato`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }
        if (!utgift?.type) {
            setError(`utgifter.${index}.type`, {
                type: "notValid",
                message: text.error.statusMåFyllesUt,
            });
        }

        if (utgift.godkjentBeløp > utgift.kravbeløp) {
            setError(`utgifter.${index}.godkjentBeløp`, {
                type: "notValid",
                message: text.error.godkjentBeløpKanIkkeVæreHøyereEnnKravbeløp,
            });
        } else {
            clearErrors(`utgifter.${index}.godkjentBeløp`);
        }

        if (utgift.godkjentBeløp != utgift.kravbeløp && ObjectUtils.isEmpty(utgift.begrunnelse) && !erUtgiftForeldet) {
            setError(`utgifter.${index}.begrunnelse`, {
                type: "notValid",
                message: text.error.begrunnelseMåFyllesUt,
            });
        }

        const fieldState = getFieldState(`utgifter.${index}`);

        if (!fieldState.error) {
            updateAndSave(
                {
                    angreSisteEndring: false,
                    nyEllerEndretUtgift: {
                        dato: utgift.dato,
                        type: [Saerbidragskategori.KONFIRMASJON, Saerbidragskategori.ANNET].includes(
                            behandling.utgift.kategori.kategori
                        )
                            ? (utgift.type as Utgiftstype)
                            : undefined,
                        kravbeløp: utgift.kravbeløp,
                        godkjentBeløp: erUtgiftForeldet ? 0 : utgift.godkjentBeløp,
                        begrunnelse: utgift.begrunnelse,
                        betaltAvBp: utgift.betaltAvBp,
                        id: utgift.id ?? undefined,
                    },
                },
                (updatedValue) => {
                    setValue(`utgifter.${index}`, {
                        ...updatedValue,
                        id: updatedValue?.id,
                        erRedigerbart: false,
                    });
                }
            );
        }
    };

    const updateAndSave = (
        payload: OppdatereUtgiftRequest,
        onUpdateSuccess?: (updatedValue: UtgiftspostDto) => void
    ) => {
        saveUtgifter.mutation.mutate(payload, {
            onSuccess: (response) => {
                saveUtgifter.queryClientUpdater((currentData) => {
                    const updatedUtgiftIndex = currentData.utgift.utgifter.findIndex(
                        (utgift) => utgift?.id === response?.oppdatertUtgiftspost?.id
                    );

                    onUpdateSuccess?.(response.oppdatertUtgiftspost);

                    const updatedUtgiftListe =
                        updatedUtgiftIndex === -1
                            ? currentData.utgift.utgifter.concat(response.oppdatertUtgiftspost)
                            : currentData.utgift.utgifter.toSpliced(
                                  updatedUtgiftIndex,
                                  1,
                                  response.oppdatertUtgiftspost
                              );

                    return {
                        ...currentData,
                        utgift: {
                            ...currentData.utgift,
                            beregning: response.beregning,
                            utgifter: updatedUtgiftListe,
                        },
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => updateAndSave(payload),
                    rollbackFn: () => {
                        const oppdaterUtgift = payload.nyEllerEndretUtgift;
                        if (oppdaterUtgift && !oppdaterUtgift.id) {
                            const utgifterListe = getValues(`utgifter`);
                            utgifter.remove(utgifterListe.length - 1);
                        } else {
                            setValue(
                                `utgifter`,
                                behandling.utgift.utgifter.map((u) => ({ ...u, erRedigerbart: false }))
                            );
                        }
                    },
                });
            },
        });
    };

    const onRemoveUtgift = (index: number) => {
        const utgift = getValues(`utgifter.${index}`);

        if (utgift.id) {
            utgifter.remove(index);
            saveUtgifter.mutation.mutate(
                { angreSisteEndring: false, sletteUtgift: utgift.id },
                {
                    onSuccess: (response) => {
                        clearErrors(`utgifter.${index}`);
                        saveUtgifter.queryClientUpdater((currentData) => {
                            const updatedUgiftIndex = currentData.utgift.utgifter.findIndex(
                                (u) => u?.id === response.oppdatertUtgiftspost?.id
                            );
                            const updatedUtgiftListe = currentData.utgift.utgifter.toSpliced(
                                updatedUgiftIndex,
                                1,
                                response.oppdatertUtgiftspost
                            );

                            return {
                                ...currentData,
                                utgift: {
                                    ...currentData.utgift,
                                    utgifter: updatedUtgiftListe,
                                },
                            };
                        });
                    },
                    onError: () => {
                        setSaveErrorState({
                            error: true,
                            retryFn: () => onRemoveUtgift(index),
                            rollbackFn: () => {
                                setValue(
                                    `utgifter`,
                                    behandling.utgift.utgifter.map((u) => ({ ...u, erRedigerbart: false }))
                                );
                            },
                        });
                    },
                }
            );
        } else {
            clearErrors(`utgifter.${index}`);
            utgifter.remove(index);
        }
    };

    const onEditRow = (index: number) => {
        const utgift = getValues(`utgifter.${index}`);
        setValue(`utgifter.${index}`, { ...utgift, erRedigerbart: true });
    };

    const defaultUtgiftType = getUtgiftType(behandling.utgift.kategori.kategori);
    const erKonfirmasjon = behandling.utgift.kategori.kategori === Saerbidragskategori.KONFIRMASJON;

    return (
        <>
            {controlledFields.length > 0 && (
                <div className="overflow-x-auto whitespace-nowrap">
                    <Table size="small" className="table-fixed table bg-white w-fit">
                        <Table.Header>
                            <Table.Row className="align-baseline">
                                {erKonfirmasjon && (
                                    <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[84px]">
                                        {text.label.betaltAvBp}
                                    </Table.HeaderCell>
                                )}
                                <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                    {text.label.forfallsdato}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                    {text.label.utgift}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" className="w-[154px]">
                                    {text.label.kravbeløp}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" className="w-[154px]">
                                    {text.label.godkjentBeløp}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" className="w-[154px]">
                                    {text.label.begrunnelse}
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {controlledFields.map((item, index) => (
                                <Table.Row key={item.id + index}>
                                    {erKonfirmasjon && (
                                        <Table.DataCell>
                                            <div className="h-8 w-full flex items-center justify-center">
                                                <FormControlledCheckbox
                                                    name={`utgifter.${index}.betaltAvBp`}
                                                    legend=""
                                                    onChange={() => onSaveRow(index)}
                                                />
                                            </div>
                                        </Table.DataCell>
                                    )}
                                    <Table.DataCell textSize="small">
                                        <Forfallsdato item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <UtgiftType item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <FormControlledTextField
                                            name={`utgifter.${index}.kravbeløp`}
                                            label={text.label.kravbeløp}
                                            type="number"
                                            min="1"
                                            inputMode="numeric"
                                            hideLabel
                                            editable={item.erRedigerbart}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <FormControlledTextField
                                            name={`utgifter.${index}.godkjentBeløp`}
                                            label={text.label.godkjentBeløp}
                                            type="number"
                                            min="1"
                                            inputMode="numeric"
                                            hideLabel
                                            editable={item.erRedigerbart}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <FormControlledTextField
                                            name={`utgifter.${index}.begrunnelse`}
                                            label={text.label.begrunnelse}
                                            hideLabel
                                            editable={item.erRedigerbart}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <EditOrSaveButton
                                            item={item}
                                            index={index}
                                            onSaveRow={onSaveRow}
                                            onEditRow={onEditRow}
                                        />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <DeleteButton index={index} onRemoveUtgift={onRemoveUtgift} />
                                    </Table.DataCell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            )}

            <LeggTilPeriodeButton
                buttonLabel={texts.label.addUtgifter}
                addPeriode={() => {
                    addUtgift({
                        betaltAvBp: false,
                        dato: null,
                        type: defaultUtgiftType,
                        kravbeløp: 0,
                        godkjentBeløp: 0,
                        begrunnelse: "",
                        erRedigerbart: true,
                    });
                }}
            />
        </>
    );
};

const Side = () => {
    const { onStepChange } = useBehandlingProvider();
    const onNext = () => onStepChange(STEPS[SærligeutgifterStepper.BOFORHOLD]);

    return (
        <>
            <FormControlledTextarea name="notat.kunINotat" label={text.title.begrunnelse} />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const UtgifterForm = () => {
    const { utgift } = useGetBehandlingV2();
    const { pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState } = useBehandlingProvider();
    const initialValues = createInitialValues(utgift);
    const saveUtgifter = useOnSaveUtgifter();
    const { setSaveErrorState } = useBehandlingProvider();
    const useFormMethods = useForm<UtgiftFormValues>({
        defaultValues: initialValues,
    });
    const { setValue, getValues } = useFormMethods;
    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
        });
    }, [useFormMethods.formState.errors]);

    useEffect(() => {
        const subscription = useFormMethods.watch((value, { name, type }) => {
            if (name === undefined || type == undefined) {
                return;
            } else {
                debouncedOnSave(name);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const onSave = (name?: FieldPath<UtgiftFormValues>) => {
        if (name == "beregning.beløpDirekteBetaltAvBp") {
            onSaveBeløpBp();
        }
        if (name == "avslag") {
            onSaveAvslag();
        }
    };

    const debouncedOnSave = useDebounce(onSave);
    const onSaveAvslag = () => {
        const avslag = getValues(`avslag`);

        saveUtgifter.mutation.mutate(
            {
                angreSisteEndring: false,
                avslag: avslag == "" ? null : (avslag as Resultatkode),
            },
            {
                onSuccess: (response) => {
                    saveUtgifter.queryClientUpdater((currentData) => {
                        setValue("utgifter", response.utgiftposter);
                        return {
                            ...currentData,
                            utgift: {
                                ...currentData.utgift,
                                beregning: response.beregning,
                                utgifter: response.utgiftposter.map((u) => ({ ...u, erRedigerbart: false })),
                            },
                        };
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSaveAvslag(),
                        rollbackFn: () => {},
                    });
                },
            }
        );
    };

    const onSaveBeløpBp = () => {
        const beløpBp = getValues(`beregning.beløpDirekteBetaltAvBp`);

        saveUtgifter.mutation.mutate(
            {
                angreSisteEndring: false,
                beløpDirekteBetaltAvBp: beløpBp,
            },
            {
                onSuccess: (response) => {
                    saveUtgifter.queryClientUpdater((currentData) => {
                        setValue("beregning", response.beregning);
                        return {
                            ...currentData,
                            utgift: {
                                ...currentData.utgift,
                                beregning: response.beregning,
                            },
                        };
                    });
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSaveAvslag(),
                        rollbackFn: () => {},
                    });
                },
            }
        );
    };
    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout title={text.label.utgift} main={<Main />} side={<Side />} />
                </form>
            </FormProvider>
        </>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <UtgifterForm />
        </QueryErrorWrapper>
    );
};
