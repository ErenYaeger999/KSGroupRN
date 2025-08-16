const path = require('path');
const fs = require('fs');
const originConfigPath = path.resolve('./babel.config.js');

let originConfig = fs.existsSync(originConfigPath)
    ? require(originConfigPath)
    : {};

// 只有是 webpack 打包时才修改
if (
    process.env.KRN_BUILD_TYPE === 'WEBPACK' &&
    fs.existsSync(originConfigPath)
) {
    // 开启 disableImportExportTransform
    if (originConfig.presets && originConfig.presets.length > 0) {
        originConfig.presets = originConfig.presets.map((preset) => {
            if (
                typeof preset === 'string' &&
                preset.includes('metro-react-native-babel-preset')
            ) {
                return [preset, { disableImportExportTransform: true }];
            }

            if (
                Array.isArray(preset) &&
                preset.length > 0 &&
                preset[0].includes('metro-react-native-babel-preset')
            ) {
                preset[1] = {
                    ...preset[1],
                    disableImportExportTransform: true,
                };
            }

            return preset;
        });
    }

    // 配置 module resolver 插件
    const alias = {
        '^react-native-svg/lib/module/(.+)': '@kds/react-native-svg/src/\\1',
        'react-native-svg': '@kds/react-native-svg',
        '^@ks/weblogger/lib/(.+)': '@ks/weblogger/es/\\1',
        'redux-logger': 'redux-logger/src',
        'react-native-swiper': 'react-native-swiper/src',
        '@kds/react-native-swiper': '@kds/react-native-swiper/src',
        'react-native-image-zoom-viewer': 'react-native-image-zoom-viewer/src',
        'react-native-image-pan-zoom': 'react-native-image-pan-zoom/src',
        '^@babel/runtime/helpers/esm/(.+)': ([_, name]) =>
            ['inheritsLoose', 'asyncToGenerator'].indexOf(name) !== -1
                ? `@babel/runtime/helpers/esm/${name}.js`
                : `@babel/runtime/helpers/${name}.js`,
        '^@babel/runtime/helpers/(.+)': '@babel/runtime/helpers/\\1.js',
        '@babel/runtime/regenerator': '@babel/runtime/regenerator/index.js',
        lodash: 'lodash-es',
        'lodash/**': 'lodash-es/**',
        'react-native-gesture-handler': '@kds/react-native-gesture-handler',
        '^react-native-gesture-handler/src/(.+)':
            '@kds/react-native-gesture-handler/\\1',
        '^react-native-gesture-handler/(.+)':
            '@kds/react-native-gesture-handler/\\1',
    };
    if (!originConfig.plugins) {
        originConfig.plugins = [];
    }

    if (originConfig.plugins.length > 0) {
        originConfig.plugins = originConfig.plugins.map((plugin) => {
            if (
                typeof plugin === 'string' &&
                plugin.includes('module-resolver')
            ) {
                return [
                    plugin,
                    {
                        root: ['./src'],
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
                        alias: alias,
                    },
                ];
            }

            if (
                Array.isArray(plugin) &&
                plugin.length > 0 &&
                plugin[0].includes('module-resolver')
            ) {
                plugin[1] = {
                    ...plugin[1],
                    alias: {
                        ...plugin[1].alias,
                        ...alias,
                    },
                };
            }

            return plugin;
        });

        if (originConfig.env && originConfig.env.production) {
            const prodPlugins = originConfig.env.production.plugins || [];

            // 从 env.production.plugins 中删除 @social/babel-plugin-import
            const prodSocialImportPluginIndex = prodPlugins.findIndex(
                (plugin) => {
                    return (
                        (typeof plugin === 'string' &&
                            plugin.includes('@social/babel-plugin-import')) ||
                        (Array.isArray(plugin) &&
                            plugin.length > 0 &&
                            plugin[0].includes('@social/babel-plugin-import'))
                    );
                },
            );
            if (prodSocialImportPluginIndex !== -1) {
                prodPlugins.splice(prodSocialImportPluginIndex, 1);
            }
        }

        // 从 plugins 中删除 @social/babel-plugin-import
        const socialImportPluginIndex = originConfig.plugins.findIndex(
            (plugin) => {
                return (
                    (typeof plugin === 'string' &&
                        plugin.includes('@social/babel-plugin-import')) ||
                    (Array.isArray(plugin) &&
                        plugin.length > 0 &&
                        plugin[0].includes('@social/babel-plugin-import'))
                );
            },
        );
        if (socialImportPluginIndex !== -1) {
            originConfig.plugins.splice(socialImportPluginIndex, 1);
        }
    }

    // 如果用户没有配置 module-resolver 插件，则手动添加
    if (
        !originConfig.plugins.find((plugin) => {
            return (
                (Array.isArray(plugin) && plugin[0] === 'module-resolver') ||
                (typeof plugin === 'string' &&
                    plugin.includes('module-resolver'))
            );
        })
    ) {
        originConfig.plugins.push([
            'module-resolver',
            {
                root: ['./src'],
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
                alias: alias,
            },
        ]);
    }

    // 配置哪些依赖不能 tree-shaking，走正常的打包
    if (!originConfig.overrides) {
        originConfig.overrides = [];
    }

    const blackPackages = [
        '@react-native-community/blur',
        'query-string',
        'object-assign',
        'react-native-scrollable-tab-view',
        'react-native-screens',
        'whatwg-url-without-unicode',
        'css-tree',
        'dom-serializer',
        '@react-native-community/viewpager',
        '@kds/react-native-gesture-handler/GestureComponents',
        'react-native-gesture-handler/GestureComponents',
        'recyclerlistview',
        '@react-native-community/cameraroll',
        '@kds/cameraroll',
        '@mzvonar/setin',
        'dayjs',
        'css-to-react-native',
        'react-native-fs',
        'react-native-blur',
        'ks-apple-map',
        '@kds/react-native-blur',
        '@kds/react-native-bindingx',
        'color-convert',
        '@canvas/image-data',
        'react-native-image-pan-zoom',
        'react-native-image-zoom-viewer',
        '@krn/react-native-swiper',
    ];
    originConfig.overrides.push({
        test: (filename) => {
            return blackPackages.some((packageName) =>
                filename.includes(`node_modules/${packageName}`),
            );
        },
        plugins: [
            [require('@babel/plugin-proposal-export-default-from')],
            [
                require('@babel/plugin-transform-modules-commonjs'),
                {
                    strict: false,
                    strictMode: false,
                    lazy: false,
                },
            ],
        ],
    });

    // 配置 typescript 枚举打包优化
    function isTypeScriptSource(fileName) {
        return Boolean(fileName) && fileName.endsWith('.ts');
    }

    function isTSXSource(fileName) {
        return Boolean(fileName) && fileName.endsWith('.tsx');
    }

    originConfig.overrides.push(
        {
            test: isTypeScriptSource,
            plugins: [
                [
                    require('@babel/plugin-transform-typescript'),
                    {
                        isTSX: false,
                        allowNamespaces: true,
                        optimizeConstEnums: true,
                    },
                ],
            ],
        },
        {
            test: isTSXSource,
            plugins: [
                [
                    require('@babel/plugin-transform-typescript'),
                    {
                        isTSX: true,
                        allowNamespaces: true,
                        optimizeConstEnums: true,
                    },
                ],
            ],
        },
    );
}

module.exports = originConfig;
