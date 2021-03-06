const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const config = {
  entry: "./lib",
  output: {
    filename: "jcc-moac-utils.min.js",
    path: path.resolve(__dirname, "./dist"),
    library: "jcc_moac_utils",
    libraryTarget: "umd"
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts"],
    alias: {
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      "bignumber.js": path.resolve(__dirname, "node_modules/bignumber.js"),
      "base-x": path.resolve(__dirname, "node_modules/base-x"),
      "safe-buffer": path.resolve(__dirname, "node_modules/string_decoder/node_modules/safe-buffer"),
      utf8: path.resolve(__dirname, "node_modules/web3-utils/node_modules/utf8"),
      "js-sha3": path.resolve(__dirname, "node_modules/ethereum-bloom-filters/node_modules/js-sha3"),
      inherits: path.resolve(__dirname, "node_modules/inherits")
    }
  },
  mode: process.env.MODE === "dev" ? "development" : "production",
  node: {
    fs: "empty",
    tls: "empty",
    child_process: "empty",
    net: "empty"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [new DuplicatePackageCheckerPlugin()]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin());
}

if (process.env.MODE !== "dev") {
  config.plugins.push(
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          sequences: true,
          dead_code: true,
          drop_console: true,
          drop_debugger: true,
          unused: true
        }
      },
      sourceMap: false,
      parallel: true
    })
  );
}

module.exports = config;
