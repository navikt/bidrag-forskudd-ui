import { ClockDashedIcon, ExternalLinkIcon } from "@navikt/aksel-icons";
import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, ExpansionCard, Heading, Link, Tabs } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { OpplysningerDto, OpplysningerType, RolleDto, RolleDtoRolleType } from "../../../api/BidragBehandlingApi";
import { SummertMaanedsinntekt } from "../../../api/BidragInntektApi";
import { NOTAT_FIELDS } from "../../../constants/notatFields";
import { ROLE_FORKORTELSER } from "../../../constants/roleTags";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import {
    useAddOpplysningerData,
    useGetBehandling,
    useGetBidragInntektQueries,
    useGetOpplysninger,
    useGrunnlagspakke,
    useHentInntekter,
    useUpdateInntekter,
} from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { ISODateTimeStringToDDMMYYYYString, toISODateString } from "../../../utils/date-utils";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import {
    compareOpplysninger,
    createInitialValues,
    createInntektPayload,
    getPerioderFraBidragInntekt,
} from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { InntektChart } from "./InntektChart";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

const InntektHeader = ({ inntekt }: { inntekt: SummertMaanedsinntekt[] }) => (
    <div className="grid w-full max-w-[65ch] gap-y-8">
        <InntektChart inntekt={inntekt} />
        <ExpansionCard aria-label="default-demo" size="small">
            <ExpansionCard.Header>
                <ExpansionCard.Title>Arbeidsforhold</ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <QueryErrorWrapper>
                    <Arbeidsforhold />
                </QueryErrorWrapper>
            </ExpansionCard.Content>
        </ExpansionCard>
    </div>
);

const Main = ({
    behandlingRoller,
    ainntekt,
    opplysningerChanges,
    updateOpplysninger,
    inntektOpplysninger,
}: {
    behandlingRoller: RolleDto[];
    ainntekt: { [ident: string]: SummertMaanedsinntekt[] };
    opplysningerChanges: string[];
    updateOpplysninger: () => void;
    inntektOpplysninger: OpplysningerDto;
}) => {
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolleType !== RolleDtoRolleType.BIDRAGSPLIKTIG)
        .sort((a, b) => {
            if (a.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER || b.rolleType === RolleDtoRolleType.BARN) return -1;
            if (b.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER || a.rolleType === RolleDtoRolleType.BARN) return 1;
            return 0;
        });

    return (
        <div className="grid gap-y-12">
            {opplysningerChanges.length > 0 && (
                <Alert variant="info">
                    <div className="flex items-center mb-4">
                        Nye opplysninger tilgjengelig. Sist hentet{" "}
                        {ISODateTimeStringToDDMMYYYYString(inntektOpplysninger.hentetDato)}
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
                    {opplysningerChanges.map((change, index) => (
                        <p key={`${change}-${index}`}>{change}</p>
                    ))}
                </Alert>
            )}
            <Tabs defaultValue={roller.find((rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER).ident}>
                <Tabs.List>
                    {roller.map((rolle) => (
                        <Tabs.Tab
                            key={rolle.ident}
                            value={rolle.ident}
                            label={`${ROLE_FORKORTELSER[rolle.rolleType]} ${
                                rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER ? "" : rolle.ident
                            }`}
                        />
                    ))}
                </Tabs.List>
                {roller.map((rolle) => {
                    const inntekt = ainntekt[rolle.ident];
                    return (
                        <Tabs.Panel key={rolle.ident} value={rolle.ident} className="grid gap-y-12">
                            <div className="mt-12">
                                {inntekt.length > 0 ? (
                                    <InntektHeader inntekt={inntekt} />
                                ) : (
                                    <Alert variant="info">
                                        <BodyShort>Ingen inntekt funnet</BodyShort>
                                    </Alert>
                                )}
                            </div>
                            <div className="grid gap-y-4">
                                <div className="flex gap-x-4">
                                    <Heading level="3" size="medium">
                                        Inntektene som legges til grunn
                                    </Heading>
                                    {inntekt.length > 0 && (
                                        <Link href="" target="_blank" className="font-bold">
                                            A-inntekt <ExternalLinkIcon aria-hidden />
                                        </Link>
                                    )}
                                </div>
                                <InntekteneSomLeggesTilGrunnTabel ident={rolle.ident} />
                            </div>
                            {rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER && (
                                <>
                                    <div className="grid gap-y-4">
                                        <Heading level="3" size="medium">
                                            Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                                        </Heading>
                                        <BarnetilleggTabel />
                                    </div>
                                    <div className="grid gap-y-4">
                                        <Heading level="3" size="medium">
                                            Utvidet barnetrygd
                                        </Heading>
                                        <UtvidetBarnetrygdTabel />
                                    </div>
                                </>
                            )}
                        </Tabs.Panel>
                    );
                })}
            </Tabs>
        </div>
    );
};

const Side = () => {
    const { setActiveStep } = useForskudd();
    const onNext = () => setActiveStep(STEPS[ForskuddStepper.VEDTAK]);
    return (
        <>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Begrunnelse
                </Heading>
                <div>
                    <FormControlledTextarea
                        name="inntektBegrunnelseMedIVedtakNotat"
                        label="Begrunnelse (med i vedtaket og notat)"
                    />
                </div>
                <div>
                    <FormControlledTextarea name="inntektBegrunnelseKunINotat" label="Begrunnelse (kun med i notat)" />
                </div>
            </div>
            <ActionButtons onNext={onNext} />
        </>
    );
};

