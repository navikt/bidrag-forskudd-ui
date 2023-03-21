import { DateValidationT, UNSAFE_DatePicker, UNSAFE_useDatepicker } from "@navikt/ds-react";
import React, { useEffect } from "react";

interface DatePickerModalProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    fromDate?: Date;
    placeholder?: string;
    hideLabel?: boolean;
    className?: string;
    defaultValue?: Date;
    resetDefaultValue?: boolean;
    error?: string;
    onValidate?: (dateValidation: DateValidationT) => void;
}

export const DatePickerInput = ({
    label,
    onChange,
    fromDate,
    placeholder,
    hideLabel,
    className,
    defaultValue,
    resetDefaultValue,
    onValidate,
    error,
}: DatePickerModalProps) => {
    const { datepickerProps, inputProps, setSelected } = UNSAFE_useDatepicker({
        onDateChange: (date) => {
            onChange(date);
        },
        onValidate: (val) => {
            if (onValidate) onValidate(val);
        },
        fromDate,
        defaultSelected: defaultValue,
    });

    useEffect(() => {
        if (datepickerProps.selected?.toLocaleString() !== defaultValue?.toLocaleString() || resetDefaultValue) {
            setSelected(defaultValue);
        }
    }, [defaultValue, resetDefaultValue]);

    return (
        <UNSAFE_DatePicker {...datepickerProps}>
            <UNSAFE_DatePicker.Input
                {...inputProps}
                className={className}
                hideLabel={hideLabel}
                placeholder={placeholder}
                label={label}
                error={error}
                size="small"
            />
        </UNSAFE_DatePicker>
    );
};
