import { BodyLong, Modal } from "@navikt/ds-react";
import { forwardRef, MutableRefObject, ReactNode } from "react";

export const ConfirmationModal = forwardRef(
    (
        {
            heading,
            description,
            footer,
        }: {
            heading: string;
            description: string;
            footer: ReactNode;
        },
        ref: MutableRefObject<HTMLDialogElement>
    ) => {
        return (
            <Modal ref={ref} header={{ heading }} closeOnBackdropClick>
                <Modal.Body>
                    <BodyLong>{description}</BodyLong>
                </Modal.Body>
                <Modal.Footer>{footer}</Modal.Footer>
            </Modal>
        );
    }
);
