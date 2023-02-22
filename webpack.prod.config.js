const { merge } = require("webpack-merge");
const webpackCommon = require("./webpack.common.config.js");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(webpackCommon, {
    mode: "production",
    plugins: [
        // Defined as variable: default-value
        new EnvironmentPlugin({
            STATIC_FILES_URL: "",
            BIDRAG_PERSON_URL: "",
            BIDRAG_SAK_URL: "",
            BIDRAG_VEDTAK_URL: "",
            BIDRAG_GRUNNLAG_URL: "",
            BISYS_URL: "",
        }),
    ],
});
