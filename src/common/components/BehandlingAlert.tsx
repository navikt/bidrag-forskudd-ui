import { Alert, AlertProps } from "@navikt/ds-react";
import React from "react";

type ForskuddAlertProps = {
    children?: React.ReactNode;
};

export const BehandlingAlert = ({ children, ...alertProps }: ForskuddAlertProps & AlertProps) => {
    return (
        <Alert {...alertProps} size="small" className={alertProps.className ?? "w-[708px]"}>
            {children}
        </Alert>
    );
};
