import { behandlingMock } from "./behandlingMock";
import boforholdMock from "./boforholdMock";
import grunnlagMock from "./grunnlagMock";
import logMock from "./logMock";
import personMock from "./personMock";
import { hentSakMock } from "./sakMock";
import tokenMock from "./tokenMock";
import virkningstidspunktMock from "./virkningstidspunktMock";
export const handlers = [
    ...tokenMock(),
    ...logMock(),
    ...personMock(),
    ...hentSakMock(),
    ...grunnlagMock(),
    ...behandlingMock(),
    ...virkningstidspunktMock(),
    ...boforholdMock(),
];
