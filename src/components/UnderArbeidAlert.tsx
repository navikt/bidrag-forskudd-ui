import { Alert } from "@navikt/ds-react";
import React from "react";

import text from "../constants/texts";
export default function UnderArbeidAlert() {
    return <Alert variant="warning">{text.alert.underArbeit}</Alert>;
}
