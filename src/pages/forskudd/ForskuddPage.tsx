import { Heading, Stepper } from "@navikt/ds-react";
import { CopyToClipboard } from "@navikt/ds-react-internal";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import FormWrapper from "../../components/forms/FormWrapper";
import { RolleDetaljer } from "../../components/RolleDetaljer";
import { STEPS } from "../../constants/steps";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import PersonService from "../../service/PersonService";
import SakService from "../../service/SakService";
import { IBidragSak } from "../../types/bidrag-sak";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";

interface ForskuddPageProps {
    personId: string;
    saksnummer: string;
}

export interface CommonFormProps {
    setActiveStep: (number) => void;
}

export default function ForskuddPage({ personId, saksnummer }: ForskuddPageProps) {
    const [personNavn, setPersonNavn] = useState<string>();
    const [sak, setSak] = useState<IBidragSak>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeStep = searchParams.get("steg");
    const personService = new PersonService();
    const sakService = new SakService();

    useEffect(() => {
        const personPromise = personService.hentPerson(personId);
        const sakPromise = sakService.hentSak(saksnummer);

        Promise.all([personPromise, sakPromise])
            .then(([person, sak]) => {
                setPersonNavn(person.navn);
                setSak(sak);
            })
            .catch((error) => {
                console.error(error.message);
            });
    }, []);

    const setActiveStep = (x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    };

    return (
        <PageWrapper name="tracking-wide">
            <div className="bg-[var(--a-gray-50)]">
                <Heading
                    level="1"
                    size="xlarge"
                    className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
                >
                    Søknad om forskudd{" "}
                    <span className="text-base flex items-center font-normal">
                        Saksnr. {saksnummer}{" "}
                        <CopyToClipboard size="small" copyText={saksnummer} popoverText="Kopierte saksnummer" />
                    </span>
                </Heading>
                {sak && sak.roller.map((rolle, i) => <RolleDetaljer key={rolle.fodselsnummer + i} rolle={rolle} />)}
            </div>
            <div className="max-w-[1092px] mx-auto px-6 py-6">
                <Stepper
                    aria-labelledby="stepper-heading"
                    activeStep={STEPS[activeStep]}
                    onStepChange={(x) => setActiveStep(x)}
                    orientation="horizontal"
                    className="mb-8"
                >
                    <Stepper.Step>{capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.INNTEKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.BOFORHOLD)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                </Stepper>
                <FormWrapper setActiveStep={setActiveStep} activeStep={activeStep} />
            </div>
        </PageWrapper>
    );
}
