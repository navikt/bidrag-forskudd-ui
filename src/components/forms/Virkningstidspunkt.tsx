import {
    Button,
    Heading,
    Select,
    Textarea,
    TextField,
    UNSAFE_DatePicker,
    UNSAFE_useDatepicker,
} from "@navikt/ds-react";
import React from "react";

import { STEPS } from "../../constants/steps";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";

export default function Virkningstidspunkt({ setActiveStep }: CommonFormProps) {
    const { datepickerProps, inputProps, selectedDay } = UNSAFE_useDatepicker({
        fromDate: new Date("Aug 23 2019"),
        onDateChange: console.log,
    });

    const onNext = () => {
        setActiveStep(STEPS[ForskuddStepper.INNTEKT]);
    };

    return (
        <div>
            <Heading level="2" size="xlarge">
                Virkningstidspunkt
            </Heading>
            <form>
                <div className="grid gap-y-4 mt-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <Select label="Søknadstype" className="w-52" size="small">
                            <option value="">Søknad</option>
                            <option value="søknad_1">Søknad 1</option>
                            <option value="søknad_2">Søknad 2</option>
                            <option value="søknad_3">Søknad 3</option>
                        </Select>
                        <Select label="Søknad fra" className="w-52" size="small">
                            <option value="BM">BM</option>
                            <option value="BP">BP</option>
                        </Select>
                        <UNSAFE_DatePicker {...datepickerProps}>
                            <UNSAFE_DatePicker.Input {...inputProps} label="Mottat dato" size="small" />
                        </UNSAFE_DatePicker>
                        <UNSAFE_DatePicker {...datepickerProps}>
                            <UNSAFE_DatePicker.Input {...inputProps} label="Søkt fra dato" size="small" />
                        </UNSAFE_DatePicker>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <UNSAFE_DatePicker {...datepickerProps}>
                            <UNSAFE_DatePicker.Input {...inputProps} label="Virkningstidspunkt" size="small" />
                        </UNSAFE_DatePicker>
                        <Select label="Årsak" className="w-52" size="small">
                            <option value="aarsak_1">Årsak 1</option>
                            <option value="aarsak_2">Årsak 2</option>
                        </Select>
                        <Select label="Avslag/opphør" className="w-52" size="small">
                            <option value="avslag_1">Avslag 1</option>
                            <option value="avslag_2">Avslag 2</option>
                        </Select>
                    </div>
                    <Textarea label="Begrunnelse (med i vedtaket og notat)" size="small" />
                    <TextField label="Begrunnelse (kun med i notat)" size="small" />
                    <Button loading={false} onClick={onNext} className="w-max" size="small">
                        Gå videre
                    </Button>
                </div>
            </form>
        </div>
    );
}
