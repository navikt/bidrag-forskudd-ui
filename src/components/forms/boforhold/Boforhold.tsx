import { ArrowUndoIcon, ClockDashedIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { firstDayOfMonth, isValidDate, lastDayOfMonth } from "@navikt/bidrag-ui-common";
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
    HusstandsbarnDto,
    HusstandsbarnperiodeDto,
    Kilde,
    OppdaterBoforholdRequest,
    OpplysningerType,
} from "../../../api/BidragBehandlingApiV1";
import { Rolletype } from "../../../api/BidragDokumentProduksjonApi";
import { PersonDto } from "../../../api/PersonApi";
import { PERSON_API } from "../../../constants/api";
import { boforholdPeriodiseringErros } from "../../../constants/error";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { KildeTexts } from "../../../enum/KildeTexts";
import {
    useAddOpplysningerData,
    useGetBehandling,
    useGetOpplysninger,
    useGetOpplysningerHentetdato,
    useGrunnlagspakke,
} from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import {
    BoforholdFormValues,
    HusstandOpplysningFraFolkeRegistre,
    ParsedBoforholdOpplysninger,
    SavedHustandOpplysninger,
    SavedOpplysningFraFolkeRegistrePeriode,
} from "../../../types/boforholdFormValues";
import {
    dateOrNull,
    DateToDDMMYYYYString,
    deductMonths,
    isAfterDate,
    isAfterEqualsDate,
    isBeforeDate,
    ISODateTimeStringToDDMMYYYYString,
    toDateString,
    toISODateString,
} from "../../../utils/date-utils";
import { removePlaceholder } from "../../../utils/string-utils";
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
    compareOpplysninger,
    createInitialValues,
    editPeriods,
    getBarnPerioder,
    getBarnPerioderFromHusstandsListe,
    getEitherFirstDayOfFoedselsOrVirkingsdatoMonth,
    getFirstDayOfMonthAfterEighteenYears,
    getSivilstandPerioder,
    isOver18YearsOld,
    mapGrunnlagSivilstandToBehandlingSivilstandType,
    mapHusstandsMedlemmerToBarn,
    removeAndEditPeriods,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { ActionButtons } from "../inntekt/ActionButtons";
import { Sivilstand } from "./Sivilstand";

