const { merge } = require("webpack-merge");
const webpackCommon = require("./webpack.common.config.js");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { EnvironmentPlugin } = require("webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const fs = require("fs");

module.exports = (env) => {
    const customenvfile = `env/${env.envfile}`;
    const envfile = fs.existsSync(customenvfile) ? customenvfile : "env/.env.local";
    console.log("Using envfile", envfile);
    return merge(webpackCommon, {
        mode: "development",
        devtool: "source-map",
        devServer: {
            historyApiFallback: true,
            devMiddleware: {
                writeToDisk: true,
            },
            client: {
                webSocketTransport: "ws",
            },
            webSocketServer: "ws",
            port: 5253,
            hot: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
            },
        },
        plugins: [
            new Dotenv({ path: envfile }),
            new ReactRefreshWebpackPlugin(),
            new HtmlWebpackPlugin({
                publicPath: "/",
                template: "./src/index.html",
            }),
            new EnvironmentPlugin({
                ENABLE_MOCK: "",
            }),
        ],
    });
};
