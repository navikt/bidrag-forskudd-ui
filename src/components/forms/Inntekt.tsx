import { Edit, ExternalLink } from "@navikt/ds-icons";
import {
    BodyShort,
    Button,
    Checkbox,
    CheckboxGroup,
    Heading,
    Label,
    Link,
    Radio,
    RadioGroup,
    ReadMore,
    Select,
    Textarea,
    TextField,
} from "@navikt/ds-react";
import React from "react";

import { useApiData } from "../../hooks/useApiData";
import { DatePickerInput } from "../date-picker/DatePickerInput";
import { DatePickerModal } from "../date-picker/DatePickerModal";
import { FlexRow } from "../layout/grid/FlexRow";

export default () => {
    const { api } = useApiData();
    const { data } = api.getSkattegrunnlager();

    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Inntekt
                </Heading>
                <div className="grid gap-y-2">
                    <div className="flex">
                        <Label size="small">Periode: </Label>
                        <span className="w-52"></span>
                        <DatePickerModal
                            button={(datePickerButtonProps) => (
                                <Button
                                    onClick={datePickerButtonProps.onClick}
                                    icon={<Edit aria-hidden />}
                                    variant="tertiary"
                                    size="xsmall"
                                >
                                    Rediger
                                </Button>
                            )}
                        />
                    </div>
                    <div>
                        <Label size="small">Gjennomsnitt Inntekt siste 3 måneder (omregnet til årsinntekt):</Label>
                    </div>
                    <div>
                        <Label size="small">Gjennomsnitt Inntekt siste 12 måneder (omregnet til årsinntekt):</Label>
                    </div>
                    {data?.pages.map((skattegrunnlager) =>
                        skattegrunnlager.map((skattegrunnlag) => (
                            <div key={skattegrunnlag.skatteoppgjoersdato} className="flex gap-x-2">
                                <Label size="small">Skattegrunnlag ({skattegrunnlag.skatteoppgjoersdato}):</Label>
                                {skattegrunnlag?.grunnlag?.map((grunnlag) => (
                                    <BodyShort key={skattegrunnlag.skatteoppgjoersdato + grunnlag.beloep} size="small">
                                        {grunnlag.beloep}
                                    </BodyShort>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="grid gap-y-4">
                <div className="inline-flex gap-x-4">
                    <Heading level="3" size="medium">
                        Andre typer inntekt
                    </Heading>
                    <Link href="#" onClick={() => {}} className="font-bold">
                        A inntekt <ExternalLink aria-hidden />
                    </Link>
                </div>
                <div className="grid gap-y-2">
                    <div className="inline-flex items-center gap-x-2">
                        <Label size="small">Kapitalinntekt (2020):</Label>
                        <ReadMore size="small" header="Detaljer">
                            Detaljer
                        </ReadMore>
                    </div>
                    <div className="inline-flex items-center gap-x-2">
                        <Label size="small">Næringsinntekt (2020):</Label>
                        <ReadMore size="small" header="Detaljer">
                            Detaljer
                        </ReadMore>
                    </div>
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Arbeidsforhold
                </Heading>
                <div className="grid gap-y-2">
                    <div className="inline-flex items-center gap-x-4">
                        <Label size="small">Nåværende arbeidsforhold</Label>
                        <Link href="#" onClick={() => {}} className="font-bold">
                            AA-register <ExternalLink aria-hidden />
                        </Link>
                    </div>
                    <FlexRow>
                        <div>
                            <Label size="small">Periode</Label>
                        </div>
                        <div>
                            <Label size="small">Arbeidsgiver</Label>
                        </div>
                        <div>
                            <Label size="small">Stilling</Label>
                        </div>
                        <div>
                            <Label size="small">Lønnsendring</Label>
                        </div>
                    </FlexRow>
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Perioder
                </Heading>
                <FlexRow>
                    <div>
                        <DatePickerInput
                            label="Fra og med"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label="Til og med"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <TextField label="Arbeidsgiver/Nav" size="small" />
                    </div>
                    <div>
                        <TextField label="Inntekt" size="small" />
                    </div>
                    <div>
                        <TextField label="Tillegg" size="small" />
                    </div>
                    <div>
                        <TextField label="Totalt" size="small" />
                    </div>
                    <div>
                        <TextField label="Beskrivelse" size="small" />
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Utvidet barnetrygd
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
                        <TextField label="Delt bosted" size="small" />
                    </div>
                    <div>
                        <TextField label="Beløp" size="small" />
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <RadioGroup
                    legend={
                        <Heading level="3" size="medium">
                            Kontantstøtte (for hele året/ per barn)
                        </Heading>
                    }
                    onChange={(val: any) => console.log(val)}
                    size="small"
                >
                    <div className="flex gap-x-4">
                        <Radio value="true">Ja</Radio>
                        <Radio value="false">Nei</Radio>
                    </div>
                </RadioGroup>
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
                        <Select label="Barn" className="w-52" size="small">
                            <option value="barn_1">Barn 1</option>
                            <option value="barn_2">Barn 2</option>
                        </Select>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                </Heading>
                <FlexRow>
                    <div>
                        <DatePickerInput
                            label="Fra og med"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label="Til og med"
                            placeholder="DD.MM.ÅÅÅÅ"
                            defaultSelected={undefined}
                            onChange={(selectedDay) => console.log(selectedDay)}
                        />
                    </div>
                    <div>
                        <Select label="Barn" className="w-52" size="small">
                            <option value="barn_1">Barn 1</option>
                            <option value="barn_2">Barn 2</option>
                        </Select>
                    </div>
                    <div>
                        <Select label="Barnetillegg (brutto)" className="w-52" size="small">
                            <option value="barnetillegg_1">Barnetillegg 1</option>
                            <option value="barnetillegg_2">Barnetillegg 2</option>
                        </Select>
                    </div>
                    <div>
                        <TextField label="Skattesats" size="small" />
                    </div>
                    <div>
                        <TextField label="Barnetillegg (netto)" size="small" />
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kommentar
                </Heading>
                <div>
                    <Textarea label="Begrunnelse (med i vedtaket og notat)" size="small" />
                </div>
                <div>
                    <TextField label="Begrunnelse (kun med i notat)" size="small" />
                </div>
                <div>
                    <CheckboxGroup
                        legend="Skal til to-trinns kontroll."
                        hideLegend
                        onChange={(val: any[]) => console.log(val)}
                        size="small"
                    >
                        <Checkbox value="true">Skal til to-trinns kontroll.</Checkbox>
                    </CheckboxGroup>
                </div>
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
