import { RolleDto } from "../../api/BidragBehandlingApi";
import { createAInntektData } from "../testdata/aInntektTestData";
import { arbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { createSkattegrunnlag } from "../testdata/grunnlagTestData";
import { inntektData } from "../testdata/inntektTestData";

export const initMockData = () => {
    if (!localStorage.getItem("arbeidsforhold")) {
        localStorage.setItem(`arbeidsforhold`, JSON.stringify(arbeidsforholdData()));
    }
    if (!localStorage.getItem("skattegrunlag")) {
        localStorage.setItem(`skattegrunlag`, JSON.stringify(createSkattegrunnlag()));
    }
    if (!localStorage.getItem("ainntekt")) {
        localStorage.setItem(`ainntekt`, JSON.stringify(createAInntektData()));
    }
};

export const inntektMockData = (behandlingId: string, roller: RolleDto[]) => {
    if (!localStorage.getItem(`inntekt-${behandlingId}`)) {
        localStorage.setItem(`inntekt-${behandlingId}`, JSON.stringify(inntektData(roller)));
    }

    return JSON.parse(localStorage.getItem(`inntekt-${behandlingId}`));
};
