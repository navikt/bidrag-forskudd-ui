import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";

const randomSalary = () => {
    const min = 2e5;
    const max = 1.5e6;

    return Math.round(min + Math.random() * (max - min));
};

export const createSkattegrunnlag = () =>
    [
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2022",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "loenn_og_trekk",
                },
            ],
            skatteoppgjoersdato: "2021",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2020",
        },
    ] as HentSkattegrunnlagResponse[];

export const createHustandsmedlemmer = () => {
    const behandlingId = JSON.parse(localStorage.getItem(`behandlingId`));
    const behandling = JSON.parse(localStorage.getItem(`behandling-${behandlingId}`));
    return {
        husstandListe: [
            {
                gyldigFraOgMed: "2022-05-03",
                gyldigTilOgMed: "2022-12-31",
                adressenavn: "Frystikkalleen",
                husnummer: "1",
                husbokstav: "A",
                bruksenhetsnummer: "1234",
                postnummer: "0560",
                bydelsnummer: "1234",
                kommunenummer: "1234",
                matrikkelId: 0,
                husstandsmedlemListe: behandling.roller.map((rolle, index) => ({
                    gyldigFraOgMed: "2022-05-03",
                    gyldigTilOgMed: index % 2 === 1 ? "2022-10-31" : "2022-12-31",
                    personId: rolle.ident,
                    foedselsdato: "2020-05-03",
                })),
            },
            {
                gyldigFraOgMed: "2023-01-01",
                adressenavn: "Frystikkalleen",
                husnummer: "2",
                husbokstav: "B",
                bruksenhetsnummer: "1234",
                postnummer: "0560",
                bydelsnummer: "1234",
                kommunenummer: "1234",
                matrikkelId: 0,
                husstandsmedlemListe: behandling.roller.map((rolle, index) => ({
                    gyldigFraOgMed: index % 2 === 1 ? "2023-03-01" : "2023-01-01",
                    gyldigTilOgMed: index % 2 === 1 ? "2023-05-31" : null,
                    personId: rolle.ident,
                    foedselsdato: "2020-05-03",
                })),
            },
        ],
    };
};
