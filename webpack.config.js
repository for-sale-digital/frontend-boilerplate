const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const mode = process.env.NODE_ENV || 'production';

module.exports = {
    mode,
    entry: ['./src/js/app.js', './src/scss/app.scss'],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader', 'postcss-loader'],
                }),
            },
        ],
    },

    plugins: [new ExtractTextPlugin({ filename: 'bundle.css' })],
};
