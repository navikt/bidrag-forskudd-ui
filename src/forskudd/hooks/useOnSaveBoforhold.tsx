import { BehandlingDtoV2 } from "@api/BidragBehandlingApiV1";
import { QueryKeys, useUpdateBoforhold } from "@common/hooks/useApiData";
import { useQueryClient } from "@tanstack/react-query";

import { useForskudd } from "../context/ForskuddContext";

export const useOnSaveBoforhold = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useForskudd();
    const mutation = useUpdateBoforhold();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
