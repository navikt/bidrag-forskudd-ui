import "./errorModal.css";

import { XMarkOctagonFillIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading, Modal } from "@navikt/ds-react";
import React from "react";

export const ErrorModal = ({ errorModalOpen, setErrorModalOpen }) => (
    <Modal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        aria-labelledby="modal-heading"
        className="error-modal"
    >
        <Modal.Header>
            <Heading level="1" size="large" id="modal-heading">
                <div className="error-heading">
                    <XMarkOctagonFillIcon title="a11y-title" fontSize="1.5rem" className="error-icon" />
                    Fullfør redigering
                </div>
            </Heading>
        </Modal.Header>
        <Modal.Body>
            <BodyLong className="error-body">
                Det er en periode som er under redigering. Fullfør redigering eller slett periode.
            </BodyLong>
        </Modal.Body>
    </Modal>
);
