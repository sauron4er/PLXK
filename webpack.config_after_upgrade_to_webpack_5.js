let path = require('path');
let BundleTracker = require('webpack-bundle-tracker');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
let pathsToClean = ['./static/bundles/*.*'];
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  context: __dirname,
  entry: {
    boards: './static/index/boards.js',
    docs: './static/index/docs.js',
    edms: './static/index/edms.js',
    correspondence: './static/index/correspondence.js',
    ordering: './static/index/ordering.js',
    accounts: './static/index/accounts.js',
    hr: './static/index/hr.js'
  },
  output: {
    path: path.resolve(__dirname, './static/bundles/'),
    filename: '[name]-[fullhash].js'
    // chunkFilename: '[name].bundle.js',
  },

  plugins: [
    new CleanWebpackPlugin({cleanAfterEveryBuildPatterns: pathsToClean}),
    new BundleTracker({filename: './webpack-stats.json'})
    // new BundleAnalyzerPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{loader: 'babel-loader'}]
      }, // to transform JSX into JS
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      // {test: /\.css$/, exclude: /node_modules/, loader: 'style-loader!css-loader'},
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000
            }
          }
        ]
      },
      // {
      //   test: /\.(?:png|jpe?g|svg)$/,
      //   loader: 'url-loader'
      // }
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [{loader: 'file-loader'}]
      }
    ]
  },

  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'static'), path.resolve(__dirname, 'templates'), path.resolve(__dirname, 'plxk')],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      static: path.resolve(__dirname, 'static'),
      templates: path.resolve(__dirname, 'templates'),
      edms: path.resolve(__dirname, 'edms'),
      docs: path.resolve(__dirname, 'docs'),
      plxk: path.resolve(__dirname, 'plxk'),
      correspondence: path.resolve(__dirname, 'correspondence'),
      boards: path.resolve(__dirname, 'boards'),
      ordering: path.resolve(__dirname, 'ordering'),
      accounts: path.resolve(__dirname, 'accounts'),
      hr: path.resolve(__dirname, 'hr')
    }
  }
};
