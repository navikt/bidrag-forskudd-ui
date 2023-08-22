import { MonthPicker as NavMonthPicker, MonthValidationT, useMonthpicker } from "@navikt/ds-react";
import { useEffect } from "react";

import { dateOrNull, isValidDate, lastDayOfMonth } from "../../utils/date-utils";

interface MonthPickerInputProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    fromDate?: Date;
    placeholder?: string;
    hideLabel?: boolean;
    className?: string;
    defaultValue?: string;
    error?: string;
    onValidate?: (monthValidation: MonthValidationT) => void;
    toDate?: Date;
    lastDayOfMonthPicker?: boolean;
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
}: MonthPickerInputProps) => {
    const { monthpickerProps, inputProps, setSelected } = useMonthpicker({
        fromDate,
        toDate,
        defaultSelected: isValidDate(new Date(defaultValue)) ? dateOrNull(defaultValue) : null,
        inputFormat: "dd.MM.yyyy",
        onValidate: (val) => {
            if (onValidate) onValidate(val);
        },
        onMonthChange: (date) => {
            onChange(date);
        },
    });

    const onMonthSelect = (date) => {
        const dateToSave = isValidDate(date) ? (lastDayOfMonthPicker ? lastDayOfMonth(date) : date) : null;
        monthpickerProps.onMonthSelect(dateToSave);
    };

    useEffect(() => {
        const value = isValidDate(new Date(defaultValue)) ? dateOrNull(defaultValue) : null;
        setSelected(value);
    }, [defaultValue]);

    return (
        <div className="min-h-96">
            <NavMonthPicker {...monthpickerProps} onMonthSelect={onMonthSelect} dropdownCaption>
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
