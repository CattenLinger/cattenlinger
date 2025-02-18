const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ShebangPlugin = require('webpack-shebang-plugin');

const staticOptions = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader','shebang-loader'],
                exclude: /node_modules/,
            }
        ]
    },
    target: 'node',
    optimization: {
        minimizer: [new UglifyJsPlugin({
            uglifyOptions: { mangle: true, output: { comments: false } },
        })]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new ShebangPlugin()
    ]
}

module.exports = function (upper) {
    return {
        ...upper,
        ...staticOptions
    }
}