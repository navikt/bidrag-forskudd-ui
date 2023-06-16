import { MonthPicker as NavMonthPicker, MonthValidationT, useMonthpicker } from "@navikt/ds-react";
import { useEffect } from "react";

import { isValidDate, lastDayOfMonth } from "../../utils/date-utils";

interface MonthPickerInputProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    fromDate?: Date;
    placeholder?: string;
    hideLabel?: boolean;
    className?: string;
    defaultValue?: Date;
    error?: string;
    onValidate?: (monthValidation: MonthValidationT) => void;
    toDate?: Date;
    lastDayOfMonthPicker?: boolean;
    fieldValue?: Date;
}
export const MonthPicker = ({
    label,
    onChange,
    fromDate,
    toDate,
    placeholder,
    hideLabel,
    className,
    defaultValue,
    onValidate,
    error,
    lastDayOfMonthPicker,
    fieldValue,
}: MonthPickerInputProps) => {
    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate,
        toDate,
        onValidate: (val) => {
            if (onValidate) onValidate(val);
        },
        onMonthChange: (date) => {
            onChange(date);
        },
        defaultSelected: isValidDate(defaultValue) ? defaultValue : null,
        inputFormat: "dd.MM.yyyy",
    });

    const onMonthSelect = (date) => {
        const dateToSave = isValidDate(date) ? (lastDayOfMonthPicker ? lastDayOfMonth(date) : date) : null;
        monthpickerProps.onMonthSelect(dateToSave);
    };

    useEffect(() => {
        if (isValidDate(fieldValue) && selectedMonth?.toLocaleString() !== fieldValue?.toLocaleString()) {
            setSelected(fieldValue);
        }
    }, [fieldValue]);

    return (
        <div className="min-h-96">
            <NavMonthPicker {...monthpickerProps} onMonthSelect={onMonthSelect}>
                <div className="grid gap-4">
                    <NavMonthPicker.Input
                        {...inputProps}
                        className={className}
                        label={label}
                        error={error}
                        hideLabel={hideLabel}
                        placeholder={placeholder}
                        size="small"
                    />
                </div>
            </NavMonthPicker>
        </div>
    );
};