const Opplysninger = ({ datoFom, ident }: { datoFom: Date | null; ident: string }) => {
    const tilVisningsnavn = useVisningsnavn();
    const opplysninger = useGetOpplysninger<ParsedBoforholdOpplysninger>(OpplysningerType.BOFORHOLD_BEARBEIDET);
    const perioder = opplysninger?.husstand.find((opplysning) => opplysning.ident == ident)
        ?.perioder as SavedOpplysningFraFolkeRegistrePeriode[];
    if (!perioder) {
        return null;
    }
    return (
        <ReadMore header="Opplysninger fra Folkeregistret" size="small" className="pb-4">
            <Table className="w-[350px] opplysninger" size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Periode</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {perioder
                        ?.filter((periode) => periode.tilDato === null || isAfterDate(periode.tilDato, datoFom))
                        .map((periode, index) => (
                            <Table.Row key={`${periode.bostatus}-${index}`}>
                                <Table.DataCell className="flex justify-start gap-2">
                                    <>
                                        {datoFom && new Date(periode.fraDato) < new Date(datoFom)
                                            ? DateToDDMMYYYYString(datoFom)
                                            : DateToDDMMYYYYString(new Date(periode.fraDato))}
                                        <div>{"-"}</div>
                                        {periode.tilDato ? DateToDDMMYYYYString(new Date(periode.tilDato)) : ""}
                                    </>
                                </Table.DataCell>
                                <Table.DataCell>{tilVisningsnavn(periode.bostatus)}</Table.DataCell>
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
        virkningstidspunkt: { virkningsdato },
        søktFomDato,
    } = useGetBehandling();
    const virkningstidspunkt = dateOrNull(virkningsdato);
    const datoFom = virkningstidspunkt ?? dateOrNull(søktFomDato);

    const boforoholdOpplysningerHentetdato = useGetOpplysningerHentetdato(OpplysningerType.BOFORHOLD_BEARBEIDET);
    return (
        <>
            {opplysningerChanges.length > 0 && (
                <Alert variant="info">
                    <div className="flex items-center mb-4">
                        Nye opplysninger tilgjengelig. Sist hentet{" "}
                        {ISODateTimeStringToDDMMYYYYString(boforoholdOpplysningerHentetdato)}
                        <Button
                            variant="tertiary"
                            size="small"
                            className="ml-8"
                            icon={<ClockDashedIcon aria-hidden />}
                            onClick={updateOpplysninger}
                        >
                            Oppdater
                        </Button>
                    </div>
                    <p>Følgende endringer har blitt utført:</p>
                    {opplysningerChanges.map((change, i) => (
                        <p key={change + i}>{change}</p>
                    ))}
                </Alert>
            )}
            {!isValidDate(virkningstidspunkt) && <Alert variant="warning">Mangler virkningstidspunkt</Alert>}
            <Heading level="3" size="medium">
                Barn
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
            if (["notat.medIVedtaket", "notat.kunINotat"].includes(name)) {
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
                Begrunnelse
            </Heading>
            <FormControlledTextarea name="notat.medIVedtaket" label="Begrunnelse (med i vedtaket og notat)" />
            <FormControlledTextarea name="notat.kunINotat" label="Begrunnelse (kun med i notat)" />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const BoforholdsForm = () => {
    const { behandlingId, setBoforholdFormValues } = useForskudd();
    const isSavedInitialOpplysninger = useRef(false);
    const [opplysningerChanges, setOpplysningerChanges] = useState([]);
    const {
        boforhold,
        virkningstidspunkt: { virkningsdato },
        søktFomDato,
        roller,
    } = useGetBehandling();
    const boforoholdOpplysninger = useGetOpplysninger<ParsedBoforholdOpplysninger>(
        OpplysningerType.BOFORHOLD_BEARBEIDET
    );
    const { husstandmedlemmerOgEgneBarnListe, sivilstandListe } = useGrunnlagspakke();
    const { mutation: saveOpplysninger } = useAddOpplysningerData();
    const saveBoforhold = useOnSaveBoforhold();
    const opplysningerFraFolkRegistre = useMemo(
        () => ({
            husstand: mapHusstandsMedlemmerToBarn(husstandmedlemmerOgEgneBarnListe),
            sivilstand: mapGrunnlagSivilstandToBehandlingSivilstandType(sivilstandListe),
        }),
        [husstandmedlemmerOgEgneBarnListe, sivilstandListe]
    );
    const virkningsOrSoktFraDato = useMemo(
        () => dateOrNull(virkningsdato) ?? dateOrNull(søktFomDato),
        [virkningsdato, søktFomDato]
    );
    const barnMedISaken = useMemo(() => roller.filter((rolle) => rolle.rolletype === Rolletype.BA), [roller]);
    const initialValues = useMemo(
        () => createInitialValues(boforhold, opplysningerFraFolkRegistre, virkningsOrSoktFraDato, barnMedISaken),
        [boforhold, opplysningerFraFolkRegistre, virkningsOrSoktFraDato, barnMedISaken]
    );

    const useFormMethods = useForm({
        defaultValues: initialValues,
        criteriaMode: "all",
    });

    useEffect(() => {
        if (boforoholdOpplysninger) {
            const changesInOpplysninger = compareOpplysninger(boforoholdOpplysninger, opplysningerFraFolkRegistre);

            if (changesInOpplysninger?.length) {
                setOpplysningerChanges(changesInOpplysninger);
            }
        }

        if (!boforoholdOpplysninger && !isSavedInitialOpplysninger.current) {
            lagreAlleOpplysninger();
            saveBoforhold(initialValues);
        }

        isSavedInitialOpplysninger.current = true;

        setBoforholdFormValues(initialValues);
    }, []);

    const lagreAlleOpplysninger = async () => {
        await saveOpplysninger.mutateAsync({
            behandlingId,
            aktiv: true,
            grunnlagstype: OpplysningerType.BOFORHOLD_BEARBEIDET,
            data: JSON.stringify(opplysningerFraFolkRegistre),
            hentetDato: toISODateString(new Date()),
        });
        await saveOpplysninger.mutateAsync({
            behandlingId,
            aktiv: true,
            grunnlagstype: OpplysningerType.HUSSTANDSMEDLEMMER,
            data: JSON.stringify(husstandmedlemmerOgEgneBarnListe),
            hentetDato: toISODateString(new Date()),
        });
        await saveOpplysninger.mutateAsync({
            behandlingId,
            aktiv: true,
            grunnlagstype: OpplysningerType.SIVILSTAND,
            data: JSON.stringify(sivilstandListe),
            hentetDato: toISODateString(new Date()),
        });
    };
    const updateOpplysninger = () => {
        lagreAlleOpplysninger();

        const fieldValues = useFormMethods.getValues();
        const values: OppdaterBoforholdRequest = {
            ...fieldValues,
            husstandsbarn: getBarnPerioderFromHusstandsListe(
                opplysningerFraFolkRegistre.husstand,
                virkningsOrSoktFraDato,
                barnMedISaken
            ),
            sivilstand: getSivilstandPerioder(opplysningerFraFolkRegistre.sivilstand, virkningsOrSoktFraDato),
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
                        title="Boforhold"
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
            formErrors = { ...formErrors, navn: "Navn må fylles ut" };
        } else {
            delete formErrors.navn;
        }

        if (val === "fritekst") {
            if (!isValidDate(foedselsdato)) {
                formErrors = { ...formErrors, foedselsdato: "Dato er ikke gylid" };
            } else {
                delete formErrors.foedselsdato;
            }
        }

        if (val === "dnummer") {
            if (ident === "") {
                formErrors = { ...formErrors, ident: "Ident må fylles ut" };
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

        const addedBarn: HusstandsbarnDto = {
            ident: val === "dnummer" ? ident : "",
            medISak: false,
            navn: navn,
            fødselsdato: fd,
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
            (barn) => !barn.medISak && new Date(barn.fødselsdato).getTime() > new Date(addedBarn.fødselsdato).getTime()
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
                setError({ ...error, ident: `Finner ikke person med ident: ${value}` });
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
                    <Radio value="dnummer">Fødselsnummer/d-nummer</Radio>
                    <Radio value="fritekst">Fritekst</Radio>
                </RadioGroup>
                <FlexRow>
                    {val === "dnummer" && (
                        <Search
                            className="w-fit"
                            label="Fødselsnummer/ d-nummer"
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
                            label="Fødselsdato"
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
                        label="Navn"
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

const BarnPerioder = ({ datoFom }: { datoFom: Date }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const { boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [openAddBarnForm, setOpenAddBarnForm] = useState(false);
    const { control } = useFormContext<BoforholdFormValues>();
    const opplysinger = useGetOpplysninger<ParsedBoforholdOpplysninger>(OpplysningerType.BOFORHOLD_BEARBEIDET);
    const opplysningerFraFolkRegistre = opplysinger?.husstand ?? [];
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
        ref.current?.close();
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Box padding="4" background="surface-subtle" className="overflow-hidden">
                        <div className="mb-4">
                            <div className="grid grid-cols-[max-content,max-content,auto] mb-2 p-2 bg-[#EFECF4]">
                                <div className="w-8 mr-2 h-max">
                                    {item.medISak && <RolleTag rolleType={Rolletype.BA} />}
                                </div>
                                <div className="flex items-center gap-4">
                                    <BodyShort size="small" className="font-bold">
                                        {item.medISak && <PersonNavn ident={item.ident}></PersonNavn>}
                                        {!item.medISak && item.navn}
                                    </BodyShort>
                                    <BodyShort size="small">{item.ident}</BodyShort>
                                </div>
                                {!item.medISak && (
                                    <div className="flex items-center justify-end">
                                        <Button
                                            type="button"
                                            onClick={() => ref.current?.showModal()}
                                            icon={<TrashIcon aria-hidden />}
                                            variant="tertiary"
                                            size="small"
                                        />
                                    </div>
                                )}
                            </div>
                            <Opplysninger datoFom={datoFom} ident={item.ident} />
                        </div>
                        <Perioder
                            barnIndex={index}
                            foedselsdato={item.fødselsdato}
                            virkningstidspunkt={datoFom}
                            opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
                        />
                    </Box>
                    <ConfirmationModal
                        ref={ref}
                        description="Ønsker du å slette barnet som er lagt til i beregningen?"
                        heading="Ønsker du å slette?"
                        footer={
                            <>
                                <Button type="button" onClick={() => onRemoveBarn(index)}>
                                    Ja, slett
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => ref.current?.close()}>
                                    Avbryt
                                </Button>
                            </>
                        }
                    />
                </Fragment>
            ))}
            {openAddBarnForm && (
                <AddBarnForm
                    datoFom={datoFom}
                    setOpenAddBarnForm={setOpenAddBarnForm}
                    barnFieldArray={barnFieldArray}
                />
            )}
            {!openAddBarnForm && (
                <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={onOpenAddBarnForm}>
                    + Legg til barn
                </Button>
            )}
        </>
    );
};

const Perioder = ({
    barnIndex,
    foedselsdato,
    virkningstidspunkt,
    opplysningerFraFolkRegistre,
}: {
    barnIndex: number;
    foedselsdato: string;
    virkningstidspunkt: Date;
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
}) => {
    const { boforholdFormValues, setBoforholdFormValues, setErrorMessage, setErrorModalOpen } = useForskudd();
    const [showUndoButton, setShowUndoButton] = useState(false);
    const { behandlingId } = useForskudd();
    const toVisningsnavn = useVisningsnavn();
    const [showResetButton, setShowResetButton] = useState(false);
    const [editableRow, setEditableRow] = useState("");
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(foedselsdato, virkningstidspunkt);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFra);
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
                message: "Dato må fylles ut",
            });
        }

        const selectedStatus = perioderValues[index].bostatus;
        const monthAfter18 = getFirstDayOfMonthAfterEighteenYears(new Date(foedselsdato));
        const selectedDatoFom = perioderValues[index]?.datoFom;
        const selectedDatoTom = perioderValues[index]?.datoTom;
        const isInvalidStatusForAfter18 =
            isOver18YearsOld(foedselsdato) &&
            !boststatusOver18År.includes(selectedStatus) &&
            (isAfterEqualsDate(selectedDatoFom, monthAfter18) ||
                (selectedDatoTom && isAfterEqualsDate(selectedDatoTom, monthAfter18)));
        const isInvalidStatusForBefore18 =
            isOver18YearsOld(foedselsdato) &&
            boststatusOver18År.includes(selectedStatus) &&
            isBeforeDate(selectedDatoFom, monthAfter18);
        if (isInvalidStatusForAfter18) {
            setError(`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`, {
                message: `Ugyldig boststatus for periode etter barnet har fylt 18 år.`,
            });
        } else if (isInvalidStatusForBefore18) {
            setError(`husstandsbarn.${barnIndex}.perioder.${index}.bostatus`, {
                message: `Ugyldig bosstatus for periode før barnet har fylt 18 år.`,
            });
        } else {
            const fieldState = getFieldState(`husstandsbarn.${barnIndex}.perioder.${index}`);
            if (!fieldState.error) {
                updatedAndSave(editPeriods(perioderValues, index));
            }
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
            perioderValues[index].datoTom !== null &&
            isAfterDate(perioderValues[index]?.datoFom, perioderValues[index].datoTom);

        if (fomOgTomInvalid) {
            setError(`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: "Tom dato kan ikke være før fom dato",
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
            const updatedPeriods = removeAndEditPeriods(perioderValues, index);
            clearErrors(`husstandsbarn.${barnIndex}.perioder.${index}`);
            updatedAndSave(updatedPeriods);
        }
    };

    const resetTilDataFraFreg = () => {
        const barn = getValues(`husstandsbarn.${barnIndex}`);
        const opplysningFraFreg = opplysningerFraFolkRegistre.find((opplysning) => opplysning.ident === barn.ident);
        const perioderFraFreg = getBarnPerioder(opplysningFraFreg.perioder, virkningstidspunkt, barn.fødselsdato);
        updatedAndSave(perioderFraFreg);
        setShowResetButton(false);
    };

    const checkIfAnotherRowIsEdited = (index?: number) => {
        const editableRowIndex = editableRow.split(".")[1];
        return editableRowIndex && Number(editableRowIndex) !== index;
    };

    const showErrorModal = () => {
        setErrorMessage({
            title: "Fullfør redigering",
            text: "Det er en periode som er under redigering. Fullfør redigering eller slett periode.",
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
        const visningsnavn = toVisningsnavn(bostsatus);
        if (boststatusOver18År.includes(bostsatus)) {
            return `18 år: ${visningsnavn}`;
        }
        return visningsnavn;
    }

    const boforholdOptions = isOver18YearsOld(barn.fødselsdato)
        ? boforholdForskuddOptions.likEllerOver18År
        : boforholdForskuddOptions.under18År;

    return (
        <>
            {isOver18YearsOld(barn.fødselsdato) && (
                <div className="mb-4">
                    <StatefulAlert
                        variant="info"
                        size="small"
                        alertKey={"18åralert" + behandlingId + barn.ident}
                        className="w-fit"
                    >
                        <Heading spacing size="small" level="3">
                            Barn over 18 år
                        </Heading>
                        Barnet har fylt 18 år i løpet av perioden. Sjekk om bostatus til barnet er riktig
                    </StatefulAlert>
                </div>
            )}
            {errors?.root?.husstandsbarn?.[barnIndex]?.types && (
                <div className="mb-4">
                    <Alert variant="warning">
                        <Heading spacing size="small" level="3">
                            Feil i periodisering
                        </Heading>
                        {Object.values(errors.root.husstandsbarn[barnIndex].types).map((type: string) => (
                            <p key={type}>{type}</p>
                        ))}
                    </Alert>
                </div>
            )}
            {hasOpplysningerFraFolkeregistre && showResetButton && (
                <div className="flex justify-end mb-4">
                    <Button
                        variant="tertiary"
                        type="button"
                        size="small"
                        className="w-fit"
                        onClick={resetTilDataFraFreg}
                    >
                        Reset til data fra FREG
                    </Button>
                </div>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Status", "Kilde", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`}
                                        name={`husstandsbarn.${barnIndex}.perioder.${index}.datoFom`}
                                        label="Fra og med"
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
                                        label="Til og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        customValidation={() => validateFomOgTom(index)}
                                        fromDate={fom}
                                        toDate={lastDayOfMonth(deductMonths(new Date(), 1))}
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
                                        label="Status"
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
                                <BodyShort
                                    key={`husstandsbarn.${barnIndex}.perioder.${index}.kilde.placeholder`}
                                    className="capitalize"
                                >
                                    {KildeTexts[item.kilde]}
                                </BodyShort>,
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
                                index ? (
                                    <Button
                                        key={`delete-button-${barnIndex}-${index}`}
                                        type="button"
                                        onClick={() => onRemovePeriode(index)}
                                        icon={<TrashIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <div
                                        key={`delete-button-${barnIndex}-${index}.placeholder`}
                                        className="min-w-[40px]"
                                    ></div>
                                ),
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
                        Angre siste steg
                    </Button>
                )}
                <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                    + Legg til periode
                </Button>
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
