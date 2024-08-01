import {
    OppdatereUtgiftRequest,
    OppdatereUtgiftResponse,
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
import { capitalize, deductDays, ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Button, Heading, Label, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString, deductMonths, isBeforeDate } from "@utils/date-utils";
import React, { useEffect, useRef } from "react";
import { FieldPath, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import useFeatureToogle from "../../../../common/hooks/useFeatureToggle";
import { AvslagListe } from "../../../constants/avslag";
import { STEPS } from "../../../constants/steps";
import { SærligeutgifterStepper } from "../../../enum/SærligeutgifterStepper";
import { useOnSaveUtgifter } from "../../../hooks/useOnSaveUtgifter";
import { UtgiftFormValues, Utgiftspost } from "../../../types/utgifterFormValues";

const createInitialValues = (response: SaerbidragUtgifterDto): UtgiftFormValues => ({
    beregning: response.beregning,
    avslag: response.avslag ?? "",
    utgifter: mapUtgifter(response.utgifter),
    notat: {
        kunINotat: response.notat?.kunINotat,
    },
});

const mapUtgifter = (utgifter: UtgiftspostDto[]): UtgiftspostDto[] => {
    return utgifter.map((v) => ({
        ...v,
        erRedigerbart: false,
    }));
};

const erUtgiftForeldet = (mottatDato: string, utgiftDato: string): boolean =>
    utgiftDato && isBeforeDate(utgiftDato, deductMonths(dateOrNull(mottatDato), 12));
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
            toDate={deductDays(new Date(), 1)}
            required
            hideLabel
        />
    ) : (
        <div className="h-8 flex items-center">{item.dato && DateToDDMMYYYYString(dateOrNull(item.dato))}</div>
    );
};

const GodkjentBeløp = ({ item, index }: { item: Utgiftspost; index: number }) => {
    const behandling = useGetBehandlingV2();

    if (erUtgiftForeldet(behandling.mottattdato, item.dato)) {
        return <div className="h-8 flex items-center">0</div>;
    }
    return (
        <FormControlledTextField
            name={`utgifter.${index}.godkjentBeløp`}
            label={text.label.godkjentBeløp}
            type="number"
            min="0"
            inputMode="numeric"
            hideLabel
            editable={item.erRedigerbart}
        />
    );
};

const Begrunnelse = ({ item, index }: { item: Utgiftspost; index: number }) => {
    const behandling = useGetBehandlingV2();

    if (erUtgiftForeldet(behandling.mottattdato, item.dato)) {
        return <div className="flex items-center">{text.label.begrunnelseUtgiftErForeldet}</div>;
    }
    return (
        <FormControlledTextField
            name={`utgifter.${index}.begrunnelse`}
            label={text.label.begrunnelse}
            hideLabel
            editable={item.erRedigerbart}
        />
    );
};

const UtgiftType = ({ index, item }: { index: number; item: Utgiftspost }) => {
    const { lesemodus } = useBehandlingProvider();
    const behandling = useGetBehandlingV2();
    const { clearErrors } = useFormContext<UtgiftFormValues>();
    const readOnly =
        lesemodus ||
        [Saerbidragskategori.OPTIKK, Saerbidragskategori.TANNREGULERING].includes(behandling.utgift.kategori.kategori);

    const erKategoriAnnet = [Saerbidragskategori.ANNET].includes(behandling.utgift.kategori.kategori);
    const utgifstyperKonfirmasjon = [
        Utgiftstype.KONFIRMASJONSAVGIFT,
        Utgiftstype.KONFIRMASJONSLEIR,
        Utgiftstype.KLAeR,
        Utgiftstype.REISEUTGIFT,
        Utgiftstype.SELSKAP,
    ];

    if (readOnly || !item.erRedigerbart) {
        return <div className="h-8 flex items-center">{erKategoriAnnet ? item.type : hentVisningsnavn(item.type)}</div>;
    }
    if (erKategoriAnnet) {
        return (
            <FormControlledTextField
                name={`utgifter.${index}.type`}
                label={text.label.utgift}
                type="text"
                inputMode="text"
                hideLabel
            />
        );
    }
    return (
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
    );
};

