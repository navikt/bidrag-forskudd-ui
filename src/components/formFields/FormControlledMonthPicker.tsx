import { MonthValidationT } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { isFirstDayOfMonth, isLastDayOfMonth, toISODateString } from "../../utils/date-utils";
import { MonthPicker } from "../date-picker/MonthPicker";

interface FormControlledDatePickerProps {
    name: string;
    label: string;
    defaultValue: string | null;
    placeholder: string;
    hideLabel?: boolean;
    className?: string;
    required?: boolean;
    onChange?: (date: string | null) => void;
    customValidation?: (date: string) => void;
    toDate?: Date;
    fromDate?: Date;
    lastDayOfMonthPicker?: boolean;
}

export const FormControlledMonthPicker = ({
    name,
    label,
    defaultValue,
    placeholder,
    hideLabel,
    className,
    required,
    onChange,
    toDate,
    fromDate,
    lastDayOfMonthPicker,
    customValidation,
}: FormControlledDatePickerProps) => {
    const { control, setError, clearErrors, getValues } = useFormContext();
    const { field, fieldState } = useController({
        name,
        control,
        rules: { required: required ? "Dato må fylles ut" : false },
    });

    const handleChange = (date: Date) => {
        const value = date ? toISODateString(date) : null;
        field.onChange(value);

        if (onChange) {
            onChange(value);
        }
    };

    const onValidate = (monthValidation: MonthValidationT) => {
        const date: string = getValues(name);
        const isFirstOrLastDayOfMonth = lastDayOfMonthPicker
            ? isLastDayOfMonth(new Date(date))
            : isFirstDayOfMonth(new Date(date));

        if (!monthValidation.isValidMonth && !monthValidation.isEmpty) {
            setError(name, { type: "notValid", message: "Dato er ikke gylid" });
            return;
        }
        if (required && monthValidation.isEmpty) {
            setError(name, { type: "notValid", message: "Dato må fylles ut" });
            return;
        }
        if (date) {
            if (!isFirstOrLastDayOfMonth) {
                setError(name, {
                    type: "notValid",
                    message: lastDayOfMonthPicker
                        ? "Dato må være den siste i måneden"
                        : "Dato må være den første i måneden",
                });
                return;
            }
        }
        clearErrors(name);

        if (customValidation) {
            customValidation(date);
            return;
        }
    };

    return (
        <MonthPicker
            label={label}
            placeholder={placeholder}
            onChange={(value) => handleChange(value)}
            defaultValue={defaultValue}
            hideLabel={hideLabel}
            className={className}
            error={fieldState?.error?.message}
            onValidate={onValidate}
            toDate={toDate}
            fromDate={fromDate}
            lastDayOfMonthPicker={lastDayOfMonthPicker}
            fieldValue={field.value}
        />
    );
};
