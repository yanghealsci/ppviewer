const path = require('path')
const webpack = require('webpack')
const base = require('./webpack.config.base.babel')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {
    LoaderOptionsPlugin,
    ProvidePlugin,
    HashedModuleIdsPlugin
} = webpack

let configPath = path.resolve(__dirname, '../configs/dist')

module.exports = env => {
  return merge(base, {
    mode: 'production',
    entry: {
      bundle: ['babel-polyfill', path.resolve(__dirname, '../src/index')]
    },
    output: {
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
      path: path.resolve(__dirname, '../dist'),
      publicPath: '/dist/'
    },
    performance: {
      hints: 'warning', // enum
      maxAssetSize: 200000, // int (in bytes),
      maxEntrypointSize: 400000, // int (in bytes)
      assetFilter: function (assetFilename) {
        // Function predicate that provides asset filenames
        return assetFilename.endsWith('.css') || assetFilename.endsWith('.js')
      }
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/,
          use: [
            {
              loader: 'style-loader'
            }, {
              loader: 'css-loader',
              options: {
                module: true,
                localIdentName: '[name]__[local]__[hash:base64:10]'
              }
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [
                  path.resolve(__dirname, '../src')
                ]
              }
            }
          ]
        }, {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '/dist/'
              }
            },
            {
              loader: 'css-loader'
            }, {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                javascriptEnabled: true
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style.[contenthash].css'
      }),
      new LoaderOptionsPlugin({
        minimize: true
      }),
      new HashedModuleIdsPlugin(),
      new HtmlWebpackPlugin({
        inject: true,
        filename: path.resolve(__dirname, '../index.html'),
        template: path.resolve(__dirname, '../indexTemplate.html')
      }),
      new ProvidePlugin({
        globalConfig: configPath
      })
    ]
  })
}
