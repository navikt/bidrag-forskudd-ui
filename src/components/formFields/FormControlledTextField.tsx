import { TextField } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledTextField = ({
    name,
    label,
    hideLabel,
    type,
}: {
    name: string;
    label: string;
    hideLabel?: boolean;
    type?: "number" | "email" | "password" | "tel" | "text" | "url";
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field } = useController({ name, control });

    return (
        <TextField
            type={type}
            label={label}
            size="small"
            value={field.value}
            onChange={field.onChange}
            hideLabel={hideLabel}
        />
    );
};
