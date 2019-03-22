const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
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
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        SHOW_APP_DATA: JSON.stringify(process.env.SHOW_APP_DATA),
        VERSION: JSON.stringify(`${version}`),
        FE_CONDITIONAL_ENV: JSON.stringify(process.env.FE_CONDITIONAL_ENV || process.env.NODE_ENV),
        SHORT_TEST: JSON.stringify(process.env.SHORT_TEST),
      },
    }),
  ]

  if (prodBuild) {
    plugins.push(new MiniCssExtractPlugin({
      filename: 'dx-mgn-pool-frontend-[name].[hash].css',
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
          test: /\.(ttf|otf|eot|woff2?)(\?[a-z0-9]+)?$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
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
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: { keep_fnames: /^BN$/ }, // Note `mangle.properties` is `false` by default.
          },
        }),
      ],
    },
    output,
  }
}
