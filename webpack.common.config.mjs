import { fileURLToPath } from "node:url";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import rehypeSlug from "rehype-slug";
import webpack from "webpack";

import deps from "./package.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ModuleFederationPlugin } = webpack.container;
export default {
    entry: "./src/index.tsx",
    output: {
        filename: "[name].[fullhash].js",
        path: path.resolve(__dirname, "./dist"),
    },
    experiments: {
        topLevelAwait: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
        alias: {
            "@api": path.resolve("./src/api"),
            "@assets": path.resolve("./src/assets"),
            "@common": path.resolve("./src/common"),
            "@commonTypes": path.resolve("./src/types"),
            "@utils": path.resolve("./src/utils"),
            parchment: path.resolve(__dirname, "./node_modules/parchment/dist/parchment.js"),
            // quill: path.resolve(__dirname, "./node_modules/quill/quill.js"),
            // "^quill$": path.resolve(__dirname, "./node_modules/quill/quill.js"),
            // "quill/dist/quill.snow.css": path.resolve(__dirname, "./node_modules/quill/dist/quill.snow.css"),
        },
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /\.lazy\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            },
            {
                test: /\.mdx?$/,
                use: [
                    {
                        loader: "@mdx-js/loader",
                        /** @type {import('@mdx-js/loader').Options} */
                        options: {
                            providerImportSource: "@mdx-js/react",
                            rehypePlugins: [rehypeSlug],
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif|mov)$/i,
                type: "asset/inline",
            },
            {
                test: /\.lazy\.css$/i,
                use: [{ loader: "style-loader", options: { injectType: "lazyStyleTag" } }, "css-loader"],
            },
            {
                test: /\.([jt]sx?)?$/,
                exclude: /node_modules(?!\/quill)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        ["@babel/preset-env", { targets: "defaults" }],
                        "@babel/preset-typescript",
                        ["@babel/preset-react", { runtime: "automatic" }],
                    ],
                },
            },
            {
                test: /\.svg$/,
                loader: "svg-inline-loader",
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser",
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[fullhash].css",
            ignoreOrder: true,
        }),
        new ModuleFederationPlugin({
            name: "bidrag_behandling_ui",
            filename: "remoteEntry.js",
            exposes: {
                "./Forskudd": "./src/app.tsx",
                "./Behandling": "./src/app.tsx",
            },
            shared: {
                react: { singleton: true, requiredVersion: deps.dependencies.react },
                "react-dom": { singleton: true, requiredVersion: deps.dependencies.react },
            },
        }),
    ],
};
