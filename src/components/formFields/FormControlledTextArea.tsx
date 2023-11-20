import { Textarea } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledTextarea = ({
    name,
    label,
    hideLabel,
}: {
    name: string;
    label: string;
    hideLabel?: boolean;
}) => {
    const { control } = useFormContext();

    const { field } = useController({ name, control });

    return <Textarea label={label} size="small" value={field.value} onChange={field.onChange} hideLabel={hideLabel} />;
};
