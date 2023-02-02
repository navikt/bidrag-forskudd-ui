import logMock from "./logMock";
import personMock from "./personMock";
import tokenMock from "./tokenMock";
export const handlers = [...tokenMock(), ...logMock(), ...personMock()];