const InntektForm = () => {
    const channel = new BroadcastChannel("inntekter");
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: inntekter } = useHentInntekter(behandlingId);
    const { data: inntektOpplysninger } = useGetOpplysninger(behandlingId, OpplysningerType.INNTEKTSOPPLYSNINGER);
    const { mutation: saveOpplysninger } = useAddOpplysningerData(behandlingId, OpplysningerType.INNTEKTSOPPLYSNINGER);
    const grunnlagspakke = useGrunnlagspakke();
    const bidragInntekt = useGetBidragInntektQueries(behandling, grunnlagspakke).map(({ data }) => data);
    const ainntekt: { [ident: string]: SummertMaanedsinntekt[] } = bidragInntekt.reduce(
        (acc, curr) => ({ ...acc, [curr.ident]: curr.data.summertMaanedsinntektListe }),
        {}
    );
    const updateInntekter = useUpdateInntekter(behandlingId);
    const [opplysningerChanges, setOpplysningerChanges] = useState([]);
    const bmOgBarn = behandling.roller.filter(
        (rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER || rolle.rolleType === RolleDtoRolleType.BARN
    );

    const initialValues = createInitialValues(bmOgBarn, bidragInntekt, inntekter, grunnlagspakke);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        useFormMethods.trigger();
    }, []);

    const onSave = () => {
        const values = useFormMethods.getValues();

        updateInntekter.mutation.mutate(createInntektPayload(values), {
            onSuccess: () =>
                useFormMethods.reset(values, { keepValues: true, keepErrors: true, keepDefaultValues: false }),
        });
    };

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch((value, { name }) => {
            // isDirty is not always working
            // if (useFormMethods.formState.isDirty) {
            //     debouncedOnSave();
            // }

            debouncedOnSave();

            const field = name?.split(".")[0];
            if (NOTAT_FIELDS.includes(field)) {
                channel.postMessage(
                    JSON.stringify({
                        field,
                        value: value[field],
                    })
                );
            }

            if (!inntektOpplysninger) {
                saveOpplysninger.mutate({
                    behandlingId,
                    aktiv: true,
                    opplysningerType: OpplysningerType.INNTEKTSOPPLYSNINGER,
                    data: JSON.stringify({
                        inntekt: bidragInntekt.map((personInntekt) => ({
                            ident: personInntekt.ident,
                            summertAarsinntektListe: personInntekt.data.summertAarsinntektListe.map((inntekt) => ({
                                ...inntekt,
                                datoFom: dateToDDMMYYYYString(new Date(inntekt.periodeFra)),
                                datoTom: dateToDDMMYYYYString(new Date(inntekt.periodeTom)),
                            })),
                        })),
                        utvidetbarnetrygd: grunnlagspakke.ubstListe,
                        barnetillegg: grunnlagspakke.barnetilleggListe,
                    }),
                    hentetDato: toISODateString(new Date()),
                });
                onSave();
            }
        });
        return () => unsubscribe();
    }, [useFormMethods.watch, useFormMethods.formState.isDirty]);

    useEffect(() => {
        if (inntektOpplysninger) {
            const savedOpplysninger = JSON.parse(inntektOpplysninger.data);
            const changesInOpplysninger = compareOpplysninger(savedOpplysninger, {
                inntekt: bidragInntekt.map((personInntekt) => ({
                    ident: personInntekt.ident,
                    summertAarsinntektListe: personInntekt.data.summertAarsinntektListe,
                })),
                utvidetbarnetrygd: grunnlagspakke.ubstListe,
                barnetillegg: grunnlagspakke.barnetilleggListe,
            });

            if (changesInOpplysninger.length) {
                setOpplysningerChanges(changesInOpplysninger);
            }
        }
    }, []);

    const updateOpplysninger = () => {
        saveOpplysninger.mutate({
            behandlingId,
            aktiv: true,
            opplysningerType: OpplysningerType.INNTEKTSOPPLYSNINGER,
            data: JSON.stringify({
                inntekt: bidragInntekt.map((personInntekt) => ({
                    ident: personInntekt.ident,
                    summertAarsinntektListe: personInntekt.data.summertAarsinntektListe,
                })),
                utvidetbarnetrygd: grunnlagspakke.ubstListe,
                barnetillegg: grunnlagspakke.barnetilleggListe,
            }),
            hentetDato: toISODateString(new Date()),
        });

        const fieldValues = useFormMethods.getValues();
        const values = {
            ...fieldValues,
            inntekteneSomLeggesTilGrunn: getPerioderFraBidragInntekt(bidragInntekt),
            utvidetbarnetrygd: grunnlagspakke.ubstListe.map((ubst) => ({
                deltBoSted: false,
                belop: ubst.belop,
                datoFom: ubst.periodeFra,
                datoTom: ubst.periodeTil,
            })),
            barnetillegg: grunnlagspakke.barnetilleggListe.map((periode) => ({
                ident: periode.barnPersonId,
                barnetillegg: periode.belopBrutto,
                datoFom: periode.periodeFra,
                datoTom: periode.periodeTil,
            })),
        };
        useFormMethods.reset(values);
        updateInntekter.mutation.mutate(createInntektPayload(values));
        setOpplysningerChanges([]);
    };

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                <FormLayout
                    title="Inntekt"
                    main={
                        <Main
                            behandlingRoller={behandling.roller}
                            ainntekt={ainntekt}
                            opplysningerChanges={opplysningerChanges}
                            updateOpplysninger={updateOpplysninger}
                            inntektOpplysninger={inntektOpplysninger}
                        />
                    }
                    side={<Side />}
                />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <InntektForm />
        </QueryErrorWrapper>
    );
};
