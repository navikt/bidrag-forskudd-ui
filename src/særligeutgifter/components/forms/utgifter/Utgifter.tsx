import { SaertilskuddUtgifterDto } from "@api/BidragBehandlingApiV1";
import { ActionButtons } from "@common/components/ActionButtons";
import { FormControlledMonthPicker } from "@common/components/formFields/FormControlledMonthPicker";
import { FormControlledTextarea } from "@common/components/formFields/FormControlledTextArea";
import { FlexRow } from "@common/components/layout/grid/FlexRow";
import { FormLayout } from "@common/components/layout/grid/FormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { SOKNAD_LABELS } from "@common/constants/soknadFraLabels";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useDebounce } from "@common/hooks/useDebounce";
import { capitalize } from "@navikt/bidrag-ui-common";
import { BodyShort, Label } from "@navikt/ds-react";
import { DateToDDMMYYYYString } from "@utils/date-utils";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { STEPS } from "../../../constants/steps";
import { SærligeutgifterStepper } from "../../../enum/SærligeutgifterStepper";

const createInitialValues = (response: SaertilskuddUtgifterDto) => ({
    beregning: response.beregning,
    notat: {
        kunINotat: response.notat?.kunINotat,
    },
});

const Main = ({ initialValues }) => {
    const behandling = useGetBehandlingV2();

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
                <FormControlledMonthPicker
                    name="virkningstidspunkt"
                    label={text.label.virkningstidspunkt}
                    placeholder="DD.MM.ÅÅÅÅ"
                    defaultValue={initialValues.virkningstidspunkt}
                    required
                />
            </FlexRow>
        </>
    );
};

const Side = () => {
    const { onStepChange } = useBehandlingProvider();
    const onNext = () => onStepChange(STEPS[SærligeutgifterStepper.BOFORHOLD]);

    return (
        <>
            <FormControlledTextarea name="notat.kunINotat" label={text.title.begrunnelse} />
            <ActionButtons onNext={onNext} />
        </>
    );
};

const UtgifterForm = () => {
    const { utgift } = useGetBehandlingV2();
    const { pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState } = useBehandlingProvider();
    const initialValues = createInitialValues(utgift);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        setPageErrorsOrUnsavedState({
            ...pageErrorsOrUnsavedState,
        });
    }, [useFormMethods.formState.errors]);

    useEffect(() => {
        const subscription = useFormMethods.watch((value, { name, type }) => {
            if (name === undefined || type == undefined) {
                return;
            } else {
                debouncedOnSave();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const onSave = () => {
        console.log("saving");
    };

    const debouncedOnSave = useDebounce(onSave);

    return (
        <>
            <FormProvider {...useFormMethods}>
                <form onSubmit={useFormMethods.handleSubmit(onSave)}>
                    <FormLayout
                        title={text.label.virkningstidspunkt}
                        main={<Main initialValues={initialValues} />}
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
            <UtgifterForm />
        </QueryErrorWrapper>
    );
};
