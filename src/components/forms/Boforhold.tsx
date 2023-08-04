import { TrashIcon } from "@navikt/aksel-icons";
import {
    Alert,
    BodyShort,
    Button,
    Heading,
    Loader,
    Panel,
    Radio,
    RadioGroup,
    ReadMore,
    Search,
} from "@navikt/ds-react";
import React, { Fragment, Suspense, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { RolleType, SivilstandType } from "../../api/BidragBehandlingApi";
import { PERSON_API } from "../../constants/api";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { BoStatusUI } from "../../enum/BoStatus";
import { BoStatusTexts } from "../../enum/BoStatusTexts";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { SivilstandTypeTexts } from "../../enum/SivilstandTypeTexts";
import {
    useGetBehandling,
    useGetBoforhold,
    useGetBoforoholdOpplysninger,
    useGetVirkningstidspunkt,
    useGrunnlagspakke,
    useUpdateBoforhold,
} from "../../hooks/useApiData";
import { useDebounce } from "../../hooks/useDebounce";
import { BoforholdFormValues } from "../../types/boforholdFormValues";
import { dateOrNull, DateToDDMMYYYYString, isValidDate } from "../../utils/date-utils";
import { DatePickerInput } from "../date-picker/DatePickerInput";
import { FormControlledMonthPicker } from "../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../formFields/FormControlledTextArea";
import { FormControlledTextField } from "../formFields/FormControlledTextField";
import { FlexRow } from "../layout/grid/FlexRow";
import { FormLayout } from "../layout/grid/FormLayout";
import { PersonNavn } from "../PersonNavn";
import { RolleTag } from "../RolleTag";
import { TableRowWrapper, TableWrapper } from "../table/TableWrapper";
import {
    calculateFraDato,
    checkOverlappingPeriods,
    createInitialValues,
    createPayload,
    mapHusstandsMedlemmerToBarn,
    syncDates,
} from "./helpers/boforholdFormHelpers";
import { getFomAndTomForMonthPicker } from "./helpers/virkningstidspunktHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const Opplysninger = ({ opplysninger, datoFom, ident }) => {
    const perioder = opplysninger.find((opplysning) => opplysning.ident === ident).perioder;
    return perioder
        .filter((periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(datoFom))
        .map((periode, index) => (
            <div
                key={`${periode.boStatus}-${index}`}
                className="grid grid-cols-[70px,max-content,70px,auto] items-center gap-x-2"
            >
                <BodyShort size="small" className="flex justify-end">
                    {new Date(periode.fraDato) < new Date(datoFom)
                        ? DateToDDMMYYYYString(datoFom)
                        : DateToDDMMYYYYString(periode.fraDato)}
                </BodyShort>
                <div>{"-"}</div>
                <BodyShort size="small" className="flex justify-end">
                    {periode.tilDato ? DateToDDMMYYYYString(periode.tilDato) : ""}
                </BodyShort>
                <BodyShort size="small">{BoStatusTexts[periode.boStatus]}</BodyShort>
            </div>
        ));
};

const Main = ({
    opplysningerFraFolkRegistre,
}: {
    opplysningerFraFolkRegistre: { ident: string; navn: string; perioder: any[] }[];
}) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues.virkningsDato);
    const datoFom = virkningstidspunkt ?? dateOrNull(behandling.datoFom);

    return (
        <>
            {!isValidDate(virkningstidspunkt) && <Alert variant="warning">Mangler virkningstidspunkt</Alert>}
            <Heading level="3" size="medium">
                Barn
            </Heading>
            <BarnPerioder datoFom={datoFom} opplysningerFraFolkRegistre={opplysningerFraFolkRegistre} />
            <Heading level="3" size="medium">
                Sivilstand
            </Heading>
            <SivilistandPerioder virkningstidspunkt={virkningstidspunkt} />
        </>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.INNTEKT]);

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
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: boforhold } = useGetBoforhold(behandlingId);
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const { data: boforoholdOpplysninger } = useGetBoforoholdOpplysninger(behandlingId);
    const channel = new BroadcastChannel("boforhold");
    const opplysningerFraFolkRegistre = mapHusstandsMedlemmerToBarn(grunnlagspakke.husstandmedlemmerOgEgneBarnListe);

    const updateBoforhold = useUpdateBoforhold(behandlingId);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues?.virkningsDato);
    const datoFom = virkningstidspunkt ?? dateOrNull(behandling.datoFom);

    const initialValues = createInitialValues(
        behandling,
        boforhold,
        opplysningerFraFolkRegistre,
        datoFom,
        grunnlagspakke,
        !!boforoholdOpplysninger?.data
    );

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const watchAllFields = useWatch({ control: useFormMethods.control });

    useEffect(() => {
        channel.postMessage(JSON.stringify(watchAllFields));
    }, [watchAllFields]);

    const onSave = () => {
        const values = useFormMethods.getValues();
        updateBoforhold.mutation.mutate(createPayload(values), {
            onSuccess: () =>
                useFormMethods.reset(values, { keepValues: true, keepErrors: true, keepDefaultValues: true }),
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        if (useFormMethods.formState.isDirty) {
            debouncedOnSave();
        }
    }, [watchAllFields, useFormMethods.formState.isDirty]);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout
                        title="Boforhold"
                        main={<Main opplysningerFraFolkRegistre={opplysningerFraFolkRegistre} />}
                        side={<Side />}
                    />
                </form>
            </FormProvider>
        </>
    );
};

