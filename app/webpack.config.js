path = require("path");

module.exports = [
    {
        entry: './server/src/main/ts/index.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        target: 'node',
        node: {
            __dirname: false,
            __filename: false,
        },
        resolve: {
            extensions: [ '.ts', '.tsx', '.js' ],
            alias: {
                common: path.resolve(__dirname, 'common/src/main/ts/'),
            }
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js'
        },
        stats: 'minimal',
    },
    {
        entry: './web/src/ts/app.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        target: 'web',
        resolve: {
            extensions: [ '.ts', '.tsx', '.js' ],
            alias: {
                common: path.resolve(__dirname, 'common/src/main/ts/'),
            }
        },
        output: {
            path: path.resolve(__dirname, 'dist/static'),
            filename: 'app.js'
        },
        stats: 'minimal',
    },
];
