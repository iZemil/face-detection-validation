const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/index.jsx'],

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },

    devtool: 'inline-source-map',
    devServer: {
        historyApiFallback: true,
        contentBase: path.join(__dirname, 'public')
    },

    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
                include: path.join(__dirname, 'src')
            },

            {
                test: /\.(s?css)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
            },

            {
                test: /\.(jpg|png|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            },

            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(['public'], {
            root: path.resolve(__dirname, ''),
            verbose: true
        }),
        new CopyWebpackPlugin([{ from: 'src/models', to: 'models' }]),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('styles.css'),
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ]
};
