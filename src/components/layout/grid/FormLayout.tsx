import { BidragCell, BidragGrid, Broadcast, SaveStatusIndicator, useRQMutationState } from "@navikt/bidrag-ui-common";
import { Heading } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useEffect } from "react";

import { useForskudd } from "../../../context/ForskuddContext";
import { MutationKeys } from "../../../hooks/useApiData";
import { notatBroadcastName } from "../../../types/notat";

export const FormLayout = ({
    title,
    main,
    side,
    pageAlert,
}: {
    title?: ReactNode;
    main?: ReactNode;
    side?: ReactNode;
    pageAlert?: ReactNode;
}) => {
    const { behandlingId } = useForskudd();
    const queryClient = useQueryClient();
    const listenToMutations = [
        MutationKeys.oppdaterBehandling(behandlingId),
        MutationKeys.updateBoforhold(behandlingId),
        MutationKeys.updateVirkningstidspunkt(behandlingId),
        MutationKeys.updateInntekter(behandlingId),
    ];
    const saveState = useRQMutationState(listenToMutations, queryClient);

    useEffect(() => {
        if (saveState == "success") {
            console.debug("Sending broadcast", notatBroadcastName, behandlingId);
            Broadcast.sendBroadcast(notatBroadcastName, {
                id: behandlingId.toString(),
                payload: null,
            });
        }
    }, [saveState]);

    return (
        <div className="grid gap-2">
            <div className="flex flex-row gap-2">
                <Heading level="1" size="medium">
                    {title}
                </Heading>
                <SaveStatusIndicator mutationKey={listenToMutations} queryClient={queryClient} />
            </div>
            <BidragGrid className="grid grid-cols-12 gap-6">
                <BidragCell className="sm:col-span-12 md:col-span-12 xl:col-span-12 2xl:col-span-8 h-fit grid gap-y-4">
                    {pageAlert}
                    {main}
                </BidragCell>
                <BidragCell className="sm:col-span-12 md:col-span-6 xl:col-span-6 2xl:col-span-4 bg-white">
                    <div className="grid gap-y-4 h-fit lg:sticky lg:top-8 lg:p-0">{side}</div>
                </BidragCell>
            </BidragGrid>
        </div>
    );
};
