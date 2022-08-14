
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")
const Dotenv = require('dotenv-webpack');

module.exports = (env) => ({
  devtool: env.development ? "eval-map" : "none",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./bundle.js"
  },
  module: {
    rules: [
        {
          test: /\.css$/i,
          use: ['css-loader']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg|otf|ttf|fnt|woff2)$/i,
          use: "file-loader"
        }
      ],
  },
  devServer: {
    publicPath:"/",
    contentBase: path.resolve(__dirname, "./"),
    historyApiFallback: true,
    disableHostCheck: true
  },
  node: {
    fs: "empty"
 },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html"
    }),
    new CopyWebpackPlugin([
      { from: './src/assets', to: 'assets' }
    ]),
    new Dotenv()
  ]
})

