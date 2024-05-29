import { ArrowUndoIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { firstDayOfMonth, isValidDate, ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Button, Heading, Radio, RadioGroup, Search, Table, TextField, VStack } from "@navikt/ds-react";
import React, { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useFieldArray, UseFieldArrayReturn, useForm, useFormContext, useWatch } from "react-hook-form";

import {
    Bostatuskode,
    HusstandsbarnDtoV2,
    HusstandsbarnperiodeDto,
    Kilde,
    OppdatereBoforholdRequestV2,
} from "../../../api/BidragBehandlingApiV1";
import { Rolletype } from "../../../api/BidragDokumentProduksjonApi";
import { PersonDto } from "../../../api/PersonApi";
import { PERSON_API } from "../../../constants/api";
import elementIds from "../../../constants/elementIds";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetBehandlingV2, useGrunnlag, useSivilstandOpplysningerProssesert } from "../../../hooks/useApiData";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues } from "../../../types/boforholdFormValues";
import {
    addMonths,
    dateOrNull,
    DateToDDMMYYYYString,
    isAfterDate,
    isAfterEqualsDate,
    toISODateString,
} from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { scrollToHash } from "../../../utils/window-utils";
import { DatePickerInput } from "../../date-picker/DatePickerInput";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { ForskuddAlert } from "../../ForskuddAlert";
import { FlexRow } from "../../layout/grid/FlexRow";
import { FormLayout } from "../../layout/grid/FormLayout";
import { ConfirmationModal } from "../../modal/ConfirmationModal";
import { OverlayLoader } from "../../OverlayLoader";
import { PersonNavn } from "../../PersonNavn";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import StatefulAlert from "../../StatefulAlert";
import {
    boforholdForskuddOptions,
    boststatusOver18År,
    createInitialValues,
    getEitherFirstDayOfFoedselsOrVirkingsdatoMonth,
    getFirstDayOfMonthAfterEighteenYears,
    isOver18YearsOld,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { KildeIcon } from "../inntekt/InntektTable";
import { BoforholdOpplysninger, NyOpplysningerAlert } from "./BoforholdOpplysninger";
import { Notat } from "./Notat";
import { Sivilstand } from "./Sivilstand";

const DeleteButton = ({
    onRemovePeriode,
    barn,
    index,
}: {
    onRemovePeriode: (index) => void;
    barn: HusstandsbarnDtoV2;
    index: number;
}) => {
    const { lesemodus } = useForskudd();
    const barnIsOver18 = isOver18YearsOld(barn.fødselsdato);
    const firstOver18PeriodIndex = barn.perioder.findIndex((period) => boststatusOver18År.includes(period.bostatus));
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
    barn,
    item,
}: {
    editableRow: boolean;
    fieldName: `husstandsbarn.${number}.perioder.${number}`;
    barn: HusstandsbarnDtoV2;
    item: HusstandsbarnperiodeDto;
}) => {
    const { clearErrors } = useFormContext<BoforholdFormValues>();
    const bosstatusToVisningsnavn = (bostsatus: Bostatuskode): string => {
        const visningsnavn = hentVisningsnavn(bostsatus);
        if (boststatusOver18År.includes(bostsatus)) {
            return `18 ${text.år}: ${visningsnavn}`;
        }
        return visningsnavn;
    };

    const boforholdOptions = isOver18YearsOld(barn.fødselsdato)
        ? boforholdForskuddOptions.likEllerOver18År
        : boforholdForskuddOptions.under18År;

    return editableRow ? (
        <FormControlledSelectField
            name={`${fieldName}.bostatus`}
            className="w-fit"
            label={text.label.status}
            options={boforholdOptions.map((value) => ({
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

const Periode = ({
    editableRow,
    item,
    field,
    fieldName,
    barn,
    label,
}: {
    editableRow: boolean;
    item: HusstandsbarnperiodeDto;
    fieldName: `husstandsbarn.${number}.perioder.${number}`;
    field: "datoFom" | "datoTom";
    barn: HusstandsbarnDtoV2;
    label: string;
}) => {
    const virkningsOrSoktFraDato = useVirkningsdato();
    const { getValues, clearErrors, setError } = useFormContext<BoforholdFormValues>();
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(barn.fødselsdato, virkningsOrSoktFraDato);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFra);
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

    return editableRow ? (
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

const Main = () => {
    useEffect(scrollToHash, []);

    return (
        <>
            <NyOpplysningerAlert />
            <Heading level="2" size="small">
                {text.label.barn}
            </Heading>
            <BarnPerioder />
            <Sivilstand />
        </>
    );
};

const BoforholdsForm = () => {
    // Behold dette for debugging i prod
    useGrunnlag();
    const { boforhold, roller } = useGetBehandlingV2();
    const virkningsOrSoktFraDato = useVirkningsdato();
    const sivilstandProssesert = useSivilstandOpplysningerProssesert();
    const barnMedISaken = useMemo(() => roller.filter((rolle) => rolle.rolletype === Rolletype.BA), [roller]);
    const initialValues = useMemo(
        () => createInitialValues(boforhold, sivilstandProssesert.sivilstandListe),
        [boforhold, sivilstandProssesert, virkningsOrSoktFraDato, barnMedISaken]
    );

    const useFormMethods = useForm({
        defaultValues: initialValues,
        criteriaMode: "all",
    });

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <FormLayout title={text.title.boforhold} main={<Main />} side={<Notat />} />
                </form>
            </FormProvider>
        </>
    );
};

const AddBarnForm = ({
    datoFom,
    setOpenAddBarnForm,
    barnFieldArray,
}: {
    datoFom: Date;
    setOpenAddBarnForm: Dispatch<SetStateAction<boolean>>;
    barnFieldArray: UseFieldArrayReturn<BoforholdFormValues, "husstandsbarn">;
}) => {
    const { getValues } = useFormContext<BoforholdFormValues>();
    const { setPageErrorsOrUnsavedState, pageErrorsOrUnsavedState } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [val, setVal] = useState("dnummer");
    const [ident, setIdent] = useState("");
    const [foedselsdato, setFoedselsdato] = useState(null);
    const [navn, setNavn] = useState("");
    const [person, setPerson] = useState<PersonDto>(null);
    const [error, setError] = useState(null);

    const validateForm = () => {
        let formErrors = { ...error };

        if (navn === "") {
            formErrors = { ...formErrors, navn: text.error.navnMåFyllesUt };
        } else {
            delete formErrors.navn;
        }

        if (val === "fritekst") {
            if (!isValidDate(foedselsdato)) {
                formErrors = { ...formErrors, foedselsdato: text.error.datoIkkeGyldig };
            } else {
                delete formErrors.foedselsdato;
            }
        }

        if (val === "dnummer") {
            if (ident === "") {
                formErrors = { ...formErrors, ident: text.error.identMåFyllesUt };
            } else {
                delete formErrors.ident;
            }
        }
        return formErrors;
    };

    const onSaveAddedBarn = () => {
        const formErrors = validateForm();

        if (Object.keys(formErrors).length) {
            setError(formErrors);
            return;
        }

        const fd = val === "dnummer" ? person.fødselsdato : toISODateString(foedselsdato);

        const addedBarn: HusstandsbarnDtoV2 = {
            ident: val === "dnummer" ? ident : "",
            medIBehandling: false,
            navn: navn,
            fødselsdato: fd,
            kilde: Kilde.MANUELL,
            perioder: [
                {
                    datoFom: isAfterDate(fd, datoFom)
                        ? toISODateString(firstDayOfMonth(new Date(fd)))
                        : toISODateString(datoFom),
                    datoTom: null,
                    bostatus: Bostatuskode.MED_FORELDER,
                    kilde: Kilde.MANUELL,
                },
            ],
        };
        const indexOfFirstOlderChild = getValues("husstandsbarn").findIndex(
            (barn) =>
                !barn.medIBehandling && new Date(barn.fødselsdato).getTime() < new Date(addedBarn.fødselsdato).getTime()
        );
        const insertIndex = indexOfFirstOlderChild === -1 ? getValues("husstandsbarn").length : indexOfFirstOlderChild;

        saveBoforhold.mutation.mutate(
            { oppdatereHusstandsmedlem: { opprettHusstandsmedlem: addedBarn } },
            {
                onSuccess: (response) => {
                    barnFieldArray.insert(insertIndex, { ...addedBarn, ...response.oppdatertHusstandsbarn });
                    setOpenAddBarnForm(false);
                    updatedPageErrorState();

                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                husstandsbarn: currentData.boforhold.husstandsbarn.concat(
                                    response.oppdatertHusstandsbarn
                                ),
                            },
                        };
                    });
                },
            }
        );
    };

    const onSearchClick = (value) => {
        PERSON_API.informasjon
            .hentPersonPost({ ident: value })
            .then(({ data }) => {
                setNavn(data.visningsnavn);
                setPerson(data);
                const formErrors = { ...error };
                delete formErrors.ident;
                delete formErrors.navn;
                setError(formErrors);
            })
            .catch(() => {
                setError({ ...error, ident: removePlaceholder(text.error.personFinnesIkke, value) });
            });
    };

    const onSearchClear = () => {
        setIdent("");
        setNavn("");
        setPerson(null);
        const formErrors = { ...error };
        delete formErrors.ident;
        delete formErrors.navn;
        setError(formErrors);
    };

    const updatedPageErrorState = () => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                ...pageErrorsOrUnsavedState.boforhold,
                openFields: { ...pageErrorsOrUnsavedState.boforhold.openFields, newBarn: false },
            },
        });
    };

    const onClose = () => {
        setOpenAddBarnForm(false);
        updatedPageErrorState();
    };

    return (
        <Box className="mt-4 mb-4 p-4" borderWidth="1">
            <VStack gap="4">
                <FlexRow className="items-center">
                    <div>Barn</div>
                    <div className="ml-auto self-end">
                        <Button
                            type="button"
                            onClick={onClose}
                            icon={<TrashIcon aria-hidden />}
                            variant="tertiary"
                            size="small"
                        />
                    </div>
                </FlexRow>

                <RadioGroup
                    className="mb-4"
                    size="small"
                    legend=""
                    value={val}
                    onChange={(val) => {
                        setVal(val);
                        setIdent("");
                        setFoedselsdato(null);
                        setError(null);
                    }}
                >
                    <Radio value="dnummer">{text.label.fødselsnummerDnummer}</Radio>
                    <Radio value="fritekst">Fritekst</Radio>
                </RadioGroup>
                <FlexRow>
                    {val === "dnummer" && (
                        <Search
                            className="w-fit"
                            label={text.label.fødselsnummerDnummer}
                            variant="secondary"
                            size="small"
                            hideLabel={false}
                            error={error?.ident}
                            onChange={(value) => setIdent(value)}
                            onClear={onSearchClear}
                            onSearchClick={onSearchClick}
                        />
                    )}
                    {val === "fritekst" && (
                        <DatePickerInput
                            label={text.label.fødselsdato}
                            placeholder="DD.MM.ÅÅÅÅ"
                            onChange={(value) => setFoedselsdato(value)}
                            defaultValue={null}
                            fieldValue={foedselsdato}
                            error={error?.foedselsdato}
                            toDate={new Date()}
                        />
                    )}
                    <TextField
                        name="navn"
                        label={text.label.navn}
                        size="small"
                        value={navn}
                        onChange={(e) => setNavn(e.target.value)}
                        error={error?.navn}
                        readOnly={val !== "fritekst"}
                    />
                </FlexRow>
                <FlexRow>
                    <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={onSaveAddedBarn}>
                        Lagre
                    </Button>
                </FlexRow>
            </VStack>
        </Box>
    );
};

