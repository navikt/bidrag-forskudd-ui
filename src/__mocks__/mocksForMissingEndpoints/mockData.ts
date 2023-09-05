import { createAInntektData } from "../testdata/aInntektTestData";
import { arbeidsforholdData } from "../testdata/arbeidsforholdTestData";
import { createSkattegrunnlag } from "../testdata/grunnlagTestData";

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
