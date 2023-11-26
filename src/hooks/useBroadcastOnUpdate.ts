import { useRQMutationState } from "@navikt/bidrag-ui-common";
import { MutationStatus, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useForskudd } from "../context/ForskuddContext";
import { MutationKeys } from "./useApiData";

export default function useBroadcastOnUpdate() {
    const { behandlingId } = useForskudd();
    const currentStateRef = useRef<MutationStatus>("idle");
    const queryClient = useQueryClient();
    const state = useRQMutationState(
        [
            MutationKeys.updateBoforhold(behandlingId),
            MutationKeys.updateVirkningstidspunkt(behandlingId),
            MutationKeys.updateInntekter(behandlingId),
        ],
        queryClient
    );

    useEffect(() => {
        if (currentStateRef.current == "pending" && state == "success") {
            const broadcastChannel = 
        }
        currentStateRef.current = state;
    }, [state]);
}
