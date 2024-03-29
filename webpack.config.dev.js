const merge = require('webpack-merge')
const common = require('./webpack.config.js')

module.exports = merge.merge(common, {
  mode: 'development',
  devtool: 'inline-source-map'
});