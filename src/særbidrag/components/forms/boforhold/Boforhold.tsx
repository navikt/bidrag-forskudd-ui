import { Rolletype } from "@api/BidragDokumentProduksjonApi";
import { BarnPerioder } from "@common/components/boforhold/BarnPerioder";
import { NyOpplysningerAlert } from "@common/components/boforhold/BoforholdOpplysninger";
import { FormLayout } from "@common/components/layout/grid/FormLayout";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { useVirkningsdato } from "@common/hooks/useVirkningsdato";
import { Heading } from "@navikt/ds-react";
import { scrollToHash } from "@utils/window-utils";
import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Notat } from "../../../../forskudd/components/forms/boforhold/Notat";
import { createInitialValues } from "../helpers/BoforholdFormHelpers";
import { AndreVoksneIHusstanden } from "./AndreVoksneIHusstanden";

const Main = () => {
    useEffect(scrollToHash, []);

    return (
        <>
            <NyOpplysningerAlert />
            <Heading level="2" size="small">
                {text.label.barn}
            </Heading>
            <BarnPerioder />
            <Heading level="2" size="small">
                {text.title.andreVoksneIHusstanden}
            </Heading>
            <AndreVoksneIHusstanden />
        </>
    );
};

const BoforholdsForm = () => {
    const { boforhold, roller } = useGetBehandlingV2();
    const virkningsOrSoktFraDato = useVirkningsdato();
    const barnMedISaken = useMemo(() => roller.filter((rolle) => rolle.rolletype === Rolletype.BA), [roller]);
    const initialValues = useMemo(
        () => createInitialValues(boforhold),
        [boforhold, virkningsOrSoktFraDato, barnMedISaken]
    );

    const useFormMethods = useForm({
        defaultValues: initialValues,
        criteriaMode: "all",
    });

    return (
        <FormProvider {...useFormMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <FormLayout title={text.title.boforhold} main={<Main />} side={<Notat />} />
            </form>
        </FormProvider>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <BoforholdsForm />
        </QueryErrorWrapper>
    );
};
