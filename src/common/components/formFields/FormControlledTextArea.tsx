import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Textarea } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledTextarea = ({
    name,
    label,
    hideLabel,
    minRows,
    className,
    description,
}: {
    name: string;
    label: string;
    hideLabel?: boolean;
    minRows?: number;
    className?: string;
    description?: React.ReactNode;
}) => {
    const { control, clearErrors } = useFormContext();
    const { lesemodus } = useBehandlingProvider();

    const { field, fieldState } = useController({ name, control });

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        clearErrors(name);
        field.onChange(e.target.value);
    };

    return (
        <Textarea
            label={label}
            description={description}
            size="small"
            value={field.value}
            onChange={(e) => onChange(e)}
            hideLabel={hideLabel}
            readOnly={lesemodus}
            error={fieldState?.error?.message}
            minRows={minRows}
            className={className}
        />
    );
};
