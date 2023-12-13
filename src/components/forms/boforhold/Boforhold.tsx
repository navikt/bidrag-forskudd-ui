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
    TextField,
    VStack,
} from "@navikt/ds-react";
import React, { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useFieldArray, UseFieldArrayReturn, useForm, useFormContext, useWatch } from "react-hook-form";

import {
    Bostatuskode,
    HusstandsBarnPeriodeDto,
    Kilde,
    OpplysningerDto,
    OpplysningerType,
    RolleDtoRolleType,
} from "../../../api/BidragBehandlingApi";
import { PersonDto } from "../../../api/PersonApi";
import { PERSON_API } from "../../../constants/api";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { KildeTexts } from "../../../enum/KildeTexts";
import {
    useAddOpplysningerData,
    useGetBehandling,
    useGetBoforhold,
    useGetOpplysninger,
    useGetVirkningstidspunkt,
    useGrunnlagspakke,
    useUpdateBoforhold,
} from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { useOnSaveBoforhold } from "../../../hooks/useOnSaveBoforhold";
import useVisningsnavn from "../../../hooks/useVisningsnavn";
import {
    BoforholdFormValues,
    HusstandOpplysningFraFolkeRegistre,
    HusstandOpplysningPeriode,
    ParsedBoforholdOpplysninger,
    SavedHustandOpplysninger,
    SavedOpplysningFraFolkeRegistrePeriode,
} from "../../../types/boforholdFormValues";
import {
    dateOrNull,
    DateToDDMMYYYYString,
    isAfterDate,
    ISODateTimeStringToDDMMYYYYString,
    toDateString,
    toISODateString,
} from "../../../utils/date-utils";
import { DatePickerInput } from "../../date-picker/DatePickerInput";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FlexRow } from "../../layout/grid/FlexRow";
import { FormLayout } from "../../layout/grid/FormLayout";
import { PersonNavn } from "../../PersonNavn";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../../RolleTag";
import { TableRowWrapper, TableWrapper } from "../../table/TableWrapper";
import {
    boforholdForskuddOptions,
    compareOpplysninger,
    createInitialValues,
    editPeriods,
    getBarnPerioder,
    getBarnPerioderFromHusstandsListe,
    getEitherFirstDayOfFoedselsOrVirkingsdatoMonth,
    getSivilstandPerioder,
    mapGrunnlagSivilstandToBehandlingSivilstandType,
    mapHusstandsMedlemmerToBarn,
    removeAndEditPeriods,
} from "../helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "../helpers/virkningstidspunktHelpers";
import { ActionButtons } from "../inntekt/ActionButtons";
import { Sivilstand } from "./Sivilstand";

const Opplysninger = ({
    opplysninger,
    datoFom,
    ident,
}: {
    opplysninger: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
    datoFom: Date | null;
    ident: string;
}) => {
    const toVisningsnavn = useVisningsnavn();
    const perioder = opplysninger.find((opplysning) => opplysning.ident === ident)?.perioder as
        | HusstandOpplysningPeriode[]
        | SavedOpplysningFraFolkeRegistrePeriode[];
    return (
        <>
            {perioder
                ?.filter((periode) => periode.tilDato === null || isAfterDate(periode.tilDato, datoFom))
                .map((periode, index) => (
                    <div
                        key={`${periode.bostatus}-${index}`}
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
                        <BodyShort size="small">{toVisningsnavn(periode.bostatus)}</BodyShort>
                    </div>
                ))}
        </>
    );
};

