/**
 * Created by Sam on 2015/10/30.
 */
module.exports = {
    entry: './src/main.jsx',
    output: {
        filename: 'bundle.js', //this is the default name, so you can skip it
        //at this directory our bundle file will be available
        //make sure port 8090 is used when launching webpack-dev-server
        path: './js/',
        publicPath: './js/'
    },
    module: {
        loaders: [
            {
                //tell webpack to use jsx-loader for all *.jsx files
                test: /\.jsx$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React',
        'ipc': 'ipc'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};