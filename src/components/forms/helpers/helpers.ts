import { AxiosResponse } from "axios";

import { VirkningsTidspunktResponse } from "../../../api/BidragBehandlingApi";
import { VirkningstidspunktFormValues } from "../../../types/virkningstidspunktFormValues";
import { DDMMYYYYStringToDate } from "../../../utils/date-utils";

export const getVirkningstidspunkt = (
    virkningstidspunktFormValues: VirkningstidspunktFormValues,
    virkningstidspunkt: AxiosResponse<VirkningsTidspunktResponse>
) =>
    virkningstidspunktFormValues?.virkningsDato
        ? virkningstidspunktFormValues.virkningsDato
        : virkningstidspunkt?.data.virkningsDato
        ? DDMMYYYYStringToDate(virkningstidspunkt.data.virkningsDato)
        : null;
