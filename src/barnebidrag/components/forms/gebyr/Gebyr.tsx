import { NyOpplysningerAlert } from "@common/components/inntekt/NyOpplysningerAlert";
import { NewFormLayout } from "@common/components/layout/grid/NewFormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import React, { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
const Main = () => {
    return <></>;
};

const GebyrForm = () => {
    const { roller } = useGetBehandlingV2();
    const initialValues = useMemo(() => roller, [roller]);

    const useFormMethods = useForm({
        defaultValues: initialValues,
    });

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <NewFormLayout title="Gebyr" main={<Main />} pageAlert={<NyOpplysningerAlert />} />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <GebyrForm />
        </QueryErrorWrapper>
    );
};
