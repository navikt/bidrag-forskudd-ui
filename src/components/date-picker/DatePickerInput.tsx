import { DatePicker, DateValidationT, useDatepicker } from "@navikt/ds-react";
import React, { useEffect } from "react";

interface DatePickerInputProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    fromDate?: Date;
    placeholder?: string;
    hideLabel?: boolean;
    className?: string;
    defaultValue?: Date;
    error?: string;
    strategy?: "absolute" | "fixed";
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
    onValidate,
    error,
    strategy = "absolute",
}: DatePickerInputProps) => {
    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        onDateChange: (date) => {
            onChange(date);
        },
        onValidate: (val) => {
            if (onValidate) onValidate(val);
        },
        fromDate,
        defaultSelected: defaultValue,
    });
    datepickerProps.strategy = strategy;

    useEffect(() => {
        if (datepickerProps.selected?.toLocaleString() !== defaultValue?.toLocaleString()) {
            setSelected(defaultValue);
        }
    }, [defaultValue]);

    return (
        <DatePicker {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                className={className}
                hideLabel={hideLabel}
                placeholder={placeholder}
                label={label}
                error={error}
                size="small"
            />
        </DatePicker>
    );
};