const DeleteButton = ({ onRemoveUtgift, index }: { onRemoveUtgift: (index) => void; index: number }) => {
    const { lesemodus } = useBehandlingProvider();

    return !lesemodus ? (
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
    const erAvslagValgt = getValues("avslag") !== "";
    const { isSærbidragBetaltAvBpEnabled } = useFeatureToogle();
    const visBetaltAvBpValg =
        behandling.utgift.kategori.kategori === Saerbidragskategori.KONFIRMASJON && isSærbidragBetaltAvBpEnabled;
    return (
        <>
            <FlexRow className="gap-x-12">
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søknadstype}:</Label>
                    <BodyShort size="small">
                        {capitalize(behandling.stønadstype ?? behandling.engangsbeløptype)}
                    </BodyShort>
                </div>
                {behandling.utgift.kategori.kategori !== Saerbidragskategori.ANNET && (
                    <div className="flex gap-x-2">
                        <Label size="small">{text.label.kategori}:</Label>
                        <BodyShort size="small">{hentVisningsnavn(behandling.utgift.kategori.kategori)}</BodyShort>
                    </div>
                )}
                {behandling.utgift.kategori.kategori === Saerbidragskategori.ANNET && (
                    <div className="flex gap-x-2">
                        <Label size="small">{text.label.kategori}:</Label>
                        <BodyShort size="small">
                            {hentVisningsnavn(behandling.utgift.kategori.kategori) +
                                ": " +
                                behandling.utgift?.kategori?.beskrivelse}
                        </BodyShort>
                    </div>
                )}
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
                        <UtgifterListe visBetaltAvBpValg={visBetaltAvBpValg} />
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
                    {visBetaltAvBpValg && (
                        <FlexRow>
                            <Label size="small">{text.label.totalt}:</Label>
                            <BodyShort size="small">{behandling.utgift.beregning?.totalBeløpBetaltAvBp}</BodyShort>
                        </FlexRow>
                    )}
                </>
            )}
        </>
    );
};

