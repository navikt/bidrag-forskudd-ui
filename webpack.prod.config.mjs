import webpack from "webpack";
import { merge } from "webpack-merge";

import webpackCommon from "./webpack.common.config.mjs";
const { EnvironmentPlugin } = webpack;
import HtmlWebpackPlugin from "html-webpack-plugin";

export default merge(webpackCommon, {
    mode: "production",
    plugins: [
        new HtmlWebpackPlugin({
            publicPath: "/",
            template: "./src/index.html",
        }),
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
            TELEMETRY_URL: "",
            UNLEASH_FRONTEND_TOKEN: "",
            UNLEASH_API_URL: "",
            MODIA_URL: "",
            ENVIRONMENT: "",
        }),
    ],
});