const RemoveButton = ({ index, onRemoveBarn }: { index: number; onRemoveBarn: (index: number) => void }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const onConfirm = () => {
        ref.current?.close();
        onRemoveBarn(index);
    };

    return (
        <>
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={() => ref.current?.showModal()}
                    icon={<TrashIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            </div>
            <ConfirmationModal
                ref={ref}
                description={text.varsel.ønskerDuÅSletteBarnet}
                heading={<Heading size="small">{text.varsel.ønskerDuÅSlette}</Heading>}
                footer={
                    <>
                        <Button type="button" onClick={onConfirm} size="small">
                            {text.label.jaSlett}
                        </Button>
                        <Button type="button" variant="secondary" size="small" onClick={() => ref.current?.close()}>
                            {text.label.avbryt}
                        </Button>
                    </>
                }
            />
        </>
    );
};
const BarnPerioder = () => {
    const datoFom = useVirkningsdato();
    const { setPageErrorsOrUnsavedState, pageErrorsOrUnsavedState, lesemodus } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [openAddBarnForm, setOpenAddBarnForm] = useState(false);
    const { control, getValues } = useFormContext<BoforholdFormValues>();
    const barnFieldArray = useFieldArray({
        control,
        name: "husstandsbarn",
    });
    const watchFieldArray = useWatch({ control, name: "husstandsbarn" });
    const controlledFields = barnFieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const onOpenAddBarnForm = () => {
        setOpenAddBarnForm(true);
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            boforhold: {
                ...pageErrorsOrUnsavedState.boforhold,
                openFields: { ...pageErrorsOrUnsavedState.boforhold.openFields, newBarn: true },
            },
        });
    };

    const onRemoveBarn = (index: number) => {
        const barn = getValues(`husstandsbarn.${index}`);

        saveBoforhold.mutation.mutate(
            { oppdatereHusstandsmedlem: { slettHusstandsmedlem: barn.id } },
            {
                onSuccess: () => {
                    barnFieldArray.remove(index);
                    saveBoforhold.queryClientUpdater((currentData) => {
                        return {
                            ...currentData,
                            boforhold: {
                                ...currentData.boforhold,
                                husstandsbarn: currentData.boforhold.husstandsbarn.filter((b) => b.id !== barn.id),
                            },
                        };
                    });

                    const openFields = { ...pageErrorsOrUnsavedState.boforhold.openFields };
                    delete openFields[`husstandsbarn.${index}`];

                    setPageErrorsOrUnsavedState({
                        ...pageErrorsOrUnsavedState,
                        boforhold: {
                            ...pageErrorsOrUnsavedState.boforhold,
                            openFields,
                        },
                    });
                },
            }
        );
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Box
                        background="surface-subtle"
                        className="overflow-hidden grid gap-2 py-2 px-4"
                        id={`${elementIds.seksjon_boforhold}_${item.id}`}
                    >
                        <div className="grid grid-cols-[max-content,max-content,auto] p-2 bg-white border border-[var(--a-border-default)]">
                            <div>{item.medIBehandling && <RolleTag rolleType={Rolletype.BA} />}</div>
                            <div className="flex items-center gap-4">
                                <BodyShort size="small" className="font-bold">
                                    {item.medIBehandling && <PersonNavn ident={item.ident}></PersonNavn>}
                                    {!item.medIBehandling && item.navn}
                                </BodyShort>
                                <BodyShort size="small">{DateToDDMMYYYYString(dateOrNull(item.fødselsdato))}</BodyShort>
                            </div>
                            {!item.medIBehandling && !lesemodus && item.kilde === Kilde.MANUELL && (
                                <RemoveButton index={index} onRemoveBarn={onRemoveBarn} />
                            )}
                        </div>
                        <Perioder barnIndex={index} />
                    </Box>
                </Fragment>
            ))}
            {openAddBarnForm && (
                <AddBarnForm
                    datoFom={datoFom}
                    setOpenAddBarnForm={setOpenAddBarnForm}
                    barnFieldArray={barnFieldArray}
                />
            )}
            {!openAddBarnForm && !lesemodus && (
                <Button variant="secondary" type="button" size="small" className="w-fit" onClick={onOpenAddBarnForm}>
                    + Legg til barn
                </Button>
            )}
        </>
    );
};

