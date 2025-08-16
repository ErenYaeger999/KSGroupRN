module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: './src',
                extensions: [
                    '.ios.ts',
                    '.android.ts',
                    '.ts',
                    '.ios.tsx',
                    '.android.tsx',
                    '.tsx',
                    '.jsx',
                    '.js',
                    '.json',
                ],
                alias: {
                    '^react-native-svg/lib/module/(.+)':
                        '@kds/react-native-svg/src/\\1',
                    'react-native-svg': '@kds/react-native-svg',
                    '^@/(.+)': './src/\\1',
                },
            },
        ],
        '@kds/babel-plugin-kid-import',
        [
            'transform-imports',
            {
                lodash: {
                    transform: 'lodash/${member}',
                    preventFullImport: true, // 禁止全部导入 lodash
                },
            },
        ],
    ],
    env: {
        production: {
            plugins: ['transform-remove-console'],
        },
    },
};
