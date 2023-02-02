import "../index.css";
import "@navikt/ds-css";
import "@navikt/ds-css-internal";

import React, { PropsWithChildren } from "react";

import { initMock } from "../__mocks__/msw";

initMock();

interface PageWrapperProps {
    name: string;
}
export default function PageWrapper({ children, name }: PropsWithChildren<PageWrapperProps>) {
    return <div className={name}>{children}</div>;
}
