import { AlertProps } from "@navikt/ds-react";
import React from "react";

import { ForskuddAlert } from "./ForskuddAlert";

type StatefulAlertProps = {
    children?: React.ReactNode;
    alertKey: string;
};
export default function StatefulAlert({ children, ...alertprops }: StatefulAlertProps & AlertProps) {
    return <AlertWithCloseButton {...alertprops}>{children}</AlertWithCloseButton>;
}
const AlertWithCloseButton = ({
    children,
    alertKey,
    ...alertProps
}: {
    children?: React.ReactNode;
    alertKey: string;
} & AlertProps) => {
    const [show, setShow] = React.useState(window.localStorage.getItem(alertKey) !== "closed");

    const close = () => {
        window.localStorage.setItem(alertKey, "closed");
        setShow(false);
    };
    return (
        show && (
            <ForskuddAlert size="small" {...alertProps} closeButton={alertProps.closeButton} onClose={close}>
                {children || "Content"}
            </ForskuddAlert>
        )
    );
};
