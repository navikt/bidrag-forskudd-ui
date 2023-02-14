import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from "@navikt/ds-react";
import React from "react";

interface DatePickerModalProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    defaultSelected?: Date;
    fromDate?: Date;
}

export const DatePickerInput = ({ label, onChange, defaultSelected, fromDate = new Date() }: DatePickerModalProps) => {
    const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
        onDateChange: (date) => onChange(date),
        fromDate,
        defaultSelected,
    });

    return (
        <UNSAFE_DatePicker {...datepickerProps}>
            <UNSAFE_DatePicker.Input {...inputProps} label={label} size="small" />
        </UNSAFE_DatePicker>
    );
};
