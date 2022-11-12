const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/react'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }]
        },
        {
          test: /\.pegjs$/i,
          exclude: /node_modules/,
          loader: 'pegjs-loader'
        },
        {
          test: /\.(dms|ch8|rom)$/i,
          exclude: /node_modules/,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          }
        },
        {
          test: /\.(css)$/i,
          exclude: /node_modules/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          }
        },
      ],
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    plugins: []
};

