import { ArrowUndoIcon, ClockDashedIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { firstDayOfMonth, isValidDate } from "@navikt/bidrag-ui-common";
import {
    Alert,
    BodyShort,
    Box,
    Button,
    Heading,
    Radio,
    RadioGroup,
    ReadMore,
    Search,
    Table,
    TextField,
    VStack,
} from "@navikt/ds-react";
import React, { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useFieldArray, UseFieldArrayReturn, useForm, useFormContext, useWatch } from "react-hook-form";

import {
    Bostatuskode,
    HusstandsbarnDtoV2,
    HusstandsbarnGrunnlagDto,
    HusstandsbarnperiodeDto,
    Kilde,
    OppdaterBoforholdRequest,
} from "../../../api/BidragBehandlingApiV1";
import { Rolletype } from "../../../api/BidragDokumentProduksjonApi";
import { PersonDto } from "../../../api/PersonApi";
import { PERSON_API } from "../../../constants/api";
import elementIds from "../../../constants/elementIds";
import { boforholdPeriodiseringErros } from "../../../constants/error";
import { STEPS } from "../../../constants/steps";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import {
    useGetBehandlingV2,
    useGetOpplysningerBoforhold,
    useGetOpplysningerHentetdato,
    useGrunnlag,
    useSivilstandOpplysningerProssesert,
} from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import { useVirkningsdato } from "../../../hooks/useVirkningsdato";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { BoforholdFormValues, SavedHustandOpplysninger } from "../../../types/boforholdFormValues";
import {
    dateOrNull,
    DateToDDMMYYYYString,
    isAfterDate,
    isAfterEqualsDate,
    ISODateTimeStringToDDMMYYYYString,
    toDateString,
    toISODateString,
} from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
import { scrollToHash } from "../../../utils/window-utils";
import { DatePickerInput } from "../../date-picker/DatePickerInput";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FlexRow } from "../../layout/grid/FlexRow";
import { FormLayout } from "../../layout/grid/FormLayout";
import { ConfirmationModal } from "../../modal/ConfirmationModal";
import { PersonNavn } from "../../PersonNavn";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import StatefulAlert from "../../StatefulAlert";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import {
    boforholdForskuddOptions,
    boststatusOver18År,
    checkPeriodizationErrors,
    compareHusstandsBarn,
    createInitialValues,
    editPeriods,
    getEitherFirstDayOfFoedselsOrVirkingsdatoMonth,
    getFirstDayOfMonthAfterEighteenYears,
    isOver18YearsOld,
    mapSivilstandProsessert,
    removeAndEditPeriods,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { ActionButtons } from "../inntekt/ActionButtons";
import { KildeIcon } from "../inntekt/InntektTable";
import { Sivilstand } from "./Sivilstand";

const Opplysninger = ({ datoFom, ident }: { datoFom: Date | null; ident: string }) => {
    const opplysninger = useGetOpplysningerBoforhold();
    const perioder = opplysninger.find((opplysning) => opplysning.ident == ident)?.perioder;
    if (!perioder) {
        return null;
    }
    return (
        <ReadMore header={text.title.opplysningerFraFolkeregistret} size="small" className="pb-4">
            <Table className="w-[350px] opplysninger" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{text.label.periode}</Table.HeaderCell>
                        <Table.HeaderCell>{text.label.status}</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {perioder.map((periode, index) => (
                        <Table.Row key={`${periode.bostatus}-${index}`}>
                            <Table.DataCell className="flex justify-start gap-2">
                                <>
                                    {datoFom && new Date(periode.datoFom) < new Date(datoFom)
                                        ? DateToDDMMYYYYString(datoFom)
                                        : DateToDDMMYYYYString(new Date(periode.datoFom))}
                                    <div>{"-"}</div>
                                    {periode.datoTom ? DateToDDMMYYYYString(new Date(periode.datoTom)) : ""}
                                </>
                            </Table.DataCell>
                            <Table.DataCell>{hentVisningsnavn(periode.bostatus)}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </ReadMore>
    );
};

const Main = ({
    opplysningerChanges,
    updateOpplysninger,
}: {
    opplysningerChanges: string[];
    updateOpplysninger: () => void;
}) => {
    const {
        virkningstidspunkt: { virkningstidspunkt: virkningstidspunktRes },
    } = useGetBehandlingV2();
    const datoFom = useVirkningsdato();
    const virkningstidspunkt = dateOrNull(virkningstidspunktRes);

    const boforoholdOpplysningerHentetdato = useGetOpplysningerHentetdato();
    useEffect(scrollToHash, []);
    return (
        <>
            {opplysningerChanges.length > 0 && (
                <Alert variant="info">
                    <div className="flex items-center mb-4">
                        {removePlaceholder(
                            text.alert.nyeOpplysninger,
                            ISODateTimeStringToDDMMYYYYString(boforoholdOpplysningerHentetdato)
                        )}
                        <Button
                            variant="tertiary"
                            size="small"
                            className="ml-8"
                            icon={<ClockDashedIcon aria-hidden />}
                            onClick={updateOpplysninger}
                        >
                            {text.label.oppdater}
                        </Button>
                    </div>
                    <p>{text.alert.endringer}</p>
                    {opplysningerChanges.map((change, i) => (
                        <p key={change + i}>{change}</p>
                    ))}
                </Alert>
            )}
            {!isValidDate(virkningstidspunkt) && (
                <Alert variant="warning">{text.alert.manglerVirkningstidspunkt}</Alert>
            )}
            <Heading level="3" size="medium">
                {text.label.barn}
            </Heading>
            <BarnPerioder datoFom={datoFom} />
            <Sivilstand datoFom={datoFom} />
        </>
    );
};

const Side = () => {
    const { setActiveStep, boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const { watch } = useFormContext<BoforholdFormValues>();
    const saveBoforhold = useOnSaveBoforhold();
    const onSave = () => saveBoforhold(boforholdFormValues);
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.INNTEKT]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch(({ notat }, { name }) => {
            if (["notat.kunINotat"].includes(name)) {
                setBoforholdFormValues((prev) => ({
                    ...prev,
                    notat,
                }));
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <Heading level="3" size="medium">
                {text.title.begrunnelse}
            </Heading>
            <FormControlledTextarea name="notat.kunINotat" label="" hideLabel />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const BoforholdsForm = () => {
    // Behold dette for debugging i prod
    useGrunnlag();
    const { setBoforholdFormValues } = useForskudd();
    const isSavedInitialOpplysninger = useRef(false);
    const [opplysningerChanges, setOpplysningerChanges] = useState([]);
    const { boforhold, roller } = useGetBehandlingV2();
    const virkningsOrSoktFraDato = useVirkningsdato();
    const saveBoforhold = useOnSaveBoforhold();
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

    useEffect(() => {
        if (boforhold.sivilstand.length == 0 && !isSavedInitialOpplysninger.current) {
            saveBoforhold(initialValues);
        }

        isSavedInitialOpplysninger.current = true;

        setBoforholdFormValues(initialValues);
    }, []);

    const updateOpplysninger = () => {
        const fieldValues = useFormMethods.getValues();
        const values: OppdaterBoforholdRequest = {
            ...fieldValues,
            sivilstand: mapSivilstandProsessert(sivilstandProssesert.sivilstandListe),
        };

        useFormMethods.reset(values);
        saveBoforhold(values);
        setBoforholdFormValues(values);
        setOpplysningerChanges([]);
    };

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <FormLayout
                        title={text.title.boforhold}
                        main={
                            <Main opplysningerChanges={opplysningerChanges} updateOpplysninger={updateOpplysninger} />
                        }
                        side={<Side />}
                    />
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
    const { boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const { getValues } = useFormContext<BoforholdFormValues>();
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
        const husstandsbarn = boforholdFormValues.husstandsbarn.concat(addedBarn).sort(compareHusstandsBarn);
        const indexOfFirstOlderChild = getValues("husstandsbarn").findIndex(
            (barn) =>
                !barn.medIBehandling && new Date(barn.fødselsdato).getTime() < new Date(addedBarn.fødselsdato).getTime()
        );
        const insertIndex = indexOfFirstOlderChild === -1 ? getValues("husstandsbarn").length : indexOfFirstOlderChild;
        barnFieldArray.insert(insertIndex, addedBarn);
        const updatedValues = {
            ...boforholdFormValues,
            husstandsbarn,
        };

        setBoforholdFormValues(updatedValues);
        saveBoforhold(updatedValues);
        setOpenAddBarnForm(false);
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

    return (
        <Box className="mt-4 mb-4 p-4" borderWidth="1">
            <VStack gap="4">
                <FlexRow className="items-center">
                    <div>Barn</div>
                    <div className="ml-auto self-end">
                        <Button
                            type="button"
                            onClick={() => setOpenAddBarnForm(false)}
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
                heading={text.varsel.ønskerDuÅSlette}
                footer={
                    <>
                        <Button type="button" onClick={onConfirm}>
                            {text.label.jaSlett}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => ref.current?.close()}>
                            {text.label.avbryt}
                        </Button>
                    </>
                }
            />
        </>
    );
};
const BarnPerioder = ({ datoFom }: { datoFom: Date }) => {
    const { boforholdFormValues, setBoforholdFormValues, lesemodus } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [openAddBarnForm, setOpenAddBarnForm] = useState(false);
    const { control } = useFormContext<BoforholdFormValues>();
    const opplysinger = useGetOpplysningerBoforhold();
    const opplysningerFraFolkRegistre = opplysinger ?? [];
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
    };

    const onRemoveBarn = (index: number) => {
        const husstandsbarn = [...boforholdFormValues.husstandsbarn].filter((b, i) => i !== index);
        barnFieldArray.remove(index);
        const updatedValues = {
            ...boforholdFormValues,
            husstandsbarn,
        };

        setBoforholdFormValues(updatedValues);
        saveBoforhold(updatedValues);
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Box
                        padding="4"
                        background="surface-subtle"
                        className="overflow-hidden"
                        id={`${elementIds.seksjon_boforhold}_${item.id}`}
                    >
                        <div className="mb-4">
                            <div className="grid grid-cols-[max-content,max-content,auto] mb-2 p-2 bg-[#EFECF4]">
                                <div className="w-8 mr-2 h-max">
                                    {item.medIBehandling && <RolleTag rolleType={Rolletype.BA} />}
                                </div>
                                <div className="flex items-center gap-4">
                                    <BodyShort size="small" className="font-bold">
                                        {item.medIBehandling && <PersonNavn ident={item.ident}></PersonNavn>}
                                        {!item.medIBehandling && item.navn}
                                    </BodyShort>
                                    <BodyShort size="small">
                                        {DateToDDMMYYYYString(dateOrNull(item.fødselsdato))}
                                    </BodyShort>
                                </div>
                                {!item.medIBehandling && !lesemodus && item.kilde === Kilde.MANUELL && (
                                    <RemoveButton index={index} onRemoveBarn={onRemoveBarn} />
                                )}
                            </div>
                        </div>
                        <Perioder
                            barnIndex={index}
                            virkningstidspunkt={datoFom}
                            opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
                        />
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

const Perioder = ({
    barnIndex,
    virkningstidspunkt,
    opplysningerFraFolkRegistre,
}: {
    barnIndex: number;
    virkningstidspunkt: Date;
    opplysningerFraFolkRegistre: HusstandsbarnGrunnlagDto[] | SavedHustandOpplysninger[];
}) => {
    const { boforholdFormValues, setBoforholdFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const [showUndoButton, setShowUndoButton] = useState(false);
    const { behandlingId, lesemodus } = useForskudd();
    const [showResetButton, setShowResetButton] = useState(false);
    const [editableRow, setEditableRow] = useState("");
    const saveBoforhold = useOnSaveBoforhold();
    const {
        control,
        getValues,
        clearErrors,
        setError,
        setValue,
        getFieldState,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const barnPerioder = useFieldArray({
        control,
        name: `husstandsbarn.${barnIndex}.perioder`,
    });
    const [lastPeriodsState, setLastPeriodsState] = useState([]);
    const watchFieldArray = useWatch({ control, name: `husstandsbarn.${barnIndex}.perioder` });
    const controlledFields = barnPerioder.fields.map((field, index) => ({
        ...field,
        ...watchFieldArray[index],
    }));
    const barn = getValues(`husstandsbarn.${barnIndex}`);
    const barnIsOver18 = isOver18YearsOld(barn.fødselsdato);
    const monthAfter18 = getFirstDayOfMonthAfterEighteenYears(new Date(barn.fødselsdato));
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(barn.fødselsdato, virkningstidspunkt);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFra);
    const hasOpplysningerFraFolkeregistre = opplysningerFraFolkRegistre.some(
        (opplysning) => opplysning.ident === barn.ident
    );

    useEffect(() => {
        validatePeriods(barn.perioder);
    }, [barn.perioder]);

    const validatePeriods = (perioderValues: HusstandsbarnperiodeDto[]) => {
        const errorTypes = checkPeriodizationErrors(perioderValues, datoFra);

        if (errorTypes.length) {
            setError(`root.husstandsbarn.${barnIndex}`, {
                types: errorTypes.reduce(
                    (acc, errorType) => ({
                        ...acc,
                        [errorType]:
                            errorType === "hullIPerioder"
                                ? removePlaceholder(
                                      boforholdPeriodiseringErros[errorType],
                                      toDateString(datoFra),
                                      toDateString(new Date(perioderValues[0].datoFom))
                                  )
                                : boforholdPeriodiseringErros[errorType],
                    }),
                    {}
                ),
            });
        } else {
            clearErrors(`root.husstandsbarn.${barnIndex}`);
        }
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`husstandsbarn.${barnIndex}.perioder`) as HusstandsbarnperiodeDto[];
        if (perioderValues[index]?.datoFom === null) {
            setError(`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: text.error.datoMåFyllesUt,
            });
        }

        const selectedStatus = perioderValues[index].bostatus;
        const selectedDatoFom = perioderValues[index]?.datoFom;
        const selectedDatoTom = perioderValues[index]?.datoTom;

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
            updatedAndSave(editPeriods(perioderValues, index, monthAfter18));
        }
    };

    const undoAction = () => {
        updatedAndSave(lastPeriodsState);
    };

    const updatedAndSave = (updatedPeriods: HusstandsbarnperiodeDto[]) => {
        setLastPeriodsState(boforholdFormValues.husstandsbarn[barnIndex].perioder);
        const husstandsbarn = boforholdFormValues.husstandsbarn.toSpliced(barnIndex, 1, {
            ...boforholdFormValues.husstandsbarn[barnIndex],
            perioder: updatedPeriods,
        });
        const updatedValues = {
            ...boforholdFormValues,
            husstandsbarn,
        };
        setBoforholdFormValues(updatedValues);
        setValue(`husstandsbarn.${barnIndex}.perioder`, updatedPeriods);
        saveBoforhold(updatedValues);
        setShowUndoButton(true);
        setShowResetButton(true);
        setEditableRow("");
    };

    const validateFomOgTom = (index: number) => {
        const perioderValues = getValues(`husstandsbarn.${barnIndex}.perioder`);

        const fomOgTomInvalid =
            perioderValues[index].datoTom && isAfterDate(perioderValues[index]?.datoFom, perioderValues[index].datoTom);

        if (fomOgTomInvalid) {
            setError(`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: text.error.tomDatoKanIkkeVæreFørFomDato,
            });
        } else {
            clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`);
        }
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

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`husstandsbarn.${barnIndex}.perioder`) as HusstandsbarnperiodeDto[];
            const updatedPeriods = removeAndEditPeriods(perioderValues, index, monthAfter18);
            clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}`);
            updatedAndSave(updatedPeriods);
        }
    };

    const resetTilDataFraFreg = () => {
        const barn = getValues(`husstandsbarn.${barnIndex}`);
        const opplysningFraFreg = opplysningerFraFolkRegistre.find((opplysning) => opplysning.ident === barn.ident);
        updatedAndSave(opplysningFraFreg.perioder.map((periode) => ({ ...periode, kilde: Kilde.OFFENTLIG })));
        setShowResetButton(false);
    };

    const checkIfAnotherRowIsEdited = (index?: number) => {
        const editableRowIndex = editableRow.split(".")[1];
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

    function bosstatusToVisningsnavn(bostsatus: Bostatuskode): string {
        const visningsnavn = hentVisningsnavn(bostsatus);
        if (boststatusOver18År.includes(bostsatus)) {
            return `18 ${text.år}: ${visningsnavn}`;
        }
        return visningsnavn;
    }

    const boforholdOptions = isOver18YearsOld(barn.fødselsdato)
        ? boforholdForskuddOptions.likEllerOver18År
        : boforholdForskuddOptions.under18År;

    const showDeleteButton = (index: number) => {
        const firstOver18PeriodIndex = boforholdFormValues?.husstandsbarn[barnIndex].perioder.findIndex((period) =>
            boststatusOver18År.includes(period.bostatus)
        );
        if (barnIsOver18 && index === firstOver18PeriodIndex) {
            return false;
        }
        return !!index;
    };

    const editButtons = (index: number) => {
        if (lesemodus) return [];
        return [
            editableRow === `${barnIndex}.${index}` ? (
                <Button
                    key={`save-button-${barnIndex}-${index}`}
                    type="button"
                    onClick={() => onSaveRow(index)}
                    icon={<FloppydiskIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            ) : (
                <Button
                    key={`edit-button-${barnIndex}-${index}`}
                    type="button"
                    onClick={() => onEditRow(index)}
                    icon={<PencilIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            ),
            showDeleteButton(index) && !lesemodus ? (
                <Button
                    key={`delete-button-${barnIndex}-${index}`}
                    type="button"
                    onClick={() => onRemovePeriode(index)}
                    icon={<TrashIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            ) : (
                <div key={`delete-button-${barnIndex}-${index}.placeholder`} className="min-w-[40px]"></div>
            ),
        ];
    };

    return (
        <>
            {barnIsOver18 && !lesemodus && (
                <div className="mb-4">
                    <StatefulAlert
                        variant="info"
                        size="small"
                        alertKey={"18åralert" + behandlingId + barn.ident}
                        className="w-fit"
                    >
                        <Heading spacing size="small" level="3">
                            {text.title.barnOver18}
                        </Heading>
                        {text.barnetHarFylt18SjekkBostatus}
                    </StatefulAlert>
                </div>
            )}
            {errors?.root?.husstandsbarn?.[barnIndex]?.types && (
                <div className="mb-4">
                    <Alert variant="warning">
                        <Heading spacing size="small" level="3">
                            {text.alert.feilIPeriodisering}
                        </Heading>
                        {Object.values(errors.root.husstandsbarn[barnIndex].types).map((type: string) => (
                            <p key={type}>{type}</p>
                        ))}
                    </Alert>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <Opplysninger datoFom={virkningstidspunkt} ident={barn.ident} />
                {hasOpplysningerFraFolkeregistre && showResetButton && (
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
                <TableWrapper
                    heading={[
                        text.label.fraOgMed,
                        text.label.tilOgMed,
                        text.label.status,
                        text.label.kilde,
                        ...(lesemodus ? [] : ["", ""]),
                    ]}
                >
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`}
                                        name={`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`}
                                        label={text.label.fraOgMed}
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoFom}
                                        customValidation={() => validateFomOgTom(index)}
                                        fromDate={fom}
                                        toDate={tom}
                                        hideLabel
                                        required
                                    />
                                ) : (
                                    <BodyShort key={`husstandsbarn.${barnIndex}.perioder.${index}.datoFom.placeholder`}>
                                        {item.datoFom && DateToDDMMYYYYString(dateOrNull(item.datoFom))}
                                    </BodyShort>
                                ),
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsbarn.${barnIndex}.perioder.${index}.datoTom`}
                                        name={`husstandsbarn.${barnIndex}.perioder.${index}.datoTom`}
                                        label={text.label.tilOgMed}
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        customValidation={() => validateFomOgTom(index)}
                                        fromDate={fom}
                                        toDate={tom}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`husstandsbarn.${barnIndex}.perioder.${index}.datoTom.placeholder`}>
                                        {item.datoTom && DateToDDMMYYYYString(dateOrNull(item.datoTom))}
                                    </BodyShort>
                                ),
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledSelectField
                                        key={`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`}
                                        name={`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`}
                                        className="w-fit"
                                        label={text.label.status}
                                        options={boforholdOptions.map((value) => ({
                                            value,
                                            text: bosstatusToVisningsnavn(value),
                                        }))}
                                        hideLabel
                                        onSelect={() =>
                                            clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`)
                                        }
                                    />
                                ) : (
                                    <BodyShort
                                        key={`husstandsbarn.${barnIndex}.perioder.${index}.bostatus.placeholder`}
                                    >
                                        {bosstatusToVisningsnavn(item.bostatus)}
                                    </BodyShort>
                                ),
                                <KildeIcon
                                    key={`husstandsbarn.${barnIndex}.perioder.${index}.kilde.placeholder`}
                                    kilde={item.kilde}
                                />,
                                ...editButtons(index),
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <div className="mt-4 grid gap-4">
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
        </>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <BoforholdsForm />
        </QueryErrorWrapper>
    );
};
