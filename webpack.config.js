const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const MiniCssExctractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'dev/index.js'),
  output: {
    publicPath: '',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/')
  },
  plugins: [
    new MiniCssExctractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          autoprefixer()
        ]
      }
    })
  ],
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        MiniCssExctractPlugin.loader,
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ],
      exclude: /node_modules/
    }, {
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }
      ]
    }, {
      test: /\.(png|jpe?g|gif)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/'
          }
        },
      ],
    },]
  }
}