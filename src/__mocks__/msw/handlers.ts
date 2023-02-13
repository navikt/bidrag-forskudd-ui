import grunnlagMock from "./grunnlagMock";
import logMock from "./logMock";
import personMock from "./personMock";
import { hentSakMock } from "./sakMock";
import tokenMock from "./tokenMock";
export const handlers = [...tokenMock(), ...logMock(), ...personMock(), ...hentSakMock(), ...grunnlagMock()];
