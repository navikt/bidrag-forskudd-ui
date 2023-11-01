import { ArrowUndoIcon, ClockDashedIcon, FloppydiskIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, Panel, Radio, RadioGroup, ReadMore, Search } from "@navikt/ds-react";
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import {
    BoStatusType,
    OpplysningerDto,
    OpplysningerType,
    RolleDtoRolleType,
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
import { FormControlledDatePicker } from "../formFields/FormControlledDatePicker";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FormControlledTextField } from "../formFields/FormControlledTextField";
import { FlexRow } from "../layout/grid/FlexRow";
import { FormLayout } from "../layout/grid/FormLayout";
import { ErrorModal } from "../modal/ErrorModal";
import { PersonNavn } from "../PersonNavn";
import { QueryErrorWrapper } from "../query-error-boundary/QueryErrorWrapper";
import { RolleTag } from "../RolleTag";
import { TableRowWrapper, TableWrapper } from "../table/TableWrapper";
import {
    calculateFraDato,
    checkOverlappingPeriods,
    compareOpplysninger,
    createInitialValues,
    editPeriods,
    getBarnPerioder,
    getBarnPerioderFromHusstandsListe,
    getSivilstandPerioder,
    mapHusstandsMedlemmerToBarn,
    syncSivilstandDates,
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
    const { behandlingId } = useForskudd();
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: boforhold } = useGetBoforhold(behandlingId);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const { data: boforoholdOpplysninger } = useGetOpplysninger(behandlingId, OpplysningerType.BOFORHOLD);
    const { mutation: saveOpplysninger } = useAddOpplysningerData(behandlingId, OpplysningerType.BOFORHOLD);
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const opplysningerFraFolkRegistre = {
        husstand: mapHusstandsMedlemmerToBarn(grunnlagspakke.husstandmedlemmerOgEgneBarnListe),
        sivilstand: grunnlagspakke.sivilstandListe,
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
        setOpplysningerChanges([]);
    };

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form>
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

const BarnIkkeMedIBehandling = ({ barnFieldArray, setValue, item, index }) => {
    const [val, setVal] = useState(item.foedselsDato ? "fritekst" : "dnummer");
    const [ident, setIdent] = useState("");
    const [error, setError] = useState(null);
    return (
        <div className="mt-4 mb-4">
            <FlexRow className="items-center p-3">
                <div>Barn</div>
                <div className="ml-auto self-end">
                    <Button
                        type="button"
                        onClick={() => barnFieldArray.remove(index)}
                        icon={<TrashIcon aria-hidden />}
                        variant="tertiary"
                        size="small"
                    >
                        Slett barn
                    </Button>
                </div>
            </FlexRow>

            <RadioGroup
                className="mb-4"
                size="small"
                legend=""
                value={val}
                onChange={(val) => {
                    setVal(val);
                    if (val === "fritekst") {
                        setValue(`husstandsBarn.${index}.ident`, "");
                        setValue(`husstandsBarn.${index}.navn`, "");
                        setIdent("");
                        setError(null);
                    } else {
                        setValue(`husstandsBarn.${index}.foedselsDato`, null);
                    }
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
                        error={error}
                        onChange={(val) => {
                            setValue(`husstandsBarn.${index}.ident`, val);
                            setIdent(val);
                        }}
                        onClear={() => {
                            setValue(`husstandsBarn.${index}.ident`, "");
                            setValue(`husstandsBarn.${index}.navn`, "");
                            setIdent("");
                            setError(null);
                        }}
                        onSearchClick={(value) => {
                            PERSON_API.informasjon
                                .hentPersonPost({ ident: value })
                                .then(({ data }) => {
                                    setValue(`husstandsBarn.${index}.navn`, data.navn);
                                    setError(null);
                                })
                                .catch(() => {
                                    setError(`Finner ikke person med ident: ${ident}`);
                                });
                        }}
                    />
                )}
                {val === "fritekst" && (
                    <FormControlledDatePicker
                        name={`husstandsBarn.${index}.foedselsDato`}
                        label="Fødselsdato"
                        placeholder="DD.MM.ÅÅÅÅ"
                        defaultValue={item?.foedselsdato}
                    />
                )}
                <FormControlledTextField name={`husstandsBarn.${index}.navn`} label="Navn" />
            </FlexRow>
        </div>
    );
};

