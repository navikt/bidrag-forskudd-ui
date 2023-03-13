import { UNSAFE_DatePicker } from "@navikt/ds-react";

export const DatePickerRangeStandalone = ({ selected, onSelect }) => {
    return <UNSAFE_DatePicker.Standalone mode="range" onSelect={onSelect} selected={selected} />;
};
