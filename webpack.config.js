const CircularDependencyPlugin = require('circular-dependency-plugin');
const {
    InlineRequireWebpackPlugin,
} = require('@krn/inline-require-webpack-plugin');
module.exports = {
    // ...
    plugins: [
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true, // 出现循环依赖时打包失败
            cwd: __dirname,
        }),
        new InlineRequireWebpackPlugin(), // 开启 metro 中的 inlineRequire
    ],
    optimization: {
        concatenateModules: false, // 禁止合并模块，配合 inlineRequire 使用
    },
    resolve: {
        exportsFields: [],
    },
};
