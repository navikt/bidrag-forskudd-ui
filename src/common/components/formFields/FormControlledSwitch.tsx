import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Switch } from "@navikt/ds-react";
import React, { BaseSyntheticEvent } from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledSwitch = ({
    name,
    legend,
    onChange,
    className,
}: {
    name: string;
    legend: string;
    onChange?: (checked: boolean) => void;
    className?: string;
}) => {
    const { control } = useFormContext();
    const { lesemodus } = useBehandlingProvider();
    const { field } = useController({ name, control });

    const handleOnChange = (value: BaseSyntheticEvent) => {
        field.onChange(value.target.checked);
        onChange?.(value.target.checked);
    };

    return (
        <Switch
            {...field}
            checked={field.value}
            className={className}
            onChange={handleOnChange}
            size="small"
            readOnly={lesemodus}
        >
            {legend}
        </Switch>
    );
};
