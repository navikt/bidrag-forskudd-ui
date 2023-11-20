import { Alert } from "@navikt/ds-react";

export default function UnderArbeidAlert() {
    return (
        <Alert variant="warning">
            Denne siden er under arbeid og er ikke klar for testing. Du vil få beskjed når du kan begynne å teste denne
            siden.
        </Alert>
    );
}
