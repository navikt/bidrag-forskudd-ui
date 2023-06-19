import { MonthValidationT } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { isFirstDayOfMonth, isLastDayOfMonth } from "../../utils/date-utils";
import { MonthPicker } from "../date-picker/MonthPicker";

interface FormControlledDatePickerProps {
    name: string;
    label: string;
    defaultValue: Date | null;
    placeholder: string;
    hideLabel?: boolean;
    className?: string;
    required?: boolean;
    onChange?: (date: Date | undefined) => void;
    toDate?: Date;
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
    lastDayOfMonthPicker,
}: FormControlledDatePickerProps) => {
    const { control, setError, clearErrors, getValues } = useFormContext();
    const { field, fieldState } = useController({
        name,
        control,
        rules: {
            required: required ? "Dato må fylles ut" : false,
            validate: () => {
                const date = getValues(name);
                if (!date) return false;

                const isFirstOrLastDayOfMonth = lastDayOfMonthPicker ? isLastDayOfMonth(date) : isFirstDayOfMonth(date);
                const errorMessage = !isFirstOrLastDayOfMonth
                    ? lastDayOfMonthPicker
                        ? "Dato må være den siste i måneden"
                        : "Dato må være den første i måneden"
                    : undefined;
                return errorMessage ?? false;
            },
        },
    });

    const handleChange = (date: Date) => {
        field.onChange(date);
        clearErrors(name);

        if (onChange) {
            onChange(date);
        }
    };

    const onValidate = (monthValidation: MonthValidationT) => {
        if (!monthValidation.isValidMonth && !monthValidation.isEmpty) {
            setError(name, { type: "notValid", message: "Dato er ikke gylid" });
            return;
        }
        clearErrors(name);
    };

    return (
        <MonthPicker
            label={label}
            placeholder={placeholder}
            onChange={(value) => handleChange(value)}
            fieldValue={field.value}
            defaultValue={defaultValue}
            hideLabel={hideLabel}
            className={className}
            error={fieldState?.error?.message}
            onValidate={onValidate}
            toDate={toDate}
            lastDayOfMonthPicker={lastDayOfMonthPicker}
        />
    );
};
