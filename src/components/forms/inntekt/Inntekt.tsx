import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, ExpansionCard, Heading, Link, Tabs } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { RolleDto, RolleType } from "../../../api/BidragBehandlingApi";
import { AinntektDto } from "../../../api/BidragGrunnlagApi";
import { INNTEKT_PERIODE_NOTAT_FIELDS, NOTAT_FIELDS } from "../../../constants/notatFields";
import { ROLE_FORKORTELSER } from "../../../constants/roleTags";
import { STEPS } from "../../../constants/steps";
import { useForskudd } from "../../../context/ForskuddContext";
import { ForskuddStepper } from "../../../enum/ForskuddStepper";
import { useGetBehandling, useGrunnlagspakke, useHentInntekter, useUpdateInntekter } from "../../../hooks/useApiData";
import { useDebounce } from "../../../hooks/useDebounce";
import { FormControlledTextarea } from "../../formFields/FormControlledTextArea";
import { FormLayout } from "../../layout/grid/FormLayout";
import { QueryErrorWrapper } from "../../query-error-boundary/QueryErrorWrapper";
import { createInitialValues, createInntektPayload } from "../helpers/inntektFormHelpers";
import { ActionButtons } from "./ActionButtons";
import { Arbeidsforhold } from "./Arbeidsforhold";
import { InntektChart } from "./InntektChart";
import { BarnetilleggTabel, InntekteneSomLeggesTilGrunnTabel, UtvidetBarnetrygdTabel } from "./InntektTables";

const InntektHeader = ({ inntekt }: { inntekt: AinntektDto[] }) => (
    <div className="grid w-full max-w-[65ch] gap-y-8">
        <InntektChart inntekt={inntekt} />
        <ExpansionCard aria-label="default-demo">
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

const Main = ({ behandlingRoller, ainntekt }: { behandlingRoller: RolleDto[]; ainntekt: AinntektDto[] }) => {
    const roller = behandlingRoller
        .filter((rolle) => rolle.rolleType !== RolleType.BIDRAGS_PLIKTIG)
        .sort((a, b) => {
            if (a.rolleType === RolleType.BIDRAGS_MOTTAKER || b.rolleType === RolleType.BARN) return -1;
            if (b.rolleType === RolleType.BIDRAGS_MOTTAKER || a.rolleType === RolleType.BARN) return 1;
            return 0;
        });

    return (
        <div className="grid gap-y-12">
            <Tabs defaultValue={roller.find((rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER).ident}>
                <Tabs.List>
                    {roller.map((rolle) => (
                        <Tabs.Tab
                            key={rolle.ident}
                            value={rolle.ident}
                            label={`${ROLE_FORKORTELSER[rolle.rolleType]} ${
                                rolle.rolleType === RolleType.BIDRAGS_MOTTAKER ? "" : rolle.ident
                            }`}
                        />
                    ))}
                </Tabs.List>
                {roller.map((rolle) => {
                    const inntekt = ainntekt.filter((inntekt) => inntekt.personId === rolle.ident);
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
                            <div className="grid gap-y-4 w-max">
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
                            {rolle.rolleType === RolleType.BIDRAGS_MOTTAKER && (
                                <>
                                    <div className="grid gap-y-4 w-max">
                                        <Heading level="3" size="medium">
                                            Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                                        </Heading>
                                        <BarnetilleggTabel />
                                    </div>
                                    <div className="grid gap-y-4 w-max">
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
    const { data: grunnlagspakke } = useGrunnlagspakke(behandling);
    const { data: inntekter } = useHentInntekter(behandlingId);
    const updateInntekter = useUpdateInntekter(behandlingId);
    const bmOgBarn = behandling.roller.filter(
        (rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER || rolle.rolleType === RolleType.BARN
    );

    const initialValues = createInitialValues(bmOgBarn, grunnlagspakke, inntekter);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    const watchAllFields = useWatch({ control: useFormMethods.control });

    useEffect(() => {
        const { unsubscribe } = useFormMethods.watch((value, { name }) => {
            const field = name?.split(".")[0];
            if (NOTAT_FIELDS.includes(field)) {
                const isPeriodeField = INNTEKT_PERIODE_NOTAT_FIELDS.includes(field);
                const filterSelectedPeriods = Object.keys(value[field])
                    .map((ident) => ({
                        ident,
                        inntekt: [],
                        // inntekt: value[field][ident].filter((i) => i.selected), // TODO: Marko dette fungerer ikke
                    }))
                    .filter((value) => value.inntekt.length > 0);

                channel.postMessage(
                    JSON.stringify({
                        field,
                        value: isPeriodeField ? filterSelectedPeriods : value[field],
                    })
                );
            }
        });
        return () => unsubscribe();
    }, [useFormMethods.watch]);

    useEffect(() => {
        useFormMethods.trigger();
    }, []);

    const onSave = () => {
        const values = useFormMethods.getValues();

        updateInntekter.mutation.mutate(createInntektPayload(values), {
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
        <FormProvider {...useFormMethods}>
            <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                <FormLayout
                    title="Inntekt"
                    main={<Main behandlingRoller={behandling.roller} ainntekt={grunnlagspakke.ainntektListe} />}
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