const Perioder = ({ barnIndex }: { barnIndex: number }) => {
    const {
        boforhold: { valideringsfeil },
    } = useGetBehandlingV2();
    const { setErrorMessage, setErrorModalOpen, setPageErrorsOrUnsavedState, pageErrorsOrUnsavedState } = useForskudd();
    const [showUndoButton, setShowUndoButton] = useState(false);
    const { behandlingId, lesemodus } = useForskudd();
    const [showResetButton, setShowResetButton] = useState(false);
    const [editableRow, setEditableRow] = useState<`${number}.${number}`>(undefined);
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
            const selectedStatusIsOver18 = boststatusOver18År.includes(selectedStatus);
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
                        idPeriode: selectedPeriodeId,
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

                    // Set datoTom til null ellers resettes den ikke
                    setValue(
                        `husstandsbarn.${barnIndex}.perioder`,
                        response.oppdatertHusstandsbarn.perioder.map((d) => ({
                            ...d,
                            datoTom: d.datoTom ? d.datoTom : null,
                        }))
                    );

                    return {
                        ...currentData,
                        boforhold: {
                            ...currentData.boforhold,
                            husstandsbarn: updatedHusstandsbarnListe,
                            valideringsfeil: response.valideringsfeil,
                        },
                    };
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
                                saveBoforhold.queryClientUpdater((currentData) => {
                                    const updatedHusstandsbarnIndex = currentData.boforhold.husstandsbarn.findIndex(
                                        (husstandsbarn) => husstandsbarn.id === response.oppdatertHusstandsbarn.id
                                    );
                                    const updatedHusstandsbarnListe = currentData.boforhold.husstandsbarn.toSpliced(
                                        updatedHusstandsbarnIndex,
                                        1,
                                        response.oppdatertHusstandsbarn
                                    );

                                    // Set datoTom til null ellers resettes den ikke
                                    setValue(
                                        `husstandsbarn.${barnIndex}.perioder`,
                                        response.oppdatertHusstandsbarn.perioder.map((d) => ({
                                            ...d,
                                            datoTom: d.datoTom ? d.datoTom : null,
                                        }))
                                    );

                                    return {
                                        ...currentData,
                                        boforhold: {
                                            ...currentData.boforhold,
                                            husstandsbarn: updatedHusstandsbarnListe,
                                            valideringsfeil: response.valideringsfeil,
                                        },
                                    };
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
                                idPeriode: periode.id,
                                datoFom: periode.datoFom,
                                datoTom: periode.datoTom,
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

    const valideringsfeilForBarn = valideringsfeil?.husstandsbarn?.find((feil) => feil.barn.tekniskId === barn.id);

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
                    <ForskuddAlert variant="warning">
                        <Heading spacing size="small" level="3">
                            {text.alert.feilIPeriodisering}
                        </Heading>
                        {valideringsfeilForBarn.fremtidigPeriode && <p>{text.error.framoverPeriodisering}</p>}
                        {valideringsfeilForBarn.hullIPerioder.length > 0 && <p>{text.error.hullIPerioder}</p>}
                        {valideringsfeilForBarn.ingenLøpendePeriode && <p>{text.error.ingenLoependePeriode}</p>}
                    </ForskuddAlert>
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
                {!lesemodus && (
                    <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                        {text.label.leggTilPeriode}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <BoforholdsForm />
        </QueryErrorWrapper>
    );
};
