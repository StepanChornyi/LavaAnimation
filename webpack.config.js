const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const DEV_SERVER_PORT = 3000;

module.exports = {
  devServer: {
    port: DEV_SERVER_PORT,
    host: '0.0.0.0',
    devMiddleware: {
      publicPath: '/'
    },
  },
  resolve: {
    alias: {
      assets: `${__dirname}/assets/`,
      shaders: `${__dirname}/shaders/`,
      js: `${__dirname}/js/`
    },
    mainFields: ['main']
  },
  entry: {
    code: './js/main.js',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: path.resolve(__dirname, 'assets'),
      exclude: /\.json$/,
      loader: 'file-loader',
      options: { name: '[name]-[hash:8].[ext]', },
    }, {
      test: path.resolve(__dirname, 'shaders'),
      loader: 'file-loader',
      options: { name: '[name]-[hash:8].[ext]', },
    },{
      test: /\.glsl$/i,
      exclude: /shaders/,
      use: 'raw-loader',
    }, {
      type: 'javascript/auto',
      test: /\.(json)/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'file-loader',
        options: { name: '[name]-[hash:8].[ext]' },
      }],
    }],
  },
  plugins: [
    new HTMLPlugin({
      template: './html/index.html.ejs',
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets/social", to: "" },
      ],
    })
  ]
};
