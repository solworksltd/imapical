const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'source-map',
  devServer: {
    contentBase: [path.join(__dirname, 'dist'), path.join(__dirname, 'example')],
    watchContentBase: true,
  },
  entry: './src/index.js',
  externals: [
    'emailjs-imap-client',
    'ical-expander',
  ],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'imapical',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            compact: true,
          }
        }
      }
    ]
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ],
  target: 'node',
};
