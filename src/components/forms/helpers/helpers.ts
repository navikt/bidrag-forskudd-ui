import { AxiosResponse } from "axios";

import { BehandlingDto } from "../../../api/BidragBehandlingApi";
import { VirkningstidspunktFormValues } from "../../../types/virkningstidspunktFormValues";

export const getVirkningstidspunkt = (
    virkningstidspunktFormValues: VirkningstidspunktFormValues,
    behandling: AxiosResponse<BehandlingDto>
) =>
    virkningstidspunktFormValues?.virkningsDato
        ? virkningstidspunktFormValues.virkningsDato
        : behandling?.data.virkningsDato
        ? new Date(behandling.data.virkningsDato)
        : null;
