import "cross-fetch/polyfill";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "mocha";
import sinon from "sinon";

// @ts-ignore

export const sinonSandbox = sinon.createSandbox();
export async function mochaGlobalSetup() {
    // @ts-ignore
    global.window.showErrorPage = (error) => {
        console.log("showErrorPage was called with error=", error);
    };
    // @ts-ignore
    global.window.logErrorMessage = (message, error) => {
        console.log("logErrorMessage was called with message=", message);
    };
    global.window.open = () => null;
    global.window.focus = () => null;
    global.window.close = () => null;

    // @ts-ignore
    global.window.logToServer = {
        info: (message: string) => null,
        warning: (message: string) => null,
        debug: (message: string) => null,
        error: (message: string, err: Error) => null,
    };

    beforeEach(() => {
        cleanup();
    });

    afterEach(() => {
        sinonSandbox.reset();
        sinonSandbox.restore();
        sinonSandbox.resetBehavior();
        sinonSandbox.resetHistory();
    });
}
