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
import { FormControlledSwitch } from "@common/components/formFields/FormControlledSwitch";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { FormControlledTextField } from "@common/components/formFields/FormControlledTextField";
import LeggTilPeriodeButton from "@common/components/formFields/FormLeggTilPeriode";
import { FlexRow } from "@common/components/layout/grid/FlexRow";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { OverlayLoader } from "@common/components/OverlayLoader";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { SOKNAD_LABELS } from "@common/constants/soknadFraLabels";
import text from "@common/constants/texts";
import texts from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { actionOnEnter } from "@common/helpers/keyboardHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import useFeatureToogle from "@common/hooks/useFeatureToggle";
import { hentVisningsnavn, hentVisningsnavnVedtakstype } from "@common/hooks/useVisningsnavn";
import { FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { deductDays, ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyLong, BodyShort, Box, Button, Checkbox, Heading, HStack, Label, Table } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYString, deductMonths, isBeforeDate } from "@utils/date-utils";
import { formatterBeløp } from "@utils/number-utils";
import React, { useEffect, useRef } from "react";
import { FieldPath, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { CustomTextareaEditor } from "../../../../common/components/CustomEditor";
import elementIds from "../../../../common/constants/elementIds";
import { AvslagListe, AvslagListeEtterUtgifterErUtfylt } from "../../../constants/avslag";
import { STEPS } from "../../../constants/steps";
import { SærligeutgifterStepper } from "../../../enum/SærligeutgifterStepper";
import { useOnSaveUtgifter } from "../../../hooks/useOnSaveUtgifter";
import { UtgiftFormValues, Utgiftspost } from "../../../types/utgifterFormValues";

const createInitialValues = (response: SaerbidragUtgifterDto): UtgiftFormValues => ({
    beregning: response.beregning,
    avslag: response.avslag ?? "",
    utgifter: mapUtgifter(response.utgifter),
    begrunnelse: response.begrunnelse.innhold,
    maksGodkjentBeløp: response.maksGodkjentBeløp?.beløp,
    maksGodkjentBeløpBegrunnelse: response.maksGodkjentBeløp?.begrunnelse,
    maksGodkjentBeløpTaMed: response.maksGodkjentBeløp?.taMed,
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
    return item.erRedigerbart ? (
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
const Kravbeløp = ({ item, index }: { item: Utgiftspost; index: number }) => {
    return (
        <FormControlledTextField
            name={`utgifter.${index}.kravbeløp`}
            label={text.label.kravbeløp}
            type="number"
            min="1"
            inputMode="decimal"
            step="0.01"
            hideLabel
            editable={item.erRedigerbart}
        />
    );
};

const GodkjentBeløp = ({ item, index }: { item: Utgiftspost; index: number }) => {
    const behandling = useGetBehandlingV2();

    if (erUtgiftForeldet(behandling.mottattdato, item.dato)) {
        return <div className="h-8 flex items-center justify-end">0</div>;
    }
    return (
        <FormControlledTextField
            name={`utgifter.${index}.godkjentBeløp`}
            label={text.label.godkjentBeløp}
            type="number"
            min="0"
            inputMode="decimal"
            step="0.01"
            hideLabel
            editable={item.erRedigerbart}
        />
    );
};

const Kommentar = ({ item, index }: { item: Utgiftspost; index: number }) => {
    return item.erRedigerbart ? (
        <FormControlledTextarea
            name={`utgifter.${index}.kommentar`}
            label={text.label.kommentar}
            minRows={1}
            hideLabel
        />
    ) : (
        <div className="min-h-8 flex items-center">
            <BodyLong size="small">{item.kommentar}</BodyLong>
        </div>
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
        return (
            <div className="h-8 flex items-center">{item.utgiftstypeVisningsnavn ?? hentVisningsnavn(item.type)}</div>
        );
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
    const { isbehandlingVesntremenyEnabled } = useFeatureToogle();
    const { getValues } = useFormContext<UtgiftFormValues>();
    const [avslag, erMaksBeløpMed] = getValues(["avslag", "maksGodkjentBeløpTaMed"]);
    const erAvslagValgt =
        avslag !== "" && avslag !== undefined && avslag !== null && !AvslagListeEtterUtgifterErUtfylt.includes(avslag);
    const erAvslagSomInneholderUtgifter =
        avslag !== "" && avslag !== undefined && avslag !== null && AvslagListeEtterUtgifterErUtfylt.includes(avslag);
    const erKonfirmasjon = behandling.utgift.kategori.kategori === Saerbidragskategori.KONFIRMASJON;

    return (
        <>
            <FlexRow className="gap-x-12">
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søknadstype}:</Label>
                    <BodyShort size="small">{behandling.vedtakstypeVisningsnavn}</BodyShort>
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
                {behandling.klageMottattdato && (
                    <div className="flex gap-x-2">
                        <Label size="small">{text.label.klageMottattdato}:</Label>
                        <BodyShort size="small">
                            {DateToDDMMYYYYString(new Date(behandling.klageMottattdato))}
                        </BodyShort>
                    </div>
                )}
            </FlexRow>

            <FlexRow>
                <FormControlledSelectField name="avslag" label={text.label.avslagsGrunn} className="w-max">
                    {!erAvslagSomInneholderUtgifter && <option value="">{text.select.avslagPlaceholder}</option>}
                    {AvslagListe.map((value) => (
                        <option key={value} value={value}>
                            {hentVisningsnavnVedtakstype(value, behandling.vedtakstype)}
                        </option>
                    ))}
                    {erAvslagSomInneholderUtgifter &&
                        AvslagListeEtterUtgifterErUtfylt.map((value) => (
                            <option key={value} value={value} disabled>
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
                    <BeregnetUtgifter />
                    {isbehandlingVesntremenyEnabled && erKonfirmasjon && behandling.utgift.utgifter.length > 0 && (
                        <>
                            <FlexRow>
                                <FormControlledSwitch
                                    name="maksGodkjentBeløpTaMed"
                                    legend={text.label.godkjentBeløpSkalSkjønsjusteres}
                                />
                            </FlexRow>
                            {erMaksBeløpMed && (
                                <HStack gap="2" align="start">
                                    <FormControlledTextField
                                        name={`maksGodkjentBeløp`}
                                        label={text.label.godkjentBeløpSkalSkjønsjusteres}
                                        type="number"
                                        min="1"
                                        inputMode="decimal"
                                        step="0.01"
                                    />
                                    <FormControlledTextarea
                                        name={`maksGodkjentBeløpBegrunnelse`}
                                        label={text.label.begrunnelse}
                                        className="w-[350px]"
                                        minRows={1}
                                    />
                                </HStack>
                            )}
                            <hr className="w-full bg-[var(--a-border-divider)] h-px" />
                        </>
                    )}
                    <FlexRow>
                        <FormControlledTextField
                            name={`beregning.beløpDirekteBetaltAvBp`}
                            label={text.label.direkteBetaltAvBP}
                            type="number"
                            min="1"
                            inputMode="numeric"
                        />
                    </FlexRow>
                </>
            )}
        </>
    );
};

const UtgifterListe = () => {
    const { setSaveErrorState, setPageErrorsOrUnsavedState } = useBehandlingProvider();
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
        setPageErrorsOrUnsavedState((prevState) => ({
            ...prevState,
            utgifter: {
                error: !ObjectUtils.isEmpty(formState.errors),
                openFields: { utgifterList: controlledFields.some((utgift) => utgift.erRedigerbart) },
            },
        }));
    }, [formState.errors, JSON.stringify(controlledFields)]);

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

        if (!utgiftErForeldet && utgift.kravbeløp <= 0) {
            setError(`utgifter.${index}.kravbeløp`, {
                type: "notValid",
                message: text.error.kravbeløpMinVerdi,
            });
        } else {
            clearErrors(`utgifter.${index}.kravbeløp`);
        }

        if (Number(utgift.godkjentBeløp) > Number(utgift.kravbeløp)) {
            setError(`utgifter.${index}.godkjentBeløp`, {
                type: "notValid",
                message: text.error.godkjentBeløpKanIkkeVæreHøyereEnnKravbeløp,
            });
        } else {
            clearErrors(`utgifter.${index}.godkjentBeløp`);
        }

        if (
            utgift.godkjentBeløp !== utgift.kravbeløp &&
            ObjectUtils.isEmpty(utgift.kommentar.trim()) &&
            !utgiftErForeldet
        ) {
            setError(`utgifter.${index}.kommentar`, {
                type: "notValid",
                message: text.error.begrunnelseMåFyllesUt,
            });
        } else {
            clearErrors(`utgifter.${index}.kommentar`);
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
                        kravbeløp: Number(utgift.kravbeløp),
                        godkjentBeløp: utgiftErForeldet ? 0 : Number(utgift.godkjentBeløp),
                        kommentar: utgift.kommentar,
                        betaltAvBp: utgift.betaltAvBp,
                        id: utgift.id ?? undefined,
                    },
                },
                (response) => {
                    const eksisterendeUtgifter = getValues(`utgifter`);
                    setValue(`utgifter`, [
                        ...response.utgiftposter.map((v) => ({
                            ...v,
                            erRedigerbart:
                                response.oppdatertUtgiftspost.id === v.id
                                    ? false
                                    : (eksisterendeUtgifter.find((eu) => eu.id === v.id)?.erRedigerbart ?? false),
                        })),
                        ...eksisterendeUtgifter.filter((v, i) => v.id === undefined && i !== index),
                    ]);
                }
            );
        }
    };

    const updateAndSave = (
        payload: OppdatereUtgiftRequest,
        onUpdateSuccess?: (response: OppdatereUtgiftResponse) => void
    ) => {
        saveUtgifter.mutation.mutate(payload, {
            onSuccess: (response) => {
                saveUtgifter.queryClientUpdater((currentData) => {
                    const updatedUtgiftIndex = currentData.utgift.utgifter.findIndex(
                        (utgift) => utgift?.id === response?.oppdatertUtgiftspost?.id
                    );

                    onUpdateSuccess?.(response);

                    const updatedUtgiftListe =
                        updatedUtgiftIndex === -1
                            ? currentData.utgift.utgifter.concat(response.oppdatertUtgiftspost)
                            : currentData.utgift.utgifter.toSpliced(
                                  updatedUtgiftIndex,
                                  1,
                                  response.oppdatertUtgiftspost
                              );

                    setValue(`avslag`, response.avslag ?? undefined);
                    return {
                        ...currentData,
                        utgift: {
                            ...currentData.utgift,
                            avslag: response.avslag,
                            beregning: response.beregning,
                            utgifter: updatedUtgiftListe,
                            valideringsfeil: response.valideringsfeil,
                            totalBeregning: response.totalBeregning,
                            maksGodkjentBeløp: response.maksGodkjentBeløp,
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
                        setValue(`avslag`, response.avslag ?? undefined);
                        saveUtgifter.queryClientUpdater((currentData) => ({
                            ...currentData,
                            utgift: {
                                ...currentData.utgift,
                                avslag: response.avslag,
                                beregning: response.beregning,
                                valideringsfeil: response.valideringsfeil,
                                totalBeregning: response.totalBeregning,
                                maksGodkjentBeløp: response.maksGodkjentBeløp,
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
                <div
                    className={`${
                        saveUtgifter.mutation.isPending ? "relative" : "inherit"
                    } block overflow-x-auto whitespace-nowrap`}
                    data-section={elementIds.seksjon_perioder}
                >
                    <OverlayLoader loading={saveUtgifter.mutation.isPending} />
                    <Table size="small" className="table-fixed table bg-white w-full">
                        <Table.Header>
                            <Table.Row className="align-baseline">
                                <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                    {text.label.betaltAvBp}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[124px]">
                                    {text.label.forfallsdato}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[148px]">
                                    {text.label.utgift}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[134px]">
                                    {text.label.kravbeløp}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[134px]">
                                    {text.label.godkjentBeløp}
                                </Table.HeaderCell>
                                <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[218px]">
                                    {text.label.kommentar}
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {controlledFields.map((item, index) => (
                                <Table.Row
                                    key={item.id + "-" + index}
                                    className="align-top"
                                    onKeyDown={actionOnEnter(() => {
                                        onSaveRow(index);
                                    })}
                                >
                                    <Table.DataCell>
                                        <div className="h-8 w-full flex items-center justify-center">
                                            <FormControlledCheckbox
                                                name={`utgifter.${index}.betaltAvBp`}
                                                legend=""
                                                onChange={() => onSaveRow(index)}
                                            />
                                        </div>
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <Forfallsdato item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <UtgiftType item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <Kravbeløp item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <GodkjentBeløp item={item} index={index} />
                                    </Table.DataCell>
                                    <Table.DataCell textSize="small">
                                        <Kommentar item={item} index={index} />
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
                        kommentar: "",
                        erRedigerbart: true,
                    });
                }}
            />
        </>
    );
};

const BeregnetUtgifter = () => {
    const {
        utgift: { beregning, totalBeregning },
    } = useGetBehandlingV2();

    if (!totalBeregning.length) return null;

    return (
        <Box background="surface-subtle" className="overflow-hidden grid gap-2 py-2 px-4">
            <FlexRow>
                <Heading level="2" size="small">
                    {text.title.beregnetTotalt}
                </Heading>
            </FlexRow>
            <div className="overflow-x-auto whitespace-nowrap">
                <Table size="small" className="table-fixed table bg-white w-full">
                    <Table.Header>
                        <Table.Row className="align-baseline">
                            <Table.HeaderCell textSize="small" scope="col" align="center" className="w-[74px]">
                                {text.label.betaltAvBp}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="left" className="min-w-[148px]">
                                {text.label.utgiftskategori}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[134px]">
                                {text.label.kravbeløp}
                            </Table.HeaderCell>
                            <Table.HeaderCell textSize="small" scope="col" align="right" className="w-[134px]">
                                {text.label.godkjentBeløp}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {totalBeregning.map((item, index) => (
                            <Table.Row key={item.utgiftstype + "-" + index} className="align-middle">
                                <Table.DataCell textSize="small">
                                    <div className="h-8 w-full flex items-center justify-center">
                                        {item.betaltAvBp && (
                                            <Checkbox checked={true} size="small" readOnly={true} hideLabel>
                                                Betalt av BP
                                            </Checkbox>
                                        )}
                                    </div>
                                </Table.DataCell>
                                <Table.DataCell textSize="small">{item.utgiftstypeVisningsnavn}</Table.DataCell>
                                <Table.DataCell textSize="small" align="right">
                                    {formatterBeløp(item.totalKravbeløp)}
                                </Table.DataCell>
                                <Table.DataCell textSize="small" align="right">
                                    {formatterBeløp(item.totalGodkjentBeløp)}
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
                <div className="grid grid-cols-[auto,134px,134px] w-full my-2 pl-2 pr-2">
                    <Label size="small">{text.label.totalt}</Label>
                    <Label size="small" className=" grid justify-end">
                        {formatterBeløp(beregning?.totalKravbeløp)}
                    </Label>
                    <Label size="small" className="grid justify-end">
                        {formatterBeløp(beregning?.totalGodkjentBeløp)}
                    </Label>
                </div>
            </div>
        </Box>
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
            <CustomTextareaEditor name="begrunnelse" label={text.title.begrunnelse} resize />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const UtgifterForm = () => {
    const { utgift } = useGetBehandlingV2();
    const initialValues = createInitialValues(utgift);
    const saveUtgifter = useOnSaveUtgifter();
    const prevState = useRef<UtgiftFormValues>(initialValues);

    const { setSaveErrorState } = useBehandlingProvider();
    const useFormMethods = useForm<UtgiftFormValues>({
        defaultValues: initialValues,
    });
    const { setValue, getValues } = useFormMethods;

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
                (response) => {
                    setValue("avslag", response.avslag ?? null);
                    setValue("utgifter", mapUtgifter(response.utgiftposter));
                }
            );
        } else if (name === "begrunnelse") {
            const begrunnelse = getValues(`begrunnelse`);
            updateAndSave({
                oppdatereBegrunnelse: {
                    nyBegrunnelse: begrunnelse,
                },
            });
        } else if (["maksGodkjentBeløp", "maksGodkjentBeløpBegrunnelse", "maksGodkjentBeløpTaMed"].includes(name)) {
            const [maksGodkjentBeløp, maksGodkjentBeløpBegrunnelse, maksGodkjentBeløpTaMed] = getValues([
                "maksGodkjentBeløp",
                "maksGodkjentBeløpBegrunnelse",
                "maksGodkjentBeløpTaMed",
            ]);
            updateAndSave(
                {
                    maksGodkjentBeløp: {
                        taMed: maksGodkjentBeløpTaMed,
                        beløp: maksGodkjentBeløp,
                        begrunnelse: maksGodkjentBeløpBegrunnelse,
                    },
                },
                (response) => setValue(`avslag`, response.avslag ?? null)
            );
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
                            begrunnelse: { innhold: response.begrunnelse, kunINotat: response.begrunnelse },
                            valideringsfeil: response.valideringsfeil,
                            utgifter: mapUtgifter(response.utgiftposter),
                            maksGodkjentBeløp: response.maksGodkjentBeløp,
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
                    <NewFormLayout title={text.title.utgift} main={<Main />} side={<Side />} />
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
