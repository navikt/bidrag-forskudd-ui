import { HddDownIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import {
    Accordion,
    Alert,
    BodyShort,
    Button,
    Heading,
    Loader,
    Panel,
    Radio,
    RadioGroup,
    Search,
} from "@navikt/ds-react";
import React, { Fragment, Suspense, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { RolleType, SivilstandType } from "../../api/BidragBehandlingApi";
import { PERSON_API } from "../../constants/api";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { BoStatus } from "../../enum/BoStatus";
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
import { dateOrNull, DateToDDMMYYYYString, DateToMMYYYYString, isValidDate } from "../../utils/date-utils";
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
    createInitialValues,
    createPayload,
    mapHusstandsMedlemmerToBarn,
} from "./helpers/boforholdFormHelpers";
import { checkOverlappingPeriods } from "./helpers/inntektFormHelpers";
import { ActionButtons } from "./inntekt/ActionButtons";

const Opplysninger = ({ opplysninger, ident }) => {
    const perioder = opplysninger.find((opplysning) => opplysning.ident === ident).perioder;
    return perioder.map((periode, index) => (
        <div
            key={`${periode.boStatus}-${index}`}
            className="grid grid-cols-[70px,max-content,70px,auto] items-center gap-x-2"
        >
            <BodyShort size="small" className="flex justify-end">
                {DateToDDMMYYYYString(periode.fraDato)}
            </BodyShort>
            <div>{"-"}</div>
            <BodyShort size="small" className="flex justify-end">
                {periode.tilDato ? DateToDDMMYYYYString(periode.tilDato) : ""}
            </BodyShort>
            <BodyShort size="small">{BoStatus[periode.boStatus]}</BodyShort>
        </div>
    ));
};

const Main = ({
    opplysningerFraFolkRegistre,
    behandlingId,
}: {
    opplysningerFraFolkRegistre: any;
    behandlingId: number;
}) => {
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues.virkningsDato);

    return (
        <>
            {!isValidDate(virkningstidspunkt) && <Alert variant="warning">Mangler virkningstidspunkt</Alert>}
            <Heading level="3" size="medium">
                Barn
            </Heading>
            <BarnPerioder
                virkningstidspunkt={virkningstidspunkt}
                opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
            />
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
    const { behandlingId, boforholdFormValues, setBoforholdFormValues } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: boforhold } = useGetBoforhold(behandlingId);
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const { data: virkningstidspunktValues } = useGetVirkningstidspunkt(behandlingId);
    const { data: boforoholdOpplysninger } = useGetBoforoholdOpplysninger(behandlingId);
    const opplysningerFraFolkRegistre = mapHusstandsMedlemmerToBarn(
        behandling,
        grunnlagspakke.husstandmedlemmerOgEgneBarnListe
    );
    const opplysninger = boforoholdOpplysninger ? boforoholdOpplysninger : opplysningerFraFolkRegistre;

    const updateBoforhold = useUpdateBoforhold(behandlingId);
    const virkningstidspunkt = dateOrNull(virkningstidspunktValues?.virkningsDato);

    const initialValues =
        boforholdFormValues ??
        createInitialValues(
            behandling,
            boforhold,
            opplysninger,
            boforoholdOpplysninger,
            virkningstidspunkt,
            grunnlagspakke
        );

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const watchAllFields = useWatch({ control: useFormMethods.control });

    useEffect(() => {
        if (!boforholdFormValues) setBoforholdFormValues(initialValues);

        return () => setBoforholdFormValues(useFormMethods.getValues());
    }, []);

    const onSave = () => {
        const values = useFormMethods.getValues();
        setBoforholdFormValues(values);
        updateBoforhold.mutation.mutate(createPayload(values), {
            onSuccess: () => useFormMethods.reset(values, { keepValues: true, keepErrors: true }),
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
                        main={
                            <Main
                                opplysningerFraFolkRegistre={opplysningerFraFolkRegistre}
                                behandlingId={behandlingId}
                            />
                        }
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
                            setValue(`husstandsBarn.${index}.ident`, null);
                            setValue(`husstandsBarn.${index}.navn`, null);
                        }}
                        onSearchClick={(value) => {
                            PERSON_API.informasjon
                                .hentPersonPost({ ident: value })
                                .then(({ data }) => {
                                    setValue(`husstandsBarn.${index}.ident`, value);
                                    setValue(`husstandsBarn.${index}.navn`, data.navn);
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
                <FormControlledTextField name={`husstandsBarn.${index}.navn`} label="Navn" />
            </FlexRow>
        </div>
    );
};

const BarnPerioder = ({ virkningstidspunkt, opplysningerFraFolkRegistre }) => {
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
                    edit: false,
                    datoFom: virkningstidspunkt,
                    datoTom: null,
                    boStatus: "",
                    kilde: "",
                },
            ],
        });
    };

    return (
        <>
            {controlledFields.map((item, index) => (
                <Fragment key={item.id}>
                    <Panel className="p-0 border-0 border-[var(--a-border-divider)] border-solid border-b-2">
                        {item.medISaken && (
                            <div className="grid grid-cols-[max-content,auto] mb-8">
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
                                    <Accordion>
                                        <Accordion.Item>
                                            <Accordion.Header>Opplysninger fra Folkeregistret</Accordion.Header>
                                            <Accordion.Content>
                                                <Opplysninger
                                                    opplysninger={opplysningerFraFolkRegistre}
                                                    ident={item.ident}
                                                />
                                            </Accordion.Content>
                                        </Accordion.Item>
                                    </Accordion>
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
                        <Perioder barnIndex={index} virkningstidspunkt={virkningstidspunkt} />
                    </Panel>
                </Fragment>
            ))}
            <Button variant="tertiary" type="button" size="small" className="w-fit" onClick={addBarn}>
                + legg til barn
            </Button>
        </>
    );
};

const Perioder = ({ barnIndex, virkningstidspunkt }) => {
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

    const validateFomOgTom = (date, index, field) => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        const fomOgTomInvalid =
            field === "fraDato"
                ? perioderValues[index].datoTom && date > perioderValues[index].datoTom
                : perioderValues[index].datoFom && date < perioderValues[index].datoFom;

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
            clearErrors(`husstandsBarn.${barnIndex}.perioder`);
            return;
        }
        const filtrertOgSorterListe = perioder
            .filter((periode) => periode.datoFom !== null)
            .sort((a, b) => a.datoFom.getTime() - b.datoFom.getTime());

        const overlappingPerioder = checkOverlappingPeriods(filtrertOgSorterListe);

        if (overlappingPerioder?.length) {
            setError(`husstandsBarn.${barnIndex}.perioder`, {
                type: "overlappingPerioder",
                message: "Du har overlappende perioder",
            });
        }

        if (!overlappingPerioder?.length) {
            clearErrors(`husstandsBarn.${barnIndex}.perioder`);
        }
    };

    const addPeriode = () => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder`);
        barnPerioder.append({
            edit: true,
            datoFom: calculateFraDato(perioderValues, virkningstidspunkt),
            datoTom: null,
            boStatus: "",
            kilde: "",
        });
    };

    const savePeriod = (index) => {
        const perioderValues = getValues(`husstandsBarn.${barnIndex}.perioder.${index}`);
        // @ts-ignore
        if (!perioderValues.fraDato || !perioderValues?.boStatus || !perioderValues.kilde) {
            // @ts-ignore
            if (!perioderValues.fraDato) {
                setError(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`, {
                    type: "datesNotValid",
                    message: "Fom dato kan ikke være tøm",
                });
            } else {
                clearErrors(`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`);
            }
            // @ts-ignore
            if (!perioderValues.boStatus) {
                setError(`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`, {
                    type: "boStatusNotValid",
                    message: "Status kan ikke vøre tøm",
                });
            } else {
                clearErrors(`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`);
            }
            // @ts-ignore
            if (!perioderValues.kilde) {
                setError(`husstandsBarn.${barnIndex}.perioder.${index}.kilde`, {
                    type: "kildeNotValid",
                    message: "Kilde kan ikke være tøm",
                });
            } else {
                clearErrors(`husstandsBarn.${barnIndex}.perioder.${index}.kilde`);
            }
        } else {
            // @ts-ignore
            setValue(`husstandsBarn.${barnIndex}.perioder.${index}.edit`, false);
        }
    };

    return (
        <>
            {errors?.husstandsBarn && errors.husstandsBarn[barnIndex]?.perioder.type === "overlappingPerioder" && (
                <Alert variant="warning">
                    <BodyShort>{errors.husstandsBarn[barnIndex].perioder.message}</BodyShort>
                </Alert>
            )}
            {controlledFields.length > 0 && (
                <TableWrapper heading={["Fra og med", "Til og med", "Status", "Kilde", "", ""]}>
                    {controlledFields.map((item, index) => (
                        <TableRowWrapper
                            key={item.id}
                            cells={[
                                item.edit ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom`}
                                        label="Fra og med"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.datoFom}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "datoFom");
                                        }}
                                        toDate={new Date()}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`husstandsBarn.${barnIndex}.perioder.${index}.datoFom.placeholder`}>
                                        {item.datoFom ? DateToMMYYYYString(item.datoFom) : ""}
                                    </BodyShort>
                                ),
                                item.edit ? (
                                    <FormControlledMonthPicker
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom`}
                                        label="Til og med"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "datoTom");
                                        }}
                                        lastDayOfMonthPicker
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort key={`husstandsBarn.${barnIndex}.perioder.${index}.datoTom.placeholder`}>
                                        {item.datoTom ? DateToMMYYYYString(item.datoTom) : ""}
                                    </BodyShort>
                                ),
                                item.edit ? (
                                    <FormControlledSelectField
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus`}
                                        className="w-fit"
                                        label="Status"
                                        options={[
                                            { value: "", text: "Velg status" },
                                            { value: "registrert_paa_adresse", text: "Registrert på adresse" },
                                            {
                                                value: "ikke_registrert_paa_adresse",
                                                text: "Ikke registrert på adresse",
                                            },
                                        ]}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.boStatus.placeholder`}
                                    >
                                        {BoStatus[item.boStatus]}
                                    </BodyShort>
                                ),
                                item.edit ? (
                                    <FormControlledSelectField
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.kilde`}
                                        name={`husstandsBarn.${barnIndex}.perioder.${index}.kilde`}
                                        className="w-fit"
                                        label="Kilde"
                                        options={[
                                            { value: "", text: "Velg kilde" },
                                            { value: "offentlig", text: "Offentlig" },
                                            { value: "manuelt", text: "Manuelt" },
                                        ]}
                                        hideLabel
                                    />
                                ) : (
                                    <BodyShort
                                        key={`husstandsBarn.${barnIndex}.perioder.${index}.kilde.placeholder`}
                                        className="capitalize"
                                    >
                                        {item.kilde}
                                    </BodyShort>
                                ),
                                item.edit ? (
                                    <Button
                                        key={`save-button-${barnIndex}-${index}`}
                                        type="button"
                                        onClick={() => savePeriod(index)}
                                        icon={<HddDownIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ) : (
                                    <Button
                                        key={`edit-button-${barnIndex}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            setValue(`husstandsBarn.${barnIndex}.perioder.${index}.edit`, true)
                                        }
                                        icon={<PencilIcon aria-hidden />}
                                        variant="tertiary"
                                        size="small"
                                    />
                                ),
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
                    + legg til periode
                </Button>
            </div>
        </>
    );
};

const SivilistandPerioder = ({ virkningstidspunkt }) => {
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
            field === "gyldigFraOgMed"
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
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.gyldigFraOgMed}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "gyldigFraOgMed");
                                        }}
                                        toDate={new Date()}
                                        hideLabel
                                    />
                                    <FormControlledMonthPicker
                                        key={`sivilstand.${index}.datoTom`}
                                        name={`sivilstand.${index}.datoTom`}
                                        label="Periode"
                                        placeholder="MM.ÅÅÅÅ"
                                        defaultValue={item.datoTom}
                                        onChange={(date) => {
                                            validatePeriods();
                                            validateFomOgTom(date, index, "datoTom");
                                        }}
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
                + legg til periode
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
