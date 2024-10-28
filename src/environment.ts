// @ts-nocheck
const system = {
    isTest: process.env.NODE_ENV === "TEST",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    environment: process.env.ENVIRONMENT,
};

const url = {
    bidragPerson: process.env.BIDRAG_PERSON_URL,
    bidragSak: process.env.BIDRAG_SAK_URL,
    bidragBehandling: process.env.BIDRAG_BEHANDLING_URL,
    bidragGrunnlag: process.env.BIDRAG_GRUNNLAG_URL,
    bidragVedtak: process.env.BIDRAG_VEDTAK_URL,
    bisys: process.env.BISYS_URL,
    bidragBeregnForskudd: process.env.BIDRAG_BEREGN_FORSKUDD_URL,
    bidragInntekt: process.env.BIDRAG_INNTEKT,
    bidragDokumentProduksjon: process.env.BIDRAG_DOKUMENT_PRODUKSJON,
    modia: process.env.MODIA_URL,
    forskuddBrukerveiledning: "/forskudd/brukerveiledning",
    særbidragBrukerveiledning: "/sarbidrag/brukerveiledning",
};

export default { url, system };
