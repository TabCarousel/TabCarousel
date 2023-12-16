const { merge } = require('webpack-merge');
const common = require('./webpack.config.cjs');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map'
});