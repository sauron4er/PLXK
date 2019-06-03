let path = require('path');
let BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');
let pathsToClean = ['./static/bundles/*.*'];

// const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  context: __dirname,

  // entry: ['./static/js/index.js'], // entry point of our app. index.js should require other js modules and dependencies it needs
  entry: {
    hr: './static/index/hr_index.js',
    administration: './static/index/administration_index.js',
    my_docs: './static/index/my_docs_index.js',
    archive: './static/index/archive_index.js',
    sub_docs: './static/index/sub_docs_index.js',
    plhk_ads: './static/index/plhk_ads_index.js'
  },
  output: {
    path: path.resolve(__dirname, './static/bundles/'),
    filename: '[name]-[hash].js',
    // chunkFilename: '[name].bundle.js',
  },

  plugins: [
    new CleanWebpackPlugin(pathsToClean, {watch: true, beforeEmit: true}),
    new BundleTracker({filename: './webpack-stats.json'})
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, // to transform JSX into JS
      {
        test: /\.css$/,
        include: /node_modules/,
        loaders: ['style-loader', 'css-loader']
      },
      {test: /\.css$/, exclude: /node_modules/, loader: 'style-loader!css-loader'},
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
        loader: 'url-loader?limit=100000'
      },
      // {
      //   test: /\.(?:png|jpe?g|svg)$/,
      //   loader: 'url-loader'
      // }
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx']
  }
};
