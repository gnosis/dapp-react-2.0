const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const pkg = require('./package.json')

const version = process.env.BUILD_VERSION || pkg.version

module.exports = (_, { mode }) => {
  // some code depends on it before process.env is inlined with DefinePlugin
  // like inline_render.js
  // and cache loader uses it as an identifier
  if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = mode
  const prodBuild = mode === 'production'

  const output = {
    filename: prodBuild ? '[name].[chunkhash].js' : '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }

  const plugins = [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      ETH_NETWORK: 'local',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        FE_CONDITIONAL_ENV: JSON.stringify(process.env.FE_CONDITIONAL_ENV || 'development'),
        USE_DEV_NETWORKS: JSON.stringify(process.env.USE_DEV_NETWORKS),
        NODE_ENV: JSON.stringify(process.env.USE_DEV_NETWORKS),
        VERSION: JSON.stringify(`${version}`),
      },
    }),
  ]

  if (prodBuild) {
    plugins.push(new MiniCssExtractPlugin({
      filename: 'dxfrontend-[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }))
  }
  return {
    devtool: mode === 'development' && 'module-source-map',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            prodBuild ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                minimize: prodBuild,
              },
            },
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: path.resolve(__dirname, './inline_render.js'),
          use: [
            'cache-loader',
            'html-loader',
            'val-loader',
          ],
        },
        // {
        //   test: /\/build\/contracts\/\w+\.json$/,
        //   use: ['json-loader', 'json-x-loader?exclude=unlinked_binary+networks.*.events+networks.*.links+bytecode+deployedBytecode+sourceMap+deployedSourceMap+source+sourcePath+ast+legacyAST']
        // },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    plugins,
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    output,
  }
}
