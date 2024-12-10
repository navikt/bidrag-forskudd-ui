import { GebyrRolleDto } from "@api/BidragBehandlingApiV1";

import { EndeligIlagtGebyr, GebyrFormValues } from "../../../types/gebyrFormValues";

export const createInitialValues = (gebyrRoller: GebyrRolleDto[]): GebyrFormValues => {
    return {
        gebyrRoller: gebyrRoller.map((gebyrRolle) => ({
            ...gebyrRolle,
            endeligIlagtGebyr: gebyrRolle.endeligIlagtGebyr ? EndeligIlagtGebyr.Ilagt : EndeligIlagtGebyr.Fritatt,
        })),
    };
};
