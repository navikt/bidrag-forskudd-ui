import { useQueryClient } from "@tanstack/react-query";

import { BehandlingDtoV2 } from "../api/BidragBehandlingApiV1";
import { useForskudd } from "../context/ForskuddContext";
import { QueryKeys, useUpdateInntekt } from "./useApiData";

export const useOnSaveInntekt = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useForskudd();
    const mutation = useUpdateInntekt();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
