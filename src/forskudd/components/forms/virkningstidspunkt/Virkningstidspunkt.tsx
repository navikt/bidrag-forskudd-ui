import {
    OppdatereVirkningstidspunkt,
    Resultatkode,
    Rolletype,
    TypeArsakstype,
    Vedtakstype,
    VirkningstidspunktDto,
} from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { FlexRow } from "@common/components/layout/grid/FlexRow";
import { FormLayout } from "@common/components/layout/grid/FormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { SOKNAD_LABELS } from "@common/constants/soknadFraLabels";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import {
    aarsakToVirkningstidspunktMapper,
    getFomAndTomForMonthPicker,
} from "@common/helpers/virkningstidspunktHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { hentVisningsnavnVedtakstype } from "@common/hooks/useVisningsnavn";
import { capitalize, ObjectUtils, toISODateString } from "@navikt/bidrag-ui-common";
import { BodyShort, Label } from "@navikt/ds-react";
import { addMonths, dateOrNull, DateToDDMMYYYYString } from "@utils/date-utils";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { STEPS } from "../../../constants/steps";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useOnSaveVirkningstidspunkt } from "../../../hooks/useOnSaveVirkningstidspunkt";
import { VirkningstidspunktFormValues } from "../../../types/virkningstidspunktFormValues";

const årsakListe = [
    TypeArsakstype.TREMANEDERTILBAKE,
    TypeArsakstype.TREARSREGELEN,
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
    TypeArsakstype.FRAMANEDENETTERIPAVENTEAVBIDRAGSSAK,
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
    Resultatkode.AVSLAG_PRIVAT_AVTALE_BIDRAG,
    Resultatkode.IKKE_INNKREVING_AV_BIDRAG,
    Resultatkode.UTENLANDSK_YTELSE,
];

const avslagsListeDeprekert = [Resultatkode.IKKESOKTOMINNKREVINGAVBIDRAG];

const createInitialValues = (response: VirkningstidspunktDto): VirkningstidspunktFormValues => ({
    virkningstidspunkt: response.virkningstidspunkt,
    årsakAvslag: response.årsak ?? response.avslag ?? "",
    begrunnelse: response.begrunnelse?.innhold,
});

const createPayload = (values: VirkningstidspunktFormValues): OppdatereVirkningstidspunkt => {
    const årsak = Object.values(TypeArsakstype).find((value) => value === values.årsakAvslag);
    const avslag = Object.values(Resultatkode).find((value) => value === values.årsakAvslag);
    return {
        virkningstidspunkt: values.virkningstidspunkt,
        årsak,
        avslag,
        oppdatereBegrunnelse: {
            nyBegrunnelse: values.begrunnelse,
        },
    };
};

const Main = ({ initialValues, showChangedVirkningsDatoAlert }) => {
    const behandling = useGetBehandlingV2();
    const { setValue, clearErrors, getValues } = useFormContext();
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
    const erÅrsakAvslagIkkeValgt = getValues("årsakAvslag") === "";

    const [fom] = getFomAndTomForMonthPicker(new Date(behandling.søktFomDato));

    const tom = useMemo(
        () => dateOrNull(behandling.virkningstidspunkt.opprinneligVirkningstidspunkt) ?? addMonths(new Date(), 50 * 12),
        [fom]
    );

    const erTypeOpphør = behandling.vedtakstype === Vedtakstype.OPPHOR;
    return (
        <>
            <FlexRow className="gap-x-12">
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
                                        {hentVisningsnavnVedtakstype(value, behandling.vedtakstype)}
                                    </option>
                                ))}
                        </optgroup>
                    )}
                    <optgroup label={erTypeOpphør ? text.label.opphør : text.label.avslag}>
                        {avslagsListe.map((value) => (
                            <option key={value} value={value}>
                                {hentVisningsnavnVedtakstype(value, behandling.vedtakstype)}
                            </option>
                        ))}
                        {avslagsListeDeprekert.includes(getValues("årsakAvslag")) && (
                            <>
                                {avslagsListeDeprekert.map((value) => (
                                    <option key={value} value={value} disabled>
                                        {hentVisningsnavnVedtakstype(value, behandling.vedtakstype)}
                                    </option>
                                ))}
                            </>
                        )}
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
            {showChangedVirkningsDatoAlert && (
                <BehandlingAlert variant="warning" className={"w-[488px]"}>
                    <div dangerouslySetInnerHTML={{ __html: text.alert.endretVirkningstidspunkt }}></div>
                </BehandlingAlert>
            )}
        </>
    );
};

