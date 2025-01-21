import { Rolletype } from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { BehandlingAlert } from "@common/components/BehandlingAlert";
import { InntektHeader } from "@common/components/inntekt/InntektHeader";
import { InntektTableComponent, InntektTableProvider } from "@common/components/inntekt/InntektTableContext";
import { NyOpplysningerAlert } from "@common/components/inntekt/NyOpplysningerAlert";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import behandlingQueryKeys from "@common/constants/behandlingQueryKeys";
import urlSearchParams from "@common/constants/behandlingQueryKeys";
import { ROLE_FORKORTELSER } from "@common/constants/roleTags";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { createInitialValues, inntekterTablesViewRules } from "@common/helpers/inntektFormHelpers";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { useOnSaveInntekt } from "@common/hooks/useOnSaveInntekt";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { InntektFormValues } from "@common/types/inntektFormValues";
import { BodyShort, Heading, Tabs } from "@navikt/ds-react";
import { getSearchParam } from "@utils/window-utils";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { CustomTextareaEditor } from "../../../../common/components/CustomEditor";
import { PersonIdent } from "../../../../common/components/PersonIdent";
import { STEPS } from "../../../constants/steps";
import { BarnebidragStepper } from "../../../enum/BarnebidragStepper";

const Main = () => {
    const { roller: behandlingRoller, type } = useGetBehandlingV2();
    const { beregnetGebyrErEndret, lesemodus, onNavigateToTab } = useBehandlingProvider();
    const [searchParams] = useSearchParams();

    const roller = behandlingRoller.sort((a, b) => {
        if (a.rolletype === Rolletype.BM || b.rolletype === Rolletype.BA) return -1;
        if (b.rolletype === Rolletype.BM || a.rolletype === Rolletype.BA) return 1;
        return 0;
    });

    const defaultTab = useMemo(() => {
        const roleId = roller
            .find((rolle) => rolle.id?.toString() === getSearchParam(urlSearchParams.tab))
            ?.id?.toString();
        return roleId ?? roller.find((rolle) => rolle.rolletype === Rolletype.BM).id.toString();
    }, []);

    const selectedTab = searchParams.get(behandlingQueryKeys.tab) ?? defaultTab;

    return (
        <>
            {beregnetGebyrErEndret && !lesemodus && (
                <BehandlingAlert variant="info" className="mb-4">
                    <Heading size="xsmall" level="6">
                        {text.alert.gebyrHarBlittEndret}
                    </Heading>
                    <BodyShort size="small">{text.alert.gebyrHarBlittEndretDescription}</BodyShort>
                </BehandlingAlert>
            )}
            <Tabs
                defaultValue={defaultTab}
                value={selectedTab}
                onChange={onNavigateToTab}
                className="lg:max-w-[960px] md:max-w-[720px] sm:max-w-[598px]"
            >
                <Tabs.List>
                    {roller.map((rolle, index) => (
                        <Tabs.Tab
                            key={rolle.ident + index}
                            value={rolle.id.toString()}
                            label={
                                <div className="flex flex-row gap-1">
                                    {ROLE_FORKORTELSER[rolle.rolletype]}
                                    {rolle.rolletype !== Rolletype.BM && <PersonIdent ident={rolle.ident} />}
                                </div>
                            }
                        />
                    ))}
                </Tabs.List>
                {roller.map((rolle) => {
                    return (
                        <InntektTableProvider key={rolle.ident} rolle={rolle} type={type}>
                            <Tabs.Panel value={rolle.id.toString()} className="grid gap-y-4">
                                <div className="mt-4">
                                    <InntektHeader ident={rolle.ident} />
                                </div>
                                {inntekterTablesViewRules[type][rolle.rolletype].map((tableType, index) => (
                                    <Fragment key={tableType + index}>{InntektTableComponent[tableType]()}</Fragment>
                                ))}
                            </Tabs.Panel>
                        </InntektTableProvider>
                    );
                })}
            </Tabs>
        </>
    );
};

const Side = () => {
    const [searchParams] = useSearchParams();
    const { onStepChange, setSaveErrorState } = useBehandlingProvider();
    const { roller } = useGetBehandlingV2();
    const saveInntekt = useOnSaveInntekt();
    const { watch, getValues, setValue } = useFormContext<InntektFormValues>();
    const rolleId = searchParams.get(urlSearchParams.tab);
    const selectedRolle = rolleId
        ? roller.find((rolle) => rolle.id === Number(rolleId))
        : roller.find((rolle) => rolle.rolletype === Rolletype.BM);
    const selectedRolleId = selectedRolle.id;
    const [previousValues, setPreviousValues] = useState<string>(getValues(`begrunnelser.${selectedRolleId}`));

    const onSave = () => {
        const begrunnelse = getValues(`begrunnelser.${selectedRolleId}`);
        saveInntekt.mutation.mutate(
            {
                oppdatereBegrunnelse: {
                    nyBegrunnelse: begrunnelse,
                    rolleid: Number(selectedRolleId),
                },
            },
            {
                onSuccess: (response) => {
                    saveInntekt.queryClientUpdater((currentData) => ({
                        ...currentData,
                        gebyr: currentData.gebyr,
                        inntekter: {
                            ...currentData.inntekter,
                            begrunnelser: currentData.inntekter.begrunnelser
                                .filter((notat) => notat.gjelder.id !== selectedRolleId)
                                .concat({
                                    innhold: response.begrunnelse,
                                    gjelder: roller.find((rolle) => Number(rolle.id) === Number(selectedRolleId)),
                                    kunINotat: response.begrunnelse,
                                }),
                        },
                    }));
                    setPreviousValues(response.begrunnelse);
                },
                onError: () => {
                    setSaveErrorState({
                        error: true,
                        retryFn: () => onSave(),
                        rollbackFn: () => {
                            setValue(`begrunnelser.${selectedRolleId}`, previousValues ?? "");
                        },
                    });
                },
            }
        );
    };
    const onNext = () => onStepChange(STEPS[BarnebidragStepper.GEBYR]);

    const debouncedOnSave = useDebounce(onSave);

    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (name.includes("begrunnelser") && (type === "change" || type === undefined)) {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const descriptionText =
        selectedRolle.rolletype === Rolletype.BM
            ? text.description.inntektBegrunnelseBM
            : selectedRolle.rolletype === Rolletype.BP
              ? text.description.inntektBegrunnelseBP
              : undefined;

    return (
        <Fragment key={selectedRolleId}>
            <CustomTextareaEditor
                description={descriptionText}
                label={text.title.begrunnelse}
                name={`begrunnelser.${selectedRolleId}`}
                resize
            />
            <ActionButtons onNext={onNext} />
        </Fragment>
    );
};

const InntektForm = () => {
    const { inntekter, roller } = useGetBehandlingV2();
    const virkningsdato = useVirkningsdato();
    const initialValues = useMemo(
        () => createInitialValues(roller, inntekter, virkningsdato),
        [roller, inntekter, virkningsdato]
    );
    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <NewFormLayout title="Inntekt" main={<Main />} side={<Side />} pageAlert={<NyOpplysningerAlert />} />
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
