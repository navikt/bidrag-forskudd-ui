import { Button, Heading, Select, Textarea, TextField } from "@navikt/ds-react";
import React, { useState } from "react";

import { STEPS } from "../../constants/steps";
import { ForskuddBeregningKodeAarsak } from "../../enum/ForskuddBeregningKodeAarsak";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { DatePickerInput } from "../date-picker/DatePickerInput";

export default ({ setActiveStep }: CommonFormProps) => {
    const [mottatDato, setMottatDato] = useState<Date>(undefined);
    const [soktFraDato, setSoktFraDato] = useState<Date>(undefined);
    const [virkningstidspunktDato, setVirkningstidspunktDato] = useState<Date>(undefined);
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
                        <DatePickerInput
                            label="Mottat dato"
                            defaultSelected={mottatDato}
                            onChange={(selectedDay) => setMottatDato(selectedDay)}
                        />
                        <DatePickerInput
                            label="Søkt fra dato"
                            defaultSelected={soktFraDato}
                            onChange={(selectedDay) => setSoktFraDato(selectedDay)}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <DatePickerInput
                            label="Virkningstidspunkt"
                            defaultSelected={virkningstidspunktDato}
                            onChange={(selectedDay) => setVirkningstidspunktDato(selectedDay)}
                        />
                        <Select label="Årsak" className="w-52" size="small">
                            <option value="">Velg årsak</option>
                            {Object.entries(ForskuddBeregningKodeAarsak).map((entry) => (
                                <option key={entry[0]} value={entry[0]}>
                                    {entry[1]}
                                </option>
                            ))}
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
};
