import { behandlingMock } from "./behandlingMock";
import { beregningMock } from "./beregningMock";
import boforholdMock from "./boforholdMock";
import grunnlagMock from "./grunnlagMock";
import inntektMock from "./inntekterMock";
import inntektTransformerMock from "./inntektTransformerMock";
import logMock from "./logMock";
import personMock from "./personMock";
import { hentSakMock } from "./sakMock";
import tokenMock from "./tokenMock";
import virkningstidspunktMock from "./virkningstidspunktMock";
import visningsNavnMock from "./visningsNavnMock";
export const handlers = [
    ...beregningMock(),
    ...tokenMock(),
    ...logMock(),
    ...personMock(),
    ...hentSakMock(),
    ...grunnlagMock(),
    ...behandlingMock(),
    ...virkningstidspunktMock(),
    ...boforholdMock(),
    ...inntektMock(),
    ...inntektTransformerMock(),
    ...visningsNavnMock(),
];
