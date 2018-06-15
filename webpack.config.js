let path = require("path");
let webpack = require('webpack');
let BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  context: __dirname,

  // entry: ['./static/js/index.js'], // entry point of our app. index.js should require other js modules and dependencies it needs
  entry: {
      hr: './static/index/hr_index.js',
      my_docs: './static/index/my_docs_index.js',
      // sub_docs: './static/index/sub_docs_index.js',
  },
  output: {
      path: path.resolve(__dirname, './static/bundles/'),
      // filename: "[name]-[hash].js",
      filename: "[name]-[hash].js",
  },

  plugins: [
    new BundleTracker({filename: './webpack-stats.json'}),
  ],

  module: {
    rules: [
      {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
      }, // to transform JSX into JS
      {
            test: /\.css$/,
            include: /node_modules/,
            loaders: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    // modulesDirectories: ['node_modules'],
    extensions: ['.js', '.jsx']
  },
};