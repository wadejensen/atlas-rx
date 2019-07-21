path = require("path");

module.exports = [
    {
        entry: './web/src/main/ts/app.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.web.json"
                        }
                    }],
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
            path: path.resolve(__dirname, 'static'),
            filename: 'app.js'
        },
        stats: 'minimal',
    },
];
