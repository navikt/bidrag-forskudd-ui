import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from "@navikt/ds-react";
import React, { useEffect } from "react";

interface DatePickerModalProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    fromDate?: Date;
    placeholder?: string;
    hideLabel?: boolean;
    className?: string;
    defaultValue?: Date;
}

export const DatePickerInput = ({
    label,
    onChange,
    fromDate,
    placeholder,
    hideLabel,
    className,
    defaultValue,
}: DatePickerModalProps) => {
    const { datepickerProps, inputProps, setSelected } = UNSAFE_useDatepicker({
        onDateChange: (date) => {
            onChange(date);
        },
        fromDate,
        defaultSelected: defaultValue,
    });

    useEffect(() => {
        if (defaultValue) setSelected(defaultValue);
    }, [defaultValue]);

    return (
        <UNSAFE_DatePicker {...datepickerProps}>
            <UNSAFE_DatePicker.Input
                {...inputProps}
                className={className}
                hideLabel={hideLabel}
                placeholder={placeholder}
                label={label}
                size="small"
            />
        </UNSAFE_DatePicker>
    );
};