const Main = ({
    opplysningerFraFolkRegistre,
    opplysningerChanges,
    updateOpplysninger,
    boforoholdOpplysninger,
}: {
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
    opplysningerChanges: string[];
    updateOpplysninger: () => void;
    boforoholdOpplysninger: OpplysningerDto;
}) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues.virkningsdato);
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
            <BarnPerioder datoFom={datoFom} opplysningerFraFolkRegistre={opplysningerFraFolkRegistre} />
            <Sivilstand datoFom={datoFom} />
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
    const isSavedInitialOpplysninger = useRef(false);
    const [opplysningerChanges, setOpplysningerChanges] = useState([]);
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: boforhold } = useGetBoforhold(behandlingId);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const { data: boforoholdOpplysninger } = useGetOpplysninger(behandlingId, OpplysningerType.BOFORHOLD_BEARBEIDET);
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const { mutation: saveOpplysninger } = useAddOpplysningerData(behandlingId);
    const { mutation: updateBoforhold } = useUpdateBoforhold(behandlingId);
    const opplysningerFraFolkRegistre = useMemo(
        () => ({
            husstand: mapHusstandsMedlemmerToBarn(grunnlagspakke.husstandmedlemmerOgEgneBarnListe),
            sivilstand: mapGrunnlagSivilstandToBehandlingSivilstandType(grunnlagspakke.sivilstandListe),
        }),
        [grunnlagspakke.husstandmedlemmerOgEgneBarnListe, grunnlagspakke.sivilstandListe]
    );
    const virkningsOrSoktFraDato = useMemo(
        () => dateOrNull(virkningstidspunktValues?.virkningsdato) ?? dateOrNull(behandling?.datoFom),
        [virkningstidspunktValues?.virkningsdato, behandling?.datoFom]
    );
    const initialValues = useMemo(
        () => createInitialValues(boforhold, opplysningerFraFolkRegistre, virkningsOrSoktFraDato),
        [boforhold, opplysningerFraFolkRegistre, virkningsOrSoktFraDato]
    );
    const savedOpplysninger = boforoholdOpplysninger
        ? (JSON.parse(boforoholdOpplysninger.data) as ParsedBoforholdOpplysninger)
        : undefined;

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (savedOpplysninger) {
            const changesInOpplysninger = compareOpplysninger(savedOpplysninger, opplysningerFraFolkRegistre);

            if (changesInOpplysninger.length) {
                setOpplysningerChanges(changesInOpplysninger);
            }
        }

        if (!boforoholdOpplysninger && !isSavedInitialOpplysninger.current) {
            lagreAlleOpplysninger();
        }

        isSavedInitialOpplysninger.current = true;

        setBoforholdFormValues(initialValues);
    }, []);

    const lagreAlleOpplysninger = () => {
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.BOFORHOLD_BEARBEIDET,
            data: JSON.stringify(opplysningerFraFolkRegistre),
            hentetDato: toISODateString(new Date()),
        });

        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.HUSSTANDSMEDLEMMER,
            data: JSON.stringify(grunnlagspakke.husstandmedlemmerOgEgneBarnListe),
            hentetDato: toISODateString(new Date()),
        });
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.SIVILSTAND,
            data: JSON.stringify(grunnlagspakke.sivilstandListe),
            hentetDato: toISODateString(new Date()),
        });
    };
    const updateOpplysninger = () => {
        lagreAlleOpplysninger();

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
        updateBoforhold.mutate(values);
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
                                boforoholdOpplysninger={boforoholdOpplysninger}
                            />
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
    barnFieldArray: UseFieldArrayReturn<BoforholdFormValues, "husstandsBarn">;
}) => {
    const { boforholdFormValues, setBoforholdFormValues } = useForskudd();
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

        const addedBarn = {
            ident: val === "dnummer" ? ident : "",
            medISak: false,
            navn: navn,
            foedselsdato: val === "dnummer" ? person.fødselsdato : toISODateString(foedselsdato),
            perioder: [
                {
                    datoFom: toISODateString(datoFom),
                    datoTom: null,
                    bostatus: Bostatuskode.MED_FORELDER,
                    kilde: Kilde.MANUELL,
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
}: {
    datoFom: Date;
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
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
                                            {item.medISak && <PersonNavn ident={item.ident}></PersonNavn>}
                                            {!item.medISak && item.navn}
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
                            foedselsdato={item.foedselsdato}
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
    const toVisningsnavn = useVisningsnavn();

    const [showResetButton, setShowResetButton] = useState(false);
    const [editableRow, setEditableRow] = useState("");
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(foedselsdato, virkningstidspunkt);
    const [fom, tom] = getFomAndTomForMonthPicker(datoFra);
    const saveBoforhold = useOnSaveBoforhold();
    const { control, getValues, clearErrors, setError, setValue, getFieldState } =
        useFormContext<BoforholdFormValues>();
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
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`) as HusstandsBarnPeriodeDto[];
        if (perioderValues[index].datoFom === null) {
            setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }

        if (perioderValues[index].datoTom !== undefined && perioderValues[index].datoTom !== null) {
            const laterPeriodExists = perioderValues
                .filter((_periode, i) => i !== index)
                .some(
                    (periode) =>
                        periode.datoTom === null ||
                        new Date(periode.datoTom).getTime() >= new Date(perioderValues[index].datoTom).getTime()
                );

            if (!laterPeriodExists) {
                setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`, {
                    type: "notValid",
                    message: "Det er ingen løpende status i beregningen",
                });
            }

            if (laterPeriodExists) {
                const fieldState = getFieldState(`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`);
                if (fieldState.error && fieldState.error.message === "Det må være minst en løpende periode") {
                    clearErrors(`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`);
                }
            }
        }

        const periods = editPeriods(perioderValues, index);
        const firstDayOfCurrentMonth = firstDayOfMonth(new Date());
        const virkningsDatoIsInFuture = isAfterDate(datoFra, firstDayOfCurrentMonth);
        const futurePeriodExists = periods.some((periode) =>
            virkningsDatoIsInFuture
                ? isAfterDate(periode.datoFom, datoFra)
                : isAfterDate(periode.datoFom, firstDayOfCurrentMonth)
        );

        if (futurePeriodExists) {
            setErrorMessage({ title: "Feil i periodisering", text: "Det kan ikke periodiseres fremover i tid." });
            setErrorModalOpen(true);
            return;
        }

        const firstPeriodIsNotFromVirkningsTidspunkt = isAfterDate(periods[0].datoFom, datoFra);

        if (firstPeriodIsNotFromVirkningsTidspunkt) {
            setErrorMessage({
                title: "Feil i periodisering",
                text: `Det er perioder i beregningen uten status. Legg til en eller flere perioder som dekker periode fra ${toDateString(
                    datoFra
                )} til ${toDateString(new Date(periods[0].datoFom))}`,
            });
            setErrorModalOpen(true);
            return;
        }

        const fieldState = getFieldState(`husstandsBarn.${barnIndex}.perioder.${index}`);
        if (!fieldState.error) {
            updatedAndSave(periods);
        }
    };

    const undoAction = () => {
        updatedAndSave(lastPeriodsState);
    };

    const updatedAndSave = (updatedPeriods: HusstandsBarnPeriodeDto[]) => {
        setLastPeriodsState(boforholdFormValues.husstandsBarn[barnIndex].perioder);
        const husstandsBarn = boforholdFormValues.husstandsBarn.toSpliced(barnIndex, 1, {
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
            isAfterDate(perioderValues[index].datoFom, perioderValues[index].datoTom);

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
        if (checkIfAnotherRowIsEdited()) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
            barnPerioder.append({
                datoFom: null,
                datoTom: null,
                bostatus: Bostatuskode.MED_FORELDER,
                kilde: Kilde.MANUELL,
            });
            setEditableRow(`${barnIndex}.${perioderValues.length}`);
        }
    };

    const onRemovePeriode = (index: number) => {
        if (checkIfAnotherRowIsEdited(index)) {
            showErrorModal();
        } else {
            const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`) as HusstandsBarnPeriodeDto[];
            const updatedPeriods = removeAndEditPeriods(perioderValues, index);
            updatedAndSave(updatedPeriods);
        }
    };

    const resetTilDataFraFreg = () => {
        const barn = getValues(`husstandsBarn.${barnIndex}`);
        const opplysningFraFreg = opplysningerFraFolkRegistre.find((opplysning) => opplysning.ident === barn.ident);
        const perioderFraFreg = getBarnPerioder(opplysningFraFreg.perioder, virkningstidspunkt, barn.foedselsdato);
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
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.bostatus`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.bostatus`}
                                        className="w-fit"
                                        label="Status"
                                        options={boforholdForskuddOptions.under18År.map((value) => ({
                                            value,
                                            text: toVisningsnavn(value.toString()),
                                        }))}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.bostatus.placeholder`}
                                    >
                                        {toVisningsnavn(item.bostatus)}
                                    </BodyShort>
                                ),
                                <BodyShort
                                    key={`husstandsBarn.${barnIndex}.perioder.${index}.kilde.placeholder`}
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
            <div className="my-4 grid gap-4">
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