const UtgifterListe = ({ visBetaltAvBpValg }: { visBetaltAvBpValg: boolean }) => {
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
        const utgiftErForeldet = erUtgiftForeldet(behandling.mottattdato, utgift.dato);

        if (utgift?.dato === null) {
            setError(`utgifter.${index}.dato`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }
        if (!utgift?.type) {
            setError(`utgifter.${index}.type`, {
                type: "notValid",
                message: text.error.utgiftstypeMåFyllesUt,
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

        if (utgift.godkjentBeløp !== utgift.kravbeløp && ObjectUtils.isEmpty(utgift.begrunnelse) && !utgiftErForeldet) {
            setError(`utgifter.${index}.begrunnelse`, {
                type: "notValid",
                message: text.error.begrunnelseMåFyllesUt,
            });
        } else {
            clearErrors(`utgifter.${index}.begrunnelse`);
        }

        const fieldState = getFieldState(`utgifter.${index}`);

        if (!fieldState.error) {
            updateAndSave(
                {
                    nyEllerEndretUtgift: {
                        dato: utgift.dato,
                        type: [Saerbidragskategori.KONFIRMASJON, Saerbidragskategori.ANNET].includes(
                            behandling.utgift.kategori.kategori
                        )
                            ? (utgift.type as Utgiftstype)
                            : undefined,
                        kravbeløp: utgift.kravbeløp,
                        godkjentBeløp: utgiftErForeldet ? 0 : utgift.godkjentBeløp,
                        begrunnelse: utgift.begrunnelse,
                        betaltAvBp: utgift.betaltAvBp,
                        id: utgift.id ?? undefined,
                    },
                },
                (updatedValue, oppdatertUtgiftspost) => {
                    const eksisterendeUtgifter = getValues(`utgifter`);
                    setValue(
                        `utgifter`,
                        updatedValue.map((v) => ({
                            ...v,
                            erRedigerbart:
                                oppdatertUtgiftspost.id === v.id
                                    ? false
                                    : eksisterendeUtgifter.find((eu) => eu.id === v.id)?.erRedigerbart ?? false,
                        }))
                    );
                }
            );
        }
    };

    const updateAndSave = (
        payload: OppdatereUtgiftRequest,
        onUpdateSuccess?: (updatedValue: UtgiftspostDto[], oppdatertUtgiftspost?: UtgiftspostDto) => void
    ) => {
        saveUtgifter.mutation.mutate(payload, {
            onSuccess: (response) => {
                saveUtgifter.queryClientUpdater((currentData) => {
                    const updatedUtgiftIndex = currentData.utgift.utgifter.findIndex(
                        (utgift) => utgift?.id === response?.oppdatertUtgiftspost?.id
                    );

                    onUpdateSuccess?.(response.utgiftposter, response.oppdatertUtgiftspost);

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
                            valideringsfeil: response.valideringsfeil,
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
                            setValue(`utgifter`, mapUtgifter(behandling.utgift.utgifter));
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
                { sletteUtgift: utgift.id },
                {
                    onSuccess: (response) => {
                        clearErrors(`utgifter.${index}`);
                        saveUtgifter.queryClientUpdater((currentData) => ({
                            ...currentData,
                            utgift: {
                                ...currentData.utgift,
                                beregning: response.beregning,
                                utgifter: response.utgiftposter,
                                valideringsfeil: response.valideringsfeil,
                            },
                        }));
                    },
                    onError: () => {
                        setSaveErrorState({
                            error: true,
                            retryFn: () => onRemoveUtgift(index),
                            rollbackFn: () => {
                                setValue(`utgifter`, mapUtgifter(behandling.utgift.utgifter));
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

    return (
        <>
            {controlledFields.length > 0 && (
                <div className="overflow-x-auto whitespace-nowrap">
                    <Table size="small" className="table-fixed table bg-white w-fit">
                        <Table.Header>
                            <Table.Row className="align-baseline">
                                {visBetaltAvBpValg && (
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
                                <Table.Row key={item.id + "-" + index} className="align-top">
                                    {visBetaltAvBpValg && (
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
                                        <GodkjentBeløp item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <Begrunnelse item={item} index={index} />
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
    const {
        utgift: { avslag },
    } = useGetBehandlingV2();
    const onNext = () =>
        onStepChange(
            avslag === undefined ? STEPS[SærligeutgifterStepper.INNTEKT] : STEPS[SærligeutgifterStepper.VEDTAK]
        );

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
    const prevState = useRef<UtgiftFormValues>(initialValues);

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
            if (name === undefined || type === undefined) {
                return;
            } else {
                debouncedOnSave(name);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const onSave = (_name?: FieldPath<UtgiftFormValues>) => {
        const name = _name.toString();
        if (name === "beregning.beløpDirekteBetaltAvBp") {
            const beløpBp = getValues(`beregning.beløpDirekteBetaltAvBp`);
            updateAndSave(
                {
                    beløpDirekteBetaltAvBp: beløpBp,
                },
                (response) => setValue("beregning", response.beregning)
            );
        } else if (name === "avslag") {
            const avslag = getValues(`avslag`);
            updateAndSave(
                {
                    avslag: avslag === "" ? null : (avslag as Resultatkode),
                },
                (response) => setValue("utgifter", mapUtgifter(response.utgiftposter))
            );
        } else if (name === "notat.kunINotat") {
            updateAndSave({
                notat: {
                    kunINotat: getValues(`notat.kunINotat`),
                },
            });
        }
    };

    const debouncedOnSave = useDebounce(onSave);

    const updateAndSave = (
        payload: OppdatereUtgiftRequest,
        onSuccess?: (response: OppdatereUtgiftResponse) => void
    ) => {
        saveUtgifter.mutation.mutate(payload, {
            onSuccess: (response) => {
                saveUtgifter.queryClientUpdater((currentData) => {
                    onSuccess?.(response);
                    prevState.current = JSON.parse(JSON.stringify(getValues()));
                    return {
                        ...currentData,
                        utgift: {
                            ...currentData.utgift,
                            avslag: response.avslag,
                            beregning: response.beregning,
                            notat: response.notat,
                            valideringsfeil: response.valideringsfeil,
                            utgifter: mapUtgifter(response.utgiftposter),
                        },
                    };
                });
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => updateAndSave(payload),
                    rollbackFn: () => {
                        useFormMethods.reset(prevState.current);
                    },
                });
            },
        });
    };

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form>
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
