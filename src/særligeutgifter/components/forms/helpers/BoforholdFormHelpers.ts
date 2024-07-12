import { BoforholdDtoV2 } from "@api/BidragBehandlingApiV1";
import { compareHusstandsBarn } from "@common/helpers/boforholdFormHelpers";
import { BoforholdFormValues } from "@common/types/boforholdFormValues";

export const createInitialValues = (boforhold: BoforholdDtoV2): BoforholdFormValues => {
    return {
        ...boforhold,
        husstandsbarn: boforhold.husstandsbarn.sort(compareHusstandsBarn),
        andreVoksneIHusstanden: boforhold.andreVoksneIHusstanden,
    };
};
