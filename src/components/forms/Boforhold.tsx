import { ArrowUndoIcon, ClockDashedIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
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
    TextField,
    VStack,
} from "@navikt/ds-react";
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useFieldArray, UseFieldArrayReturn, useForm, useFormContext, useWatch } from "react-hook-form";

import {
    BoStatusType,
    OpplysningerDto,
    OpplysningerType,
    RolleDtoRolleType,
    SivilstandDto,
    SivilstandType,
} from "../../api/BidragBehandlingApi";
import { PERSON_API } from "../../constants/api";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { BoStatusTexts } from "../../enum/BoStatusTexts";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { SivilstandTypeTexts } from "../../enum/SivilstandTypeTexts";
import {
    useAddOpplysningerData,
    useGetBehandling,
    useGetBoforhold,
    useGetOpplysninger,
    useGetVirkningstidspunkt,
    useGrunnlagspakke,
    useUpdateBoforhold,
} from "../../hooks/useApiData";
import { useDebounce } from "../../hooks/useDebounce";
import { useOnSaveBoforhold } from "../../hooks/useOnSaveBoforhold";
import {
    BarnPeriode,
    BoforholdFormValues,
    HusstandOpplysningFraFolkeRegistre,
    HusstandOpplysningPeriode,
    ParsedBoforholdOpplysninger,
    SavedHustandOpplysninger,
    SavedOpplysningFraFolkeRegistrePeriode,
} from "../../types/boforholdFormValues";
import {
    dateOrNull,
    DateToDDMMYYYYString,
    ISODateTimeStringToDDMMYYYYString,
    isValidDate,
    toISODateString,
} from "../../utils/date-utils";
import { DatePickerInput } from "../date-picker/DatePickerInput";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FlexRow } from "../layout/grid/FlexRow";
import { FormLayout } from "../layout/grid/FormLayout";
import { ErrorModal } from "../modal/ErrorModal";
import { PersonNavn } from "../PersonNavn";
import { QueryErrorWrapper } from "../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../RolleTag";
import { TableRowWrapper, TableWrapper } from "../table/TableWrapper";
import {
    calculateFraDato,
    compareOpplysninger,
    createInitialValues,
    editPeriods,
    editSivilstandPeriods,
    getBarnPerioder,
    getBarnPerioderFromHusstandsListe,
    getSivilstandPerioder,
    mapGrunnlagSivilstandToBehandlingSivilstandType,
    mapHusstandsMedlemmerToBarn,
} from "./helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "./helpers/virkningstidspunktHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const Opplysninger = ({
    opplysninger,
    datoFom,
    ident,
}: {
    opplysninger: Array<HusstandOpplysningFraFolkeRegistre | SavedHustandOpplysninger>;
    datoFom: Date | null;
    ident: string;
}) => {
    const perioder = opplysninger.find((opplysning) => opplysning.ident === ident)?.perioder as Array<
        HusstandOpplysningPeriode | SavedOpplysningFraFolkeRegistrePeriode
    >;
    return (
        <>
            {perioder
                ?.filter((periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(datoFom))
                .map((periode, index) => (
                    <div
                        key={`${periode.boStatus}-${index}`}
                        className="grid grid-cols-[70px,max-content,70px,auto] items-center gap-x-2"
                    >
                        <BodyShort size="small" className="flex justify-end">
                            {datoFom && new Date(periode.fraDato) < new Date(datoFom)
                                ? DateToDDMMYYYYString(datoFom)
                                : DateToDDMMYYYYString(new Date(periode.fraDato))}
                        </BodyShort>
                        <div>{"-"}</div>
                        <BodyShort size="small" className="flex justify-end">
                            {periode.tilDato ? DateToDDMMYYYYString(new Date(periode.tilDato)) : ""}
                        </BodyShort>
                        <BodyShort size="small">{BoStatusTexts[periode.boStatus]}</BodyShort>
                    </div>
                ))}
        </>
    );
};

const Main = ({
    opplysningerFraFolkRegistre,
    opplysningerChanges,
    updateOpplysninger,
    setErrorModalOpen,
    boforoholdOpplysninger,
}: {
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
    opplysningerChanges: string[];
    updateOpplysninger: () => void;
    setErrorModalOpen: Dispatch<SetStateAction<boolean>>;
    boforoholdOpplysninger: OpplysningerDto;
}) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues.virkningsDato);
    const datoFom = virkningstidspunkt ?? dateOrNull(behandling.datoFom);

    return (
        <>
            {opplysningerChanges.length > 0 && (
                <Alert variant="info">
                    <div className="flex items-center mb-4">
                        Nye opplysninger tilgjengelig. Sist hentet{" "}
                        {ISODateTimeStringToDDMMYYYYString(boforoholdOpplysninger.hentetDato)}
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
            <BarnPerioder
                datoFom={datoFom}
                opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
                setErrorModalOpen={setErrorModalOpen}
            />
            <Heading level="3" size="medium">
                Sivilstand
            </Heading>
            <SivilistandPerioder datoFom={datoFom} setErrorModalOpen={setErrorModalOpen} />
        </>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const { getValues, watch } = useFormContext<BoforholdFormValues>();
    const saveBoforhold = useOnSaveBoforhold();
    const onSave = () => saveBoforhold(getValues());
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.INNTEKT]);

    const debouncedOnSave = useDebounce(onSave);
    const textFields = ["boforholdBegrunnelseMedIVedtakNotat", "boforholdBegrunnelseKunINotat"];

    useEffect(() => {
        const subscription = watch((_, { name }) => {
            if (textFields.includes(name)) {
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
            <FormControlledTextarea
                name="boforholdBegrunnelseMedIVedtakNotat"
                label="Begrunnelse (med i vedtaket og notat)"
            />
            <FormControlledTextarea name="boforholdBegrunnelseKunINotat" label="Begrunnelse (kun med i notat)" />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const BoforholdsForm = () => {
    const { behandlingId, setBoforholdFormValues } = useForskudd();
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: boforhold } = useGetBoforhold(behandlingId);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const { data: boforoholdOpplysninger } = useGetOpplysninger(behandlingId, OpplysningerType.BOFORHOLD);
    const { mutation: saveOpplysninger } = useAddOpplysningerData(behandlingId, OpplysningerType.BOFORHOLD);
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const opplysningerFraFolkRegistre = {
        husstand: mapHusstandsMedlemmerToBarn(grunnlagspakke.husstandmedlemmerOgEgneBarnListe),
        sivilstand: mapGrunnlagSivilstandToBehandlingSivilstandType(grunnlagspakke.sivilstandListe),
    };
    const updateBoforhold = useUpdateBoforhold(behandlingId);
    const [opplysningerChanges, setOpplysningerChanges] = useState([]);
    const virkningsOrSoktFraDato =
        dateOrNull(virkningstidspunktValues?.virkningsDato) ?? dateOrNull(behandling?.datoFom);

    const initialValues = createInitialValues(boforhold, opplysningerFraFolkRegistre, virkningsOrSoktFraDato);
    const savedOpplysninger = boforoholdOpplysninger
        ? (JSON.parse(boforoholdOpplysninger.data) as ParsedBoforholdOpplysninger)
        : undefined;

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (initialValues) {
            setBoforholdFormValues(initialValues);
        }
    }, [initialValues]);

    useEffect(() => {
        if (savedOpplysninger) {
            const changesInOpplysninger = compareOpplysninger(savedOpplysninger, opplysningerFraFolkRegistre);

            if (changesInOpplysninger.length) {
                setOpplysningerChanges(changesInOpplysninger);
            }
        }

        if (!boforoholdOpplysninger) {
            saveOpplysninger.mutate({
                behandlingId,
                aktiv: true,
                opplysningerType: OpplysningerType.BOFORHOLD,
                data: JSON.stringify(opplysningerFraFolkRegistre),
                hentetDato: toISODateString(new Date()),
            });
        }
    }, []);

    const updateOpplysninger = () => {
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.BOFORHOLD,
            data: JSON.stringify(opplysningerFraFolkRegistre),
            hentetDato: toISODateString(new Date()),
        });

        const fieldValues = useFormMethods.getValues();
        const values = {
            ...fieldValues,
            husstandsBarn: getBarnPerioderFromHusstandsListe(
                opplysningerFraFolkRegistre.husstand,
                virkningsOrSoktFraDato
            ),
            sivilstand: getSivilstandPerioder(opplysningerFraFolkRegistre.sivilstand, virkningsOrSoktFraDato),
        };
        useFormMethods.reset(values);
        updateBoforhold.mutation.mutate(values);
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
                            <Main
                                opplysningerFraFolkRegistre={
                                    savedOpplysninger
                                        ? savedOpplysninger.husstand
                                        : opplysningerFraFolkRegistre.husstand
                                }
                                opplysningerChanges={opplysningerChanges}
                                updateOpplysninger={updateOpplysninger}
                                setErrorModalOpen={setErrorModalOpen}
                                boforoholdOpplysninger={boforoholdOpplysninger}
                            />
                        }
                        side={<Side />}
                    />
                    {errorModalOpen && (
                        <ErrorModal errorModalOpen={errorModalOpen} setErrorModalOpen={setErrorModalOpen} />
                    )}
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
    barnFieldArray: UseFieldArrayReturn<BoforholdFormValues, "husstandsBarn">;
}) => {
    const { boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [val, setVal] = useState("dnummer");
    const [ident, setIdent] = useState("");
    const [foedselsDato, setFoedselsDato] = useState(null);
    const [navn, setNavn] = useState("");
    const [error, setError] = useState(null);

    const validateForm = () => {
        let formErrors = { ...error };

        if (navn === "") {
            formErrors = { ...formErrors, navn: "Navn må fylles ut" };
        } else {
            delete formErrors.navn;
        }

        if (val === "fritekst") {
            if (!isValidDate(foedselsDato)) {
                formErrors = { ...formErrors, foedselsDato: "Dato er ikke gylid" };
            } else {
                delete formErrors.foedselsDato;
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

        const addedBarn = {
            ident: val === "dnummer" ? ident : "",
            medISaken: false,
            navn: navn,
            foedselsDato: val === "dnummer" ? "" : toISODateString(foedselsDato),
            perioder: [
                {
                    datoFom: toISODateString(datoFom),
                    datoTom: null,
                    boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                    kilde: "manuelt",
                },
            ],
        };
        const husstandsBarn = [...boforholdFormValues.husstandsBarn].concat(addedBarn);
        barnFieldArray.append(addedBarn);
        const updatedValues = {
            ...boforholdFormValues,
            husstandsBarn,
        };

        setBoforholdFormValues(updatedValues);
        saveBoforhold(updatedValues);
        setOpenAddBarnForm(false);
    };

    const onSearchClick = (value) => {
        PERSON_API.informasjon
            .hentPersonPost({ ident: value })
            .then(({ data }) => {
                setNavn(data.navn);
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
                        setFoedselsDato(null);
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
                            onChange={(value) => setFoedselsDato(value)}
                            defaultValue={null}
                            fieldValue={foedselsDato}
                            error={error?.foedselsDato}
                        />
                    )}
                    <TextField
                        name="navn"
                        label="Navn"
                        size="small"
                        value={navn}
                        onChange={(e) => setNavn(e.target.value)}
                        error={error?.navn}
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

const BarnPerioder = ({
    datoFom,
    opplysningerFraFolkRegistre,
    setErrorModalOpen,
}: {
    datoFom: Date;
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
    setErrorModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const [openAddBarnForm, setOpenAddBarnForm] = useState(false);
    const { control } = useFormContext<BoforholdFormValues>();
    const barnFieldArray = useFieldArray({
        control,
        name: "husstandsBarn",
    });
    const watchFieldArray = useWatch({ control, name: "husstandsBarn" });
    const controlledFields = barnFieldArray.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const onOpenAddBarnForm = () => {
        setOpenAddBarnForm(true);
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Box className="p-0">
                        <div className="mb-4">
                            <div className="grid grid-cols-[max-content,auto] mb-2 p-2 bg-[#EFECF4]">
                                <div className="w-max h-max">
                                    <RolleTag rolleType={RolleDtoRolleType.BARN} />
                                </div>
                                <div>
                                    <FlexRow className="items-center h-[27px]">
                                        <BodyShort size="small" className="font-bold">
                                            {item.medISaken && <PersonNavn ident={item.ident}></PersonNavn>}
                                            {!item.medISaken && item.navn}
                                        </BodyShort>
                                        <BodyShort size="small">{item.ident}</BodyShort>
                                    </FlexRow>
                                </div>
                            </div>
                            {item.ident !== "" && (
                                <div>
                                    <ReadMore header="Opplysninger fra Folkeregistret" size="small">
                                        <Opplysninger
                                            opplysninger={opplysningerFraFolkRegistre}
                                            datoFom={datoFom}
                                            ident={item.ident}
                                        />
                                    </ReadMore>
                                </div>
                            )}
                        </div>
                        <Perioder
                            barnIndex={index}
                            virkningstidspunkt={datoFom}
                            opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
                            setErrorModalOpen={setErrorModalOpen}
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
    virkningstidspunkt,
    opplysningerFraFolkRegistre,
    setErrorModalOpen,
}: {
    barnIndex: number;
    virkningstidspunkt: Date;
    opplysningerFraFolkRegistre: { ident: string; navn: string; perioder: any[] }[];
    setErrorModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const { boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const [showUndoButton, setShowUndoButton] = useState(false);
    const [showResetButton, setShowResetButton] = useState(false);
    const [editableRow, setEditableRow] = useState("");
    const [fom, tom] = getFomAndTomForMonthPicker(virkningstidspunkt);
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
        name: `husstandsBarn.${barnIndex}.perioder`,
    });
    const [lastPeriodsState, setLastPeriodsState] = useState([]);
    const watchFieldArray = useWatch({ control, name: `husstandsBarn.${barnIndex}.perioder` });
    const controlledFields = barnPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`) as BarnPeriode[];
        if (perioderValues[index].datoFom === null) {
            setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }
        const fieldState = getFieldState(`husstandsBarn.${barnIndex}.perioder.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editPeriods(perioderValues, index));
        }
    };

    const undoAction = () => {
        updatedAndSave(lastPeriodsState);
    };

    const updatedAndSave = (updatedPeriods: BarnPeriode[]) => {
        setLastPeriodsState(boforholdFormValues.husstandsBarn[barnIndex].perioder);
        const husstandsBarn = [...boforholdFormValues.husstandsBarn];
        husstandsBarn.splice(barnIndex, 1, {
            ...boforholdFormValues.husstandsBarn[barnIndex],
            perioder: updatedPeriods,
        });
        const updatedValues = {
            ...boforholdFormValues,
            husstandsBarn,
        };
        setBoforholdFormValues(updatedValues);
        setValue(`husstandsBarn.${barnIndex}.perioder`, updatedPeriods);
        saveBoforhold(updatedValues);
        setShowUndoButton(true);
        setShowResetButton(true);
        setEditableRow("");
    };

    const validateFomOgTom = (index: number) => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);

        const fomOgTomInvalid =
            perioderValues[index].datoTom !== null &&
            new Date(perioderValues[index].datoTom) < new Date(perioderValues[index].datoFom);
        if (fomOgTomInvalid) {
            setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: "Tom dato kan ikke være før fom dato",
            });
        } else {
            clearErrors(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`);
        }
    };

    const addPeriode = () => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        barnPerioder.append({
            datoFom: null,
            datoTom: null,
            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
            kilde: "manuelt",
        });
        setEditableRow(`${barnIndex}.${perioderValues.length}`);
    };

    const onRemovePeriode = (index) => {
        const updatedPeriods = boforholdFormValues.husstandsBarn[barnIndex].perioder.filter((_, i) => i !== index);
        updatedAndSave(updatedPeriods);
    };

    const resetTilDataFraFreg = () => {
        const barn = getValues(`husstandsBarn.${barnIndex}`);
        const opplysningFraFreg = opplysningerFraFolkRegistre.find((opplysning) => opplysning.ident === barn.ident);
        const perioderFraFreg = getBarnPerioder(opplysningFraFreg.perioder, virkningstidspunkt);
        updatedAndSave(perioderFraFreg);
        setShowResetButton(false);
    };

    const onEditRow = (index: number) => {
        const editableRowIndex = editableRow.split(".")[1];

        if (editableRowIndex && Number(editableRowIndex) !== index) {
            setErrorModalOpen(true);
        }

        if (!editableRowIndex) {
            setEditableRow(`${barnIndex}.${index}`);
        }
    };

    return (
        <>
            <div className="flex justify-between">
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
                {showResetButton && (
                    <Button
                        variant="tertiary"
                        type="button"
                        size="small"
                        className="w-fit"
                        onClick={resetTilDataFraFreg}
                    >
                        Reset til data fra FREG
                    </Button>
                )}
            </div>

            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Status", "Kilde", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`}
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
                                    <BodyShort key={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom.placeholder`}>
                                        {item.datoFom && DateToDDMMYYYYString(dateOrNull(item.datoFom))}
                                    </BodyShort>
                                ),
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`}
                                        label="Til og med"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        customValidation={() => validateFomOgTom(index)}
                                        fromDate={fom}
                                        toDate={tom}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom.placeholder`}>
                                        {item.datoTom && DateToDDMMYYYYString(dateOrNull(item.datoTom))}
                                    </BodyShort>
                                ),
                                editableRow === `${barnIndex}.${index}` ? (
                                    <FormControlledSelectField
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`}
                                        className="w-fit"
                                        label="Status"
                                        options={Object.entries(BoStatusType).map(([value, text]) => ({
                                            value,
                                            text: BoStatusTexts[text],
                                        }))}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus.placeholder`}
                                    >
                                        {BoStatusTexts[item.boStatus]}
                                    </BodyShort>
                                ),
                                <BodyShort
                                    key={`husstandsBarn.${barnIndex}.perioder.${index}.kilde.placeholder`}
                                    className="capitalize"
                                >
                                    {item.kilde}
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
            <div className="my-4 grid gap-4">
                <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                    + Legg til periode
                </Button>
            </div>
        </>
    );
};

const SivilistandPerioder = ({
    datoFom,
    setErrorModalOpen,
}: {
    datoFom: Date | null;
    setErrorModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const { boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const saveBoforhold = useOnSaveBoforhold();
    const [editableRow, setEditableRow] = useState(null);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFom);
    const {
        control,
        getValues,
        getFieldState,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const sivilstandPerioder = useFieldArray({
        control,
        name: `sivilstand`,
    });

    const watchFieldArray = useWatch({ control, name: `sivilstand` });
    const controlledFields = sivilstandPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const validateFomOgTom = (date, index, field) => {
        const sivilstandPerioder = getValues("sivilstand");
        const fomOgTomInvalid =
            field === "datoFom"
                ? sivilstandPerioder[index].datoTom && date > sivilstandPerioder[index].datoTom
                : sivilstandPerioder[index].datoFom && date < sivilstandPerioder[index].datoFom;

        if (fomOgTomInvalid) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`sivilstand.${index}.datoFom`);
        }
    };
    const addPeriode = () => {
        const sivilstandPerioderValues = getValues("sivilstand");
        sivilstandPerioder.append({
            datoFom: calculateFraDato(sivilstandPerioderValues, datoFom),
            datoTom: null,
            sivilstandType: SivilstandType.BOR_ALENE_MED_BARN,
        });
        setEditableRow(sivilstandPerioderValues.length);
    };

    const updatedAndSave = (sivilstand: SivilstandDto[]) => {
        const updatedValues = {
            ...boforholdFormValues,
            sivilstand,
        };
        setBoforholdFormValues(updatedValues);
        setValue(`sivilstand`, sivilstand);
        saveBoforhold(updatedValues);
        setEditableRow(null);
    };

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`sivilstand`);
        if (perioderValues[index].datoFom === null) {
            setError(`sivilstand.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }
        const fieldState = getFieldState(`sivilstand.${index}`);
        if (!fieldState.error) {
            updatedAndSave(editSivilstandPeriods(perioderValues, index));
        }
    };

    const onEditRow = (index: number) => {
        if (editableRow && Number(editableRow) !== index) {
            setErrorModalOpen(true);
        }

        if (!editableRow) {
            setEditableRow(index);
        }
    };

    return (
        <>
            {errors?.root?.sivilstand && (
                <Alert variant="warning">
                    <BodyShort>{errors.root.sivilstand.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Sivilstand", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                editableRow === index ? (
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.datoFom`}
                                        name={`sivilstand.${index}.datoFom`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoFom}
                                        customValidation={(date) => validateFomOgTom(date, index, "datoFom")}
                                        fromDate={fom}
                                        toDate={tom}
                                        hideLabel
                                        required
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.datoFom.placeholder`}>
                                        {item.datoFom && DateToDDMMYYYYString(dateOrNull(item.datoFom))}
                                    </BodyShort>
                                ),
                                editableRow === index ? (
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.datoTom`}
                                        name={`sivilstand.${index}.datoTom`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        customValidation={(date) => validateFomOgTom(date, index, "datoTom")}
                                        fromDate={fom}
                                        toDate={tom}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.datoTom.placeholder`}>
                                        {item.datoTom && DateToDDMMYYYYString(dateOrNull(item.datoTom))}
                                    </BodyShort>
                                ),
                                editableRow === index ? (
                                    <FormControlledSelectField
                                        key={`sivilstand.${index}.sivilstandType`}
                                        name={`sivilstand.${index}.sivilstandType`}
                                        label="Sivilstand"
                                        className="w-52"
                                        options={Object.entries(SivilstandType).map((entry) => ({
                                            value: entry[0],
                                            text: SivilstandTypeTexts[entry[0]],
                                        }))}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`sivilstand.${index}.sivilstandType.placeholder`}>
                                        {SivilstandTypeTexts[item.sivilstandType]}
                                    </BodyShort>
                                ),
                                editableRow === index ? (
                                    <Button
                                        key={`save-button-${index}`}
                                        type="button"
                                        onClick={() => onSaveRow(index)}
                                        icon={<FloppydiskIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <Button
                                        key={`edit-button-${index}`}
                                        type="button"
                                        onClick={() => onEditRow(index)}
                                        icon={<PencilIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ),
                                index ? (
                                    <Button
                                        key={`delete-button-${index}`}
                                        type="button"
                                        onClick={() => {
                                            sivilstandPerioder.remove(index);
                                        }}
                                        icon={<TrashIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <div key={`delete-button-${index}.placeholder`} className="min-w-[40px]"></div>
                                ),
                            ]}
                        />
                    ))}
                </TableWrapper>
            )}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                + Legg til periode
            </Button>
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