const BarnIkkeMedIBehandling = ({ barnFieldArray, controlledFields, setValue, index }) => {
    const [val, setVal] = useState("dnummer");
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

            <RadioGroup className="mb-4" size="small" legend="" value={val} onChange={(val) => setVal(val)}>
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
                        onClear={() => {
                            // TODO nulstil alt for barnet
                            setValue(`behandlingBarn.${index}.ident`, null);
                            setValue(`behandlingBarn.${index}.navn`, null);
                        }}
                        onSearchClick={(value) => {
                            PERSON_API.informasjon
                                .hentPersonPost({ ident: value })
                                .then(({ data }) => {
                                    setValue(`behandlingBarn.${index}.ident`, value);
                                    setValue(`behandlingBarn.${index}.navn`, data.navn);
                                })
                                .catch((r) => {
                                    // TODO -> LEGG TIL BARNET MANUELT
                                });
                        }}
                    />
                )}
                {val === "fritekst" && (
                    <DatePickerInput
                        label="Fødselsdato"
                        placeholder="DD.MM.ÅÅÅÅ"
                        onChange={(value) => console.log(value)}
                    />
                )}
                <FormControlledTextField name={`behandlingBarn.${index}.navn`} label="Navn" />
            </FlexRow>
        </div>
    );
};

const BarnPerioder = ({
    datoFom,
    opplysningerFraFolkRegistre,
}: {
    datoFom: Date | null;
    opplysningerFraFolkRegistre: { ident: string; navn: string; perioder: any[] }[];
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
            ident: null,
            medISaken: false,
            navn: null,
            perioder: [
                {
                    datoFom: datoFom,
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
                                        <RolleTag rolleType={RolleType.BARN} />
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
                                controlledFields={controlledFields}
                                setValue={setValue}
                                index={index}
                            />
                        )}
                        <Perioder barnIndex={index} virkningstidspunkt={datoFom} />
                    </Panel>
                </Fragment>
            ))}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addBarn}>
                + Legg til barn
            </Button>
        </>
    );
};

