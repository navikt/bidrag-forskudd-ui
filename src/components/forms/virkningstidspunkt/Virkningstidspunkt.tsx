import { capitalize, toISODateString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Heading, Label } from "@navikt/ds-react";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import {
    OppdaterVirkningstidspunkt,
    Resultatkode,
    Rolletype,
    TypeArsakstype,
    Vedtakstype,
    VirkningstidspunktDto,
} from "../../../api/BidragBehandlingApiV1";
import { SOKNAD_LABELS } from "../../../constants/soknadFraLabels";
import { STEPS } from "../../../constants/steps";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useGetBehandlingV2, useOppdaterBehandlingV2 } from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { VirkningstidspunktFormValues } from "../../../types/virkningstidspunktFormValues";
import { addMonths, dateOrNull, DateToDDMMYYYYString } from "../../../utils/date-utils";
import { FormControlledMonthPicker } from "../../formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FlexRow } from "../../layout/grid/FlexRow";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import {
    aarsakToVirkningstidspunktMapper,
    getFomAndTomForMonthPicker,
    getSoktFraOrMottatDato,
} from "../helpers/virkningstidspunktHelpers";
import { ActionButtons } from "../inntekt/ActionButtons";

const årsakListe = [
    TypeArsakstype.ENDRING3MANEDERTILBAKE,
    TypeArsakstype.ENDRING3ARSREGELEN,
    TypeArsakstype.FRABARNETSFODSEL,
    TypeArsakstype.FRABARNETSFLYTTEMANED,
    TypeArsakstype.FRA_KRAVFREMSETTELSE,
    TypeArsakstype.FRA_OPPHOLDSTILLATELSE,
    TypeArsakstype.FRASOKNADSTIDSPUNKT,
    TypeArsakstype.FRA_SAMLIVSBRUDD,
    TypeArsakstype.PRIVAT_AVTALE,
    TypeArsakstype.REVURDERINGMANEDENETTER,
    TypeArsakstype.SOKNADSTIDSPUNKTENDRING,
    TypeArsakstype.TIDLIGERE_FEILAKTIG_AVSLAG,
    TypeArsakstype.TREMANEDERTILBAKE,
    TypeArsakstype.TREARSREGELEN,
];

const avslagsListe = [
    Resultatkode.PAGRUNNAVBARNEPENSJON,
    Resultatkode.BARNETS_EKTESKAP,
    Resultatkode.BARNETS_INNTEKT,
    Resultatkode.PAGRUNNAVYTELSEFRAFOLKETRYGDEN,
    Resultatkode.FULLT_UNDERHOLDT_AV_OFFENTLIG,
    Resultatkode.IKKE_OMSORG,
    Resultatkode.IKKE_OPPHOLD_I_RIKET,
    Resultatkode.MANGLENDE_DOKUMENTASJON,
    Resultatkode.PAGRUNNAVSAMMENFLYTTING,
    Resultatkode.OPPHOLD_I_UTLANDET,
    Resultatkode.OPPHORPRIVATAVTALE,
    Resultatkode.UTENLANDSK_YTELSE,
];

const createInitialValues = (response: VirkningstidspunktDto): VirkningstidspunktFormValues =>
    ({
        virkningstidspunkt: response.virkningstidspunkt,
        årsakAvslag: response.årsak ?? response.avslag ?? "",
        notat: {
            medIVedtaket: response.notat?.medIVedtaket,
            kunINotat: response.notat?.kunINotat,
        },
    }) as VirkningstidspunktFormValues;

const createPayload = (values: VirkningstidspunktFormValues): OppdaterVirkningstidspunkt => {
    const årsak = Object.values(TypeArsakstype).find((value) => value === values.årsakAvslag);
    const avslag = Object.values(Resultatkode).find((value) => value === values.årsakAvslag);
    return {
        virkningstidspunkt: values.virkningstidspunkt,
        årsak,
        avslag,
        notat: {
            medIVedtaket: values.notat?.medIVedtaket,
            kunINotat: values.notat?.kunINotat,
        },
    };
};

