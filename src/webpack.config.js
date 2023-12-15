// webpack.config.js

const path = require("path")

module.exports = {
    entry: {
        serviceWorker: './src/javascripts/background.js',
        options: './src/javascripts/options.js',
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"],
                },
            },
        ],
    },
}