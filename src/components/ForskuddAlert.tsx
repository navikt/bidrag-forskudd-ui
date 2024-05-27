import { Alert, AlertProps } from "@navikt/ds-react";
import React from "react";

type ForskuddAlertProps = {
    children?: React.ReactNode;
};

export const ForskuddAlert = ({ children, ...alertProps }: ForskuddAlertProps & AlertProps) => {
    return (
        <Alert {...alertProps} size="small" className="w-[708px]">
            {children}
        </Alert>
    );
};
