import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import { AdminButtons } from "@common/components/vedtak/AdminButtons";
import { FatteVedtakButtons } from "@common/components/vedtak/FatteVedtakButtons";
import VedtakWrapper from "@common/components/vedtak/VedtakWrapper";
import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { QueryKeys, useGetBehandlingV2 } from "@common/hooks/useApiData";
import useFeatureToogle from "@common/hooks/useFeatureToggle";
import { Alert, Heading } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { STEPS } from "../../constants/steps";

const Vedtak = () => {
    const { behandlingId, activeStep, lesemodus } = useBehandlingProvider();
    const { erVedtakFattet } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const { isFatteVedtakEnabled } = useFeatureToogle();

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(behandlingId) });
    }, [activeStep]);

    return (
        <div className="grid gap-y-4 m-auto w-[830px]">
            {erVedtakFattet && !lesemodus && <Alert variant="warning">Vedtak er fattet for behandling</Alert>}
            <Heading level="2" size="medium">
                {text.title.vedtak}
            </Heading>
            <VedtakResultat />

            {!lesemodus && <FatteVedtakButtons isBeregningError={null} disabled={!isFatteVedtakEnabled} />}
            <AdminButtons />
        </div>
    );
};

const VedtakResultat = () => {
    return (
        <VedtakWrapper feil={null} steps={STEPS}>
            <div>VedtakResultat</div>
        </VedtakWrapper>
    );
};

export default () => {
    return (
        <QueryErrorWrapper>
            <Vedtak />
        </QueryErrorWrapper>
    );
};
