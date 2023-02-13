// @ts-nocheck
const system = {
    isTest: process.env.NODE_ENV === "TEST",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
};

const url = {
    bidragPerson: process.env.BIDRAG_PERSON_URL,
    bidragSak: process.env.BIDRAG_SAK_URL,
    bidragGrunnlag: process.env.BIDRAG_GRUNNLAG_URL,
};

export default { url, system };
