import { EnvironmentPlugin } from "webpack";
import { merge } from "webpack-merge";

import webpackCommon from "./webpack.common.config.js";

export default merge(webpackCommon, {
    mode: "production",
    plugins: [
        // Defined as variable: default-value
        new EnvironmentPlugin({
            STATIC_FILES_URL: "",
            BIDRAG_PERSON_URL: "",
            BIDRAG_SAK_URL: "",
            BIDRAG_VEDTAK_URL: "",
            BIDRAG_BEHANDLING_URL: "",
            BIDRAG_GRUNNLAG_URL: "",
            BIDRAG_INNTEKT: "",
            BISYS_URL: "",
            BIDRAG_DOKUMENT_PRODUKSJON: "",
            UNLEASH_FRONTEND_TOKEN: "",
            UNLEASH_API_URL: "",
        }),
    ],
});
