import { Checkbox } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledCheckbox = ({
    name,
    legend,
    onChange,
    className,
}: {
    name: string;
    legend: string;
    onChange?: (value: any) => void;
    className?: string;
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field } = useController({ name, control });

    const handleOnChange = (value) => {
        if (onChange) {
            onChange(value);
        }
        field.onChange(value);
    };

    return (
        <Checkbox {...field} checked={field.value} className={className} onChange={handleOnChange} size="small">
            {legend}
        </Checkbox>
    );
};
