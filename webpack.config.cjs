// webpack.config.js

const path = require('path');

module.exports = {
    entry: {
        background: './src/javascripts/background.js',
        options: './src/javascripts/options.js',
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist/'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
        ],
    },
};