const Main = ({ initialValues, error }) => {
    const behandling = useGetBehandlingV2();
    const [initialVirkningsdato, setInitialVirkningsdato] = useState(behandling.virkningstidspunkt.virkningstidspunkt);
    const [showChangedVirkningsDatoAlert, setShowChangedVirkningsDatoAlert] = useState(false);
    const { setValue, clearErrors, getValues } = useFormContext();
    const virkningsDato = getValues("virkningstidspunkt");
    const kunEtBarnIBehandlingen = behandling.roller.filter((rolle) => rolle.rolletype === Rolletype.BA).length === 1;

    const skalViseÅrsakstyper = behandling.vedtakstype !== Vedtakstype.OPPHOR;
    const onAarsakSelect = (value: string) => {
        const barnsFødselsdato = kunEtBarnIBehandlingen
            ? behandling.roller.find((rolle) => rolle.rolletype === Rolletype.BA).fødselsdato
            : undefined;
        const date = aarsakToVirkningstidspunktMapper(value, behandling, barnsFødselsdato);
        setValue("virkningstidspunkt", date ? toISODateString(date) : null);
        clearErrors("virkningstidspunkt");
    };
    const erÅrsakAvslagIkkeValgt = getValues("årsakAvslag") == "";

    const [fom] = getFomAndTomForMonthPicker(new Date(behandling.søktFomDato));

    const tom = useMemo(
        () => dateOrNull(behandling.virkningstidspunkt.opprinneligVirkningstidspunkt) ?? addMonths(new Date(), 50 * 12),
        [fom]
    );

    useEffect(() => {
        if (!initialVirkningsdato && behandling) {
            setInitialVirkningsdato(
                behandling.virkningstidspunkt.virkningstidspunkt ??
                    toISODateString(
                        getSoktFraOrMottatDato(new Date(behandling.søktFomDato), new Date(behandling.mottattdato))
                    )
            );
        }
    }, [behandling]);

    useEffect(() => {
        if (initialVirkningsdato && initialVirkningsdato !== virkningsDato) {
            const boforholdPeriodsExist = behandling.boforhold?.husstandsbarn[0]?.perioder.length;
            if (boforholdPeriodsExist) {
                setShowChangedVirkningsDatoAlert(true);
            }
        }

        if (initialVirkningsdato && showChangedVirkningsDatoAlert && initialVirkningsdato === virkningsDato) {
            setShowChangedVirkningsDatoAlert(false);
        }
    }, [virkningsDato]);

    const erTypeOpphør = behandling.vedtakstype == Vedtakstype.OPPHOR;
    return (
        <>
            {showChangedVirkningsDatoAlert && <Alert variant="warning">{text.alert.endretVirkningstidspunkt}</Alert>}
            {error && <Alert variant="error">{error.message}</Alert>}
            <FlexRow className="gap-x-12 mt-12">
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søknadstype}:</Label>
                    <BodyShort size="small">
                        {capitalize(behandling.stønadstype ?? behandling.engangsbeløptype)}
                    </BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søknadfra}:</Label>
                    <BodyShort size="small">{SOKNAD_LABELS[behandling.søktAv]}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.mottattdato}:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.mottattdato))}</BodyShort>
                </div>
                <div className="flex gap-x-2">
                    <Label size="small">{text.label.søktfradato}:</Label>
                    <BodyShort size="small">{DateToDDMMYYYYString(new Date(behandling.søktFomDato))}</BodyShort>
                </div>
            </FlexRow>
            <FlexRow className="gap-x-8">
                <FormControlledSelectField
                    name="årsakAvslag"
                    label={text.label.årsak}
                    onSelect={onAarsakSelect}
                    className="w-max"
                >
                    {erÅrsakAvslagIkkeValgt && <option value="">{text.select.årsakAvslagPlaceholder}</option>}
                    {skalViseÅrsakstyper && (
                        <optgroup label={text.label.årsak}>
                            {årsakListe
                                .filter((value) => {
                                    if (kunEtBarnIBehandlingen) return true;
                                    return value !== TypeArsakstype.FRABARNETSFODSEL;
                                })
                                .map((value) => (
                                    <option key={value} value={value}>
                                        {hentVisningsnavn(value)}
                                    </option>
                                ))}
                        </optgroup>
                    )}
                    <optgroup label={erTypeOpphør ? text.label.opphør : text.label.avslag}>
                        {avslagsListe.map((value) => (
                            <option key={value} value={value}>
                                {hentVisningsnavn(value)}
                            </option>
                        ))}
                    </optgroup>
                </FormControlledSelectField>
                <FormControlledMonthPicker
                    name="virkningstidspunkt"
                    label={text.label.virkningstidspunkt}
                    placeholder="DD.MM.ÅÅÅÅ"
                    defaultValue={initialValues.virkningstidspunkt}
                    fromDate={fom}
                    toDate={tom}
                    required
                />
            </FlexRow>
        </>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const useFormMethods = useFormContext();
    const årsakAvslag = useFormMethods.getValues("årsakAvslag");
    const onNext = () =>
        setActiveStep(
            avslagsListe.includes(årsakAvslag) ? STEPS[ForskuddStepper.VEDTAK] : STEPS[ForskuddStepper.BOFORHOLD]
        );

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

const VirkningstidspunktForm = () => {
    const { virkningstidspunkt } = useGetBehandlingV2();
    const oppdaterBehandling = useOppdaterBehandlingV2();
    const initialValues = createInitialValues(virkningstidspunkt);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const onSave = () => {
        const values = useFormMethods.getValues();
        oppdaterBehandling.mutation.mutate(
            { virkningstidspunkt: createPayload(values) },
            {
                onSuccess: () => {
                    useFormMethods.reset(values, {
                        keepValues: true,
                        keepErrors: true,
                        keepDefaultValues: true,
                    });
                },
            }
        );
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch(() => debouncedOnSave());

        return () => unsubscribe();
    }, []);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout
                        title={text.label.virkningstidspunkt}
                        main={<Main initialValues={initialValues} error={oppdaterBehandling.error} />}
                        side={<Side />}
                    />
                </form>
            </FormProvider>
        </>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <VirkningstidspunktForm />
        </QueryErrorWrapper>
    );
};
