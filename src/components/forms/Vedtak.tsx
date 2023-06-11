import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { useApi } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Link, Loader, Table } from "@navikt/ds-react";
import React, { Suspense, useEffect } from "react";
import { useParams } from "react-router-dom";

import { RolleType } from "../../api/BidragBehandlingApi";
import { Grunnlag } from "../../api/BidragBeregnForskuddApi";
import { Api as BidragVedtakApi } from "../../api/BidragVedtakApi";
import { BIDRAG_BEREGN_FORSKUDD } from "../../constants/api";
import { useForskudd } from "../../context/ForskuddContext";
import environment from "../../environment";
import { useGetBehandling, useGetVirkningstidspunkt, useHentBoforhold, useHentInntekter } from "../../hooks/useApiData";
import { FlexRow } from "../layout/grid/FlexRow";
import { PersonNavn } from "../PersonNavn";
import { RolleTag } from "../RolleTag";

const convertDate = (nbDateString: string): string => nbDateString.split(".").reverse().join("-");

const Vedtak = () => {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    const { behandlingId } = useForskudd();
    const { data: behandling } = useGetBehandling(behandlingId);
    const { data: boforhold } = useHentBoforhold(behandlingId);
    const { data: inntekter } = useHentInntekter(behandlingId);
    const { data: virkningsTidspunkt } = useGetVirkningstidspunkt(behandlingId);

    const vedtakApi = useApi(new BidragVedtakApi({ baseURL: environment.url.bidragSak }), "bidrag-vedtak", "fss");

    const barn = behandling.roller.filter((r) => r.rolleType == RolleType.BARN);

    const sendeVedtak = (): void => {
        //TODO
        vedtakApi.vedtak
            .opprettVedtak({
                kilde: "MANUELT",
                type: "INDEKSREGULERING",
                opprettetAv: "",
                vedtakTidspunkt: "",
                enhetId: "",
                grunnlagListe: [],
            })
            .then((r) => {})
            .catch((e) => {});
        throw new Error("Function not implemented.");
    };

    const getNotatUrl = () => {
        const notatUrl = `/behandling/${behandlingId}/notat`;
        return saksnummer ? `/sak/${saksnummer}${notatUrl}` : notatUrl;
    };

    const søknadsBarnInfo = barn.map((b): Grunnlag => {
        return {
            referanse: b.ident, //TODO: er det egentlig ident?
            type: "SOKNADSBARN_INFO",
            innhold: {
                //"soknadsbarnId": 1,//TODO
                fodselsdato: "2023-01-01", //TODO bruk fdato!
            },
        };
    });

    const bostatus = [
        {
            referanse: "", //TODO
            type: "BOSTATUS",
            innhold: {
                datoFom: "2020-12-01",
                datoTil: "2021-01-01",
                rolle: "SOKNADSBARN",
                bostatusKode: "BOR_MED_FORELDRE",
                // "fodselsdato": "2023-06-01",
            },
        },
    ];

    const sivilstand = boforhold.data.sivilstand.map((s) => {
        return {
            referanse: "1", //TODO
            type: "SIVILSTAND",
            innhold: {
                datoFom: convertDate(s.gyldigFraOgMed),
                //   "datoTil": "2021-01-01",
                datoTil: convertDate(s.bekreftelsesdato), //TODO: må bruke en annen dato
                rolle: "BIDRAGSMOTTAKER",
                sivilstandKode: s.sivilstandType,
            },
        };
    });

    const inntekterForBeregning = [
        ...inntekter.inntekter.map((inn) => {
            return {
                referanse: "", //TODO
                type: "INNTEKT",
                innhold: {
                    datoFom: convertDate(inn.datoFom),
                    datoTil: convertDate(inn.datoTom),
                    rolle: "BIDRAGSMOTTAKER",
                    inntektType: "INNTEKTSOPPLYSNINGER_ARBEIDSGIVER", //TODO
                    belop: inn.beløp,
                },
            };
        }),
        ...inntekter.barnetillegg.map((inn) => {
            return {
                referanse: "", //TODO
                type: "INNTEKT",
                innhold: {
                    datoFom: inn.datoFom,
                    datoTil: inn.datoTom,
                    rolle: "BIDRAGSMOTTAKER",
                    inntektType: "EKSTRA_SMAABARNSTILLEGG",
                    /*
                TODO: hv av disse må vi bruke
                EKSTRA_SMAABARNSTILLEGG
                SKATTEGRUNNLAG_KORRIGERT_BARNETILLEGG
                AINNTEKT_KORRIGERT_BARNETILLEGG
                LONN_SKE_KORRIGERT_BARNETILLEGG
                PENSJON_KORRIGERT_BARNETILLEGG

                */
                    belop: inn.barnetillegg,
                },
            };
        }),
        ...inntekter.utvidetbarnetrygd.map((inn) => {
            return {
                referanse: "", //TODO
                type: "INNTEKT",
                innhold: {
                    datoFom: inn.datoFom,
                    datoTil: inn.datoTom,
                    rolle: "BIDRAGSMOTTAKER",
                    inntektType: "UTVIDET_BARNETRYGD",
                    belop: inn.beløp,
                },
            };
        }),
    ];

    useEffect(() => {
        const grunnlagListe: Grunnlag[] = []; //Grunnlag
        grunnlagListe.push(...søknadsBarnInfo);
        grunnlagListe.push(...bostatus);
        grunnlagListe.push(...inntekterForBeregning);
        grunnlagListe.push(...sivilstand);

        BIDRAG_BEREGN_FORSKUDD.beregn
            .beregnForskudd({
                // beregnDatoFra: "2023-06-10",
                beregnDatoFra: convertDate(virkningsTidspunkt.virkningsDato),
                beregnDatoTil: "2023-06-10", //TODO?
                grunnlagListe: grunnlagListe,
                // grunnlagListe: [],
            })
            .then(({ data: r }) => {
                // beregnetForskuddPeriodeListe?: ResultatPeriode[];
                // grunnlagListe?: ResultatGrunnlag[];
                console.log(r);
            });
    }, []);

    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Vedtak
                </Heading>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Oppsummering
                </Heading>
                {barn.map((item, i) => (
                    <div key={i + item.ident} className="mb-8">
                        <div className="my-8 flex items-center gap-x-2">
                            <RolleTag rolleType={item.rolleType} />
                            <BodyShort>
                                <PersonNavn ident={item.ident}></PersonNavn>
                                <span className="ml-4">{item.ident}</span>
                            </BodyShort>
                        </div>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Type søknad</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Inntekt</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Sivilstand til BM</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>Forskudd</Table.DataCell>
                                    <Table.DataCell>01.07.2022 - 31.08.2022</Table.DataCell>
                                    <Table.DataCell>651 555</Table.DataCell>
                                    <Table.DataCell>Ugift</Table.DataCell>
                                    <Table.DataCell>Opph pga høy inntekt</Table.DataCell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                ))}
            </div>
            <Alert variant="info">
                <div className="grid gap-y-4">
                    <Heading level="3" size="medium">
                        Sjekk notat
                    </Heading>
                    <div>
                        Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorik. Notatet blir generert automatisk
                        basert på opplysningene oppgitt.
                        <Link href={getNotatUrl()} target="_blank" className="font-bold ml-2">
                            Sjekk notat <ExternalLinkIcon aria-hidden />
                        </Link>
                    </div>
                </div>
            </Alert>
            <FlexRow>
                <Button loading={false} onClick={sendeVedtak} className="w-max" size="small">
                    Fatte vedtak
                </Button>
                <Button
                    type="button"
                    loading={false}
                    variant="secondary"
                    onClick={() => {
                        // TODO: legge til en sjekk/bekreftelse for å gå tilbake til bisys
                        // og kanskje stateId?
                        window.location.href = `${environment.url.bisys}Oppgaveliste.do`;
                    }}
                    className="w-max"
                    size="small"
                >
                    Avbryt
                </Button>
            </FlexRow>
        </div>
    );
};

export default () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <Vedtak />
        </Suspense>
    );
};
