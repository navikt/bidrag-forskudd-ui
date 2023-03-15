import { Checkbox } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledCheckbox = ({
    name,
    legend,
    onChange,
}: {
    name: string;
    legend: string;
    onChange?: (value: any) => void;
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
        <Checkbox {...field} checked={field.value} onChange={handleOnChange} size="small">
            {legend}
        </Checkbox>
    );
};
