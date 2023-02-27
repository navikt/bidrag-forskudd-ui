import { ExternalLink } from "@navikt/ds-icons";
import { Button, Checkbox, CheckboxGroup, Heading, Label, Link, Select, Textarea, TextField } from "@navikt/ds-react";
import React from "react";

import { DatePickerInput } from "../date-picker/DatePickerInput";
import { FlexRow } from "../layout/grid/FlexRow";

export default () => {
    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Boforhold
                </Heading>
                <Heading level="3" size="medium">
                    Barn som er med i saken
                </Heading>
                <FlexRow>
                    <div>
                        <DatePickerInput
                            label="Periode"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label=""
                            className="mt-5"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <CheckboxGroup
                            legend="Bor ikke med foreldre"
                            onChange={(val: any[]) => console.log(val)}
                            size="small"
                            className="flex justify-center"
                        >
                            <Checkbox value="true">{""}</Checkbox>
                        </CheckboxGroup>
                    </div>
                    <div>
                        <CheckboxGroup
                            legend="Registrert på adresse"
                            onChange={(val: any[]) => console.log(val)}
                            size="small"
                            className="flex justify-center"
                        >
                            <Checkbox value="true">{""}</Checkbox>
                        </CheckboxGroup>
                    </div>
                    <div>
                        <Select label="Kilde" className="w-52" size="small">
                            <option value="offentlig">Offentlig</option>
                            <option value="manuelt">Manuelt</option>
                        </Select>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Barn som er ikke med i saken
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Navn</Label>
                    </div>
                    <div>
                        <Label size="small">Fødselsnummer</Label>
                    </div>
                </FlexRow>
                <FlexRow>
                    <div>
                        <DatePickerInput
                            label="Periode"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label=""
                            className="mt-5"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <CheckboxGroup
                            legend="Registrert på adresse"
                            onChange={(val: any[]) => console.log(val)}
                            size="small"
                            className="flex justify-center"
                        >
                            <Checkbox value="true">{""}</Checkbox>
                        </CheckboxGroup>
                    </div>
                    <div>
                        <Select label="Kilde" className="w-52" size="small">
                            <option value="offentlig">Offentlig</option>
                            <option value="manuelt">Manuelt</option>
                        </Select>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Sivilstand
                </Heading>
                <FlexRow>
                    <div>
                        <DatePickerInput
                            label="Periode"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label=""
                            className="mt-5"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <Select label="Sivilstand" className="w-52" size="small">
                            <option value="ugift">Ugift</option>
                            <option value="gift">Gift</option>
                        </Select>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kommentar
                </Heading>
                <Textarea label="Begrunnelse (med i vedtaket og notat)" size="small" />
                <TextField label="Begrunnelse (kun med i notat)" size="small" />
            </div>
            <FlexRow>
                <Button loading={false} onClick={() => {}} className="w-max" size="small">
                    Gå videre
                </Button>
                <Button loading={false} variant="secondary" onClick={() => {}} className="w-max" size="small">
                    Oppfrisk
                </Button>
                <Button loading={false} variant="secondary" onClick={() => {}} className="w-max" size="small">
                    Lagre
                </Button>
                <Link href="#" onClick={() => {}} className="font-bold">
                    Vis notat <ExternalLink aria-hidden />
                </Link>
            </FlexRow>
        </div>
    );
};
