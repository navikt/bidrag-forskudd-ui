import { behandlingMock } from "./behandlingMock";
import { beregningMock } from "./beregningMock";
import grunnlagMock from "./grunnlagMock";
import inntektTransformerMock from "./inntektTransformerMock";
import logMock from "./logMock";
import personMock from "./personMock";
import { hentSakMock } from "./sakMock";
import tokenMock from "./tokenMock";
import unleashMock from "./unleashMock";
import visningsNavnMock from "./visningsNavnMock";
export const handlers = [
    ...unleashMock(),
    ...beregningMock(),
    ...tokenMock(),
    ...logMock(),
    ...personMock(),
    ...hentSakMock(),
    ...grunnlagMock(),
    ...behandlingMock(),
    ...inntektTransformerMock(),
    ...visningsNavnMock(),
];
