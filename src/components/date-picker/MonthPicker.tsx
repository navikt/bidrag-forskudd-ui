import { MonthValidationT, UNSAFE_MonthPicker, UNSAFE_useMonthpicker } from "@navikt/ds-react";
import { useEffect } from "react";

interface MonthPickerInputProps {
    onChange: (selectedDay: Date | undefined) => void;
    label: string;
    fromDate?: Date;
    placeholder?: string;
    hideLabel?: boolean;
    className?: string;
    defaultValue?: Date;
    resetDefaultValue?: boolean;
    error?: string;
    onValidate?: (monthValidation: MonthValidationT) => void;
    toDate?: Date;
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
    resetDefaultValue,
    onValidate,
    error,
}: MonthPickerInputProps) => {
    const { monthpickerProps, inputProps, selectedMonth, setSelected } = UNSAFE_useMonthpicker({
        fromDate,
        toDate,
        onMonthChange: (date) => {
            onChange(date);
        },
        onValidate: (val) => {
            if (onValidate) onValidate(val);
        },
        defaultSelected: defaultValue,
        inputFormat: "MM.yyyy",
    });

    useEffect(() => {
        if (selectedMonth?.toLocaleString() !== defaultValue?.toLocaleString() || resetDefaultValue) {
            setSelected(defaultValue);
        }
    }, [defaultValue, resetDefaultValue]);

    return (
        <div className="min-h-96">
            <UNSAFE_MonthPicker {...monthpickerProps}>
                <div className="grid gap-4">
                    <UNSAFE_MonthPicker.Input
                        {...inputProps}
                        className={className}
                        label={label}
                        error={error}
                        hideLabel={hideLabel}
                        placeholder={placeholder}
                        size="small"
                    />
                </div>
            </UNSAFE_MonthPicker>
        </div>
    );
};