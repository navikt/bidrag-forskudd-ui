import React from "react";

import text from "../constants/texts";
import { ForskuddAlert } from "./ForskuddAlert";
export default function UnderArbeidAlert() {
    return <ForskuddAlert variant="warning">{text.alert.underArbeit}</ForskuddAlert>;
}
