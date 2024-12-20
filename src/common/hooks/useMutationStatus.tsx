import { MutationKeys } from "@common/hooks/useApiData";
import { Broadcast, useRQMutationState } from "@navikt/bidrag-ui-common";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { notatBroadcastName } from "../../forskudd/constants/notat";

export const useMutationStatus = (behandlingId: string) => {
    const queryClient = useQueryClient();
    const listenToMutations = [
        MutationKeys.oppdaterBehandling(behandlingId),
        MutationKeys.updateBoforhold(behandlingId),
        MutationKeys.updateVirkningstidspunkt(behandlingId),
        MutationKeys.updateInntekter(behandlingId),
        MutationKeys.updateUtgifter(behandlingId),
        MutationKeys.oppretteUnderholdForBarn(behandlingId),
        MutationKeys.updateUtgifter(behandlingId),
        MutationKeys.updateStonadTilBarnetilsyn(behandlingId),
        MutationKeys.updateFaktiskeTilsynsutgifter(behandlingId),
        MutationKeys.updateTilleggstønad(behandlingId),
        MutationKeys.slettUnderholdsElement(behandlingId),
        MutationKeys.oppdatereTilsynsordning(behandlingId),
    ];
    const mutationStatus = useRQMutationState(listenToMutations, queryClient);

    useEffect(() => {
        if (mutationStatus === "success") {
            console.debug("Sending broadcast", notatBroadcastName, behandlingId);
            Broadcast.sendBroadcast(notatBroadcastName, {
                id: behandlingId.toString(),
                payload: null,
            });
        }
    }, [mutationStatus]);

    return mutationStatus;
};
