const path = require('path');

module.exports = {
  entry: './src/js/travel-map.js',
  output: {
    path: path.resolve(__dirname, 'static/js'),
    filename: 'travel-map.bundle.js',
    library: {
      name: 'TravelMap',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
};
