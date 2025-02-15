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
    foyer: './static/index/foyer.js',
    permissions: './static/index/permissions.js',
    non_compliances: './static/index/non_compliances.js',
    reclamations: './static/index/reclamations.js',
    docs: './static/index/docs.js',
    edms: './static/index/edms.js',
    correspondence: './static/index/correspondence.js',
    counterparties: './static/index/counterparties.js',
    ordering: './static/index/ordering.js',
    accounts: './static/index/accounts.js',
    hr: './static/index/hr.js',
    production: './static/index/production.js',
    corr_templates: './static/index/corr_templates.js',
    vacations: './static/index/vacations.js',
    contract_reg_numbers: './static/index/contract_reg_numbers.js',
    contracts_reg_journal: './static/index/contracts_reg_journal.js',
    proposals: './static/index/proposals.js',
  },
  output: {
    path: path.resolve(__dirname, './static/bundles/'),
    filename: '[name]-[hash].js'
    // chunkFilename: '[name].bundle.js',
  },

  plugins: [
    new CleanWebpackPlugin({cleanAfterEveryBuildPatterns: pathsToClean}),
    new BundleTracker({filename: './webpack-stats.json'}),
    // new BundleAnalyzerPlugin()
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
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
        ],
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
    modules: [
      'node_modules',
      path.resolve(__dirname, 'static'),
      path.resolve(__dirname, 'templates'),
      path.resolve(__dirname, 'plxk'),
    ],
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
      hr: path.resolve(__dirname, 'hr'),
      production: path.resolve(__dirname, 'production'),
    }
  }
};