const Side = () => {
    const { onStepChange } = useBehandlingProvider();
    const useFormMethods = useFormContext();
    const årsakAvslag = useFormMethods.getValues("årsakAvslag");
    const onNext = () =>
        onStepChange(
            avslagsListe.includes(årsakAvslag) ? STEPS[ForskuddStepper.VEDTAK] : STEPS[ForskuddStepper.BOFORHOLD]
        );

    return (
        <>
            <FormControlledTextarea name="begrunnelse" label={text.title.begrunnelse} />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const VirkningstidspunktForm = () => {
    const { virkningstidspunkt } = useGetBehandlingV2();
    const { pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState, setSaveErrorState } = useBehandlingProvider();
    const oppdaterBehandling = useOnSaveVirkningstidspunkt();
    const initialValues = createInitialValues(virkningstidspunkt);
    const [initialVirkningsdato, setInitialVirkningsdato] = useState(virkningstidspunkt.virkningstidspunkt);
    const [showChangedVirkningsDatoAlert, setShowChangedVirkningsDatoAlert] = useState(false);
    const [previousValues, setPreviousValues] = useState<VirkningstidspunktFormValues>(initialValues);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
            virkningstidspunkt: {
                error: !ObjectUtils.isEmpty(useFormMethods.formState.errors),
                ...useFormMethods.formState.errors,
            },
        });
    }, [useFormMethods.formState.errors]);

    useEffect(() => {
        const subscription = useFormMethods.watch((value, { name, type }) => {
            if ((name === "virkningstidspunkt" && !value.virkningstidspunkt) || type === undefined) {
                return;
            } else {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (
            initialVirkningsdato &&
            virkningstidspunkt.virkningstidspunkt &&
            initialVirkningsdato !== virkningstidspunkt.virkningstidspunkt &&
            virkningstidspunkt.avslag == null
        ) {
            setShowChangedVirkningsDatoAlert(true);
        }

        if (
            initialVirkningsdato &&
            showChangedVirkningsDatoAlert &&
            initialVirkningsdato === virkningstidspunkt.virkningstidspunkt
        ) {
            setShowChangedVirkningsDatoAlert(false);
        }

        if (!initialVirkningsdato && virkningstidspunkt.virkningstidspunkt) {
            setInitialVirkningsdato(virkningstidspunkt.virkningstidspunkt);
        }
    }, [virkningstidspunkt.virkningstidspunkt]);

    const onSave = () => {
        const values = useFormMethods.getValues();
        oppdaterBehandling.mutation.mutate(createPayload(values), {
            onSuccess: (response) => {
                oppdaterBehandling.queryClientUpdater((currentData) => {
                    return {
                        ...currentData,
                        virkningstidspunkt: response.virkningstidspunkt,
                        boforhold: response.boforhold,
                        aktiveGrunnlagsdata: response.aktiveGrunnlagsdata,
                        inntekter: response.inntekter,
                        ikkeAktiverteEndringerIGrunnlagsdata: response.ikkeAktiverteEndringerIGrunnlagsdata,
                    };
                });
                setPreviousValues(createInitialValues(response.virkningstidspunkt));
            },
            onError: () => {
                setSaveErrorState({
                    error: true,
                    retryFn: () => onSave(),
                    rollbackFn: () => {
                        useFormMethods.reset(previousValues, {
                            keepIsSubmitSuccessful: true,
                            keepDirty: true,
                            keepIsSubmitted: true,
                        });
                    },
                });
            },
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout
                        title={text.label.virkningstidspunkt}
                        main={
                            <Main
                                initialValues={initialValues}
                                showChangedVirkningsDatoAlert={showChangedVirkningsDatoAlert}
                            />
                        }
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