const BarnPerioder = ({
    datoFom,
    opplysningerFraFolkRegistre,
    setErrorModalOpen,
}: {
    datoFom: Date | null;
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[] | SavedHustandOpplysninger[];
    setErrorModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const { control, setValue } = useFormContext<BoforholdFormValues>();
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

    const addBarn = () => {
        barnFieldArray.append({
            ident: "",
            medISaken: false,
            navn: "",
            foedselsDato: null,
            perioder: [
                {
                    datoFom: toISODateString(datoFom),
                    datoTom: null,
                    boStatus: "",
                    kilde: "manuelt",
                },
            ],
        });
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Panel className="p-0">
                        {item.medISaken && (
                            <div className="mb-8">
                                <div className="grid grid-cols-[max-content,auto] mb-2 p-2 bg-[#EFECF4]">
                                    <div className="w-max h-max">
                                        <RolleTag rolleType={RolleDtoRolleType.BARN} />
                                    </div>
                                    <div>
                                        <FlexRow className="items-center h-[27px]">
                                            <BodyShort size="small" className="font-bold">
                                                <PersonNavn ident={item.ident}></PersonNavn>
                                            </BodyShort>
                                            <BodyShort size="small">{item.ident}</BodyShort>
                                        </FlexRow>
                                    </div>
                                </div>
                                <div>
                                    <ReadMore header="Opplysninger fra Folkeregistret" size="small">
                                        <Opplysninger
                                            opplysninger={opplysningerFraFolkRegistre}
                                            datoFom={datoFom}
                                            ident={item.ident}
                                        />
                                    </ReadMore>
                                </div>
                            </div>
                        )}
                        {!item.medISaken && (
                            <BarnIkkeMedIBehandling
                                barnFieldArray={barnFieldArray}
                                item={item}
                                setValue={setValue}
                                index={index}
                            />
                        )}
                        <Perioder
                            barnIndex={index}
                            virkningstidspunkt={datoFom}
                            opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
                            setErrorModalOpen={setErrorModalOpen}
                        />
                    </Panel>
                </Fragment>
            ))}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addBarn}>
                + Legg til barn
            </Button>
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
    const [showUndoButton, setShowUndoButton] = useState(false);
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

    const [lastPeriodsState, setLastPeriodsState] = useState(getValues(`husstandsBarn.${barnIndex}.perioder`));

    const watchFieldArray = useWatch({ control, name: `husstandsBarn.${barnIndex}.perioder` });
    const controlledFields = barnPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });
    const fieldState = getFieldState(`husstandsBarn.${barnIndex}.perioder`);

    const onSaveRow = (index: number) => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`) as BarnPeriode[];
        console.log("perioderValues", perioderValues);
        if (perioderValues[index].datoFom === null) {
            setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "notValid",
                message: "Dato må fylles ut",
            });
        }
        const fieldState = getFieldState(`husstandsBarn.${barnIndex}.perioder.${index}`);
        console.log("fieldState", fieldState);

        if (!fieldState.error) {
            setEditableRow("");
            setValue(`husstandsBarn.${barnIndex}.perioder`, editPeriods(perioderValues, barnIndex, index));
            saveBoforhold(getValues());
        }
    };

    useEffect(() => {
        if (fieldState.isDirty) {
            setShowUndoButton(true);
        }
    }, [watchFieldArray, fieldState.isDirty]);

    const undoAction = () => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        setLastPeriodsState(perioderValues);
        setValue(`husstandsBarn.${barnIndex}.perioder`, lastPeriodsState);
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
        setLastPeriodsState(perioderValues);
        barnPerioder.append({
            datoFom: null,
            datoTom: null,
            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
            kilde: "manuelt",
        });
        setEditableRow(`${barnIndex}.${perioderValues.length}`);
        setShowUndoButton(true);
    };

    const onDateChange = () => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        setLastPeriodsState(perioderValues);
    };

    const onRemovePeriode = (index) => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        setLastPeriodsState(perioderValues);
        barnPerioder.remove(index);
        saveBoforhold(getValues());
        setShowUndoButton(true);
    };

    const resetTilDataFraFreg = () => {
        const barn = getValues(`husstandsBarn.${barnIndex}`);
        setLastPeriodsState(barn.perioder);
        const opplysningFraFreg = opplysningerFraFolkRegistre.find((opplysning) => opplysning.ident === barn.ident);
        setValue(
            `husstandsBarn.${barnIndex}.perioder`,
            getBarnPerioder(opplysningFraFreg.perioder, virkningstidspunkt)
        );
    };

    const onEditRow = (index: number) => {
        const editableRowIndex = editableRow.split(".")[1];

        if (!editableRowIndex) {
            setEditableRow(`${barnIndex}.${index}`);
        } else {
            const fieldState = getFieldState(`husstandsBarn.${barnIndex}.perioder.${Number(editableRowIndex)}`);

            if (fieldState.error) {
                setErrorModalOpen(true);
            } else {
                setEditableRow(`${barnIndex}.${index}`);
            }
        }
    };

    return (
        <>
            {showUndoButton && (
                <div className="my-4 grid justify-items-end">
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

const SivilistandPerioder = ({
    datoFom,
    setErrorModalOpen,
}: {
    datoFom: Date | null;
    setErrorModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const [fom, tom] = getFomAndTomForMonthPicker(datoFom);
    const {
        control,
        getValues,
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

    const validatePeriods = () => {
        const sivilstandPerioder = getValues("sivilstand");

        if (!sivilstandPerioder.length) {
            clearErrors("root.sivilstand");
            return;
        }

        const filtrertOgSorterListe = sivilstandPerioder
            .filter((periode) => periode.datoFom !== null)
            .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("root.sivilstand", {
                type: "overlappingPerioder",
                message: "Du har overlappende perioder",
            });
        }

        if (!overlappingPerioder?.length) {
            clearErrors("root.sivilstand");
        }
    };

    const onDateChange = (date: string | null, periodeIndex: number, field: "datoFom" | "datoTom") => {
        const perioderValues = getValues(`sivilstand`);
        syncSivilstandDates(perioderValues, date, periodeIndex, field, setValue);
        validatePeriods();
    };

    const addPeriode = () => {
        const sivilstandPerioderValues = getValues("sivilstand");
        sivilstandPerioder.append({
            datoFom: calculateFraDato(sivilstandPerioderValues, datoFom),
            datoTom: null,
            sivilstandType: SivilstandType.ENKE_ELLER_ENKEMANN,
        });
    };

    return (
        <>
            {errors?.root?.sivilstand && (
                <Alert variant="warning">
                    <BodyShort>{errors.root.sivilstand.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Sivilstand", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`sivilstand.${index}.datoFom`}
                                    name={`sivilstand.${index}.datoFom`}
                                    label="Periode"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    onChange={(date) => onDateChange(date, index, "datoFom")}
                                    customValidation={(date) => validateFomOgTom(date, index, "datoFom")}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    required
                                />,
                                <FormControlledMonthPicker
                                    key={`sivilstand.${index}.datoTom`}
                                    name={`sivilstand.${index}.datoTom`}
                                    label="Periode"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    onChange={(date) => onDateChange(date, index, "datoTom")}
                                    customValidation={(date) => validateFomOgTom(date, index, "datoTom")}
                                    fromDate={fom}
                                    toDate={tom}
                                    lastDayOfMonthPicker
                                    hideLabel
                                />,
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
                                />,
                                <Button
                                    key={`delete-button-${index}`}
                                    type="button"
                                    onClick={() => {
                                        sivilstandPerioder.remove(index);
                                        validatePeriods();
                                    }}
                                    icon={<TrashIcon aria-hidden />}
                                    variant="tertiary"
                                    size="small"
                                />,
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
