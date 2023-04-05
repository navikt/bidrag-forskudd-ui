import { MonthValidationT, UNSAFE_MonthPicker, UNSAFE_useMonthpicker } from "@navikt/ds-react";
import { useEffect } from "react";

import { isValidDate } from "../../utils/date-utils";

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
    fieldValue,
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
        defaultSelected: isValidDate(defaultValue) ? defaultValue : null,
        inputFormat: "MM.yyyy",
    });

    useEffect(() => {
        if (isValidDate(fieldValue) && selectedMonth?.toLocaleString() !== fieldValue?.toLocaleString()) {
            setSelected(fieldValue);
        }
    }, [fieldValue]);

    const handleChange = (e) => {
        let inputValue = "";

        if (e.nativeEvent.inputType.includes("delete")) {
            inputProps.onChange(e);
            return;
        }
        if (e.target.value.length > 7 || isNaN(parseInt(e.nativeEvent.data))) {
            return;
        }

        if (/^\d*\.?\d*$/.test(e.target.value)) {
            const monthPart = e.target.value.slice(0, 2);

            if (
                monthPart.length > 1 &&
                (monthPart.charAt(0) > 1 || (monthPart.charAt(1) > 2 && monthPart.charAt(0) !== "0"))
            ) {
                inputValue = "0" + monthPart.charAt(0) + "." + e.target.value.slice(1);
            } else if (monthPart.length > 1) {
                inputValue = monthPart + "." + e.target.value.slice(3);
            } else {
                inputValue = e.target.value;
            }
        } else {
            inputValue = e.target.value.replace(/[^\d.]/g, "");
        }

        const event = {
            ...e,
            target: {
                ...e.target,
                value: inputValue,
            },
        };
        inputProps.onChange(event);
    };

    return (
        <div className="min-h-96">
            <UNSAFE_MonthPicker {...monthpickerProps}>
                <div className="grid gap-4">
                    <UNSAFE_MonthPicker.Input
                        {...inputProps}
                        onChange={handleChange}
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
