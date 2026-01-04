const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/history-explorer-card.js',
  output: {
    filename: 'history-explorer-card.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
  // Ignore moment.js locale dynamic require warning
  ignoreWarnings: [
    {
      module: /moment\.js/,
      message: /Can't resolve '\.\/locale'/,
    },
  ],
  performance: {
    hints: false, // Disable asset size warnings
  },
};