const Perioder = ({ barnIndex, virkningstidspunkt }: { barnIndex: number; virkningstidspunkt: Date }) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(behandling.datoFom));
    const {
        control,
        getValues,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<BoforholdFormValues>();
    const barnPerioder = useFieldArray({
        control,
        name: `husstandsBarn.${barnIndex}.perioder`,
    });

    const watchFieldArray = useWatch({ control, name: `husstandsBarn.${barnIndex}.perioder` });
    const controlledFields = barnPerioder.fields.map((field, index) => {
        return {
            ...field,
            ...watchFieldArray[index],
        };
    });

    const validateFomOgTom = (date: Date | null, index: number, field: "datoFom" | "datoTom") => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        const fomOgTomInvalid =
            field === "datoFom"
                ? perioderValues[index].datoTom && (date === null || date > perioderValues[index].datoTom)
                : perioderValues[index].datoFom && date && date < perioderValues[index].datoFom;

        if (fomOgTomInvalid) {
            setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`);
        }
    };

    const validatePeriods = () => {
        const perioder = getValues(`husstandsBarn.${barnIndex}.perioder`);

        if (!perioder.length) {
            clearErrors(`root.${barnIndex}-boforhold`);
            return;
        }
        const filtrertOgSorterListe = perioder
            .filter((periode) => periode.datoFom !== null)
            .sort((a, b) => a.datoFom.getTime() - b.datoFom.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError(`root.${barnIndex}-boforhold`, {
                type: "overlappingPerioder",
                message: "Du har overlappende perioder",
            });
        }

        if (!overlappingPerioder?.length) {
            clearErrors(`root.${barnIndex}-boforhold`);
        }
    };

    const addPeriode = () => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        const datoFom = calculateFraDato(perioderValues, virkningstidspunkt);
        barnPerioder.append({
            datoFom,
            datoTom: null,
            boStatus: "",
            kilde: "manuelt",
        });
    };

    const syncAndValidateDates = (date: Date | null, periodeIndex: number, field: "datoFom" | "datoTom") => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        syncDates(perioderValues, date, barnIndex, periodeIndex, field, setValue);
        validatePeriods();
        validateFomOgTom(date, periodeIndex, field);
    };

    return (
        <>
            {errors?.root && errors.root[`${barnIndex}-boforhold`]?.type === "overlappingPerioder" && (
                <Alert variant="warning" className="mb-4">
                    <BodyShort>{errors.root[`${barnIndex}-boforhold`].message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Status", "Kilde", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <FormControlledMonthPicker
                                    key={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`}
                                    name={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`}
                                    label="Fra og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoFom}
                                    onChange={(date) => syncAndValidateDates(date, index, "datoFom")}
                                    fromDate={fom}
                                    toDate={tom}
                                    hideLabel
                                    required
                                />,
                                <FormControlledMonthPicker
                                    key={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`}
                                    name={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`}
                                    label="Til og med"
                                    placeholder="DD.MM.ÅÅÅÅ"
                                    defaultValue={item.datoTom}
                                    onChange={(date) => syncAndValidateDates(date, index, "datoTom")}
                                    fromDate={fom}
                                    toDate={tom}
                                    lastDayOfMonthPicker
                                    hideLabel
                                />,
                                <FormControlledSelectField
                                    key={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`}
                                    name={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`}
                                    className="w-fit"
                                    label="Status"
                                    options={[{ value: "", text: "Velg status" }].concat(
                                        Object.entries(BoStatusUI).map(([value, text]) => ({
                                            value,
                                            text: BoStatusTexts[text],
                                        }))
                                    )}
                                    hideLabel
                                />,
                                <BodyShort
                                    key={`husstandsBarn.${barnIndex}.perioder.${index}.kilde.placeholder`}
                                    className="capitalize"
                                >
                                    {item.kilde}
                                </BodyShort>,
                                index ? (
                                    <Button
                                        key={`delete-button-${barnIndex}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            barnPerioder.remove(index);
                                            validatePeriods();
                                        }}
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
            <div className="p-3">
                <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addPeriode}>
                    + Legg til periode
                </Button>
            </div>
        </>
    );
};

const SivilistandPerioder = ({ virkningstidspunkt }: { virkningstidspunkt: Date | null }) => {
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const [fom, tom] = getFomAndTomForMonthPicker(new Date(behandling.datoFom));
    const {
        control,
        getValues,
        clearErrors,
        setError,
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
            field === "fraDato"
                ? sivilstandPerioder[index].datoTom && date > sivilstandPerioder[index].datoTom
                : sivilstandPerioder[index].gyldigFraOgMed && date < sivilstandPerioder[index].gyldigFraOgMed;

        if (fomOgTomInvalid) {
            setError(`sivilstand.${index}.gyldigFraOgMed`, {
                type: "datesNotValid",
                message: "Fom dato kan ikke være før tom dato",
            });
        } else {
            clearErrors(`sivilstand.${index}.gyldigFraOgMed`);
        }
    };

    const validatePeriods = () => {
        const sivilstandPerioder = getValues("sivilstand");

        if (!sivilstandPerioder.length) {
            clearErrors("sivilstand");
            return;
        }
        const filtrertOgSorterListe = sivilstandPerioder
            .filter((periode) => periode.gyldigFraOgMed !== null)
            .sort((a, b) => a.gyldigFraOgMed.getTime() - b.gyldigFraOgMed.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError("sivilstand", {
                type: "overlappingPerioder",
                message: "Du har overlappende perioder",
            });
        }

        if (!overlappingPerioder?.length) {
            clearErrors("sivilstand");
        }
    };

    const addPeriode = () => {
        const sivilstandPerioderValues = getValues("sivilstand");
        sivilstandPerioder.append({
            gyldigFraOgMed: calculateFraDato(sivilstandPerioderValues, virkningstidspunkt),
            datoTom: null,
            sivilstandType: SivilstandType.ENKE_ELLER_ENKEMANN,
        });
    };

    return (
        <>
            {errors?.sivilstand?.type === "overlappingPerioder" && (
                <Alert variant="warning">
                    <BodyShort>{errors.sivilstand.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Periode", "Sivilstand", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                <div className="flex gap-x-4">
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.gyldigFraOgMed`}
                                        name={`sivilstand.${index}.gyldigFraOgMed`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.gyldigFraOgMed}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "gyldigFraOgMed");
                                        }}
                                        fromDate={fom}
                                        toDate={tom}
                                        hideLabel
                                    />
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.datoTom`}
                                        name={`sivilstand.${index}.datoTom`}
                                        label="Periode"
                                        placeholder="DD.MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "datoTom");
                                        }}
                                        fromDate={fom}
                                        toDate={tom}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                </div>,
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
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <BoforholdsForm />
        </Suspense>
    );
};
