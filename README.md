# React Native App

## 启动项目

```bash
yarn start
```

## 调试项目

```bash
yarn start --debug
```

## 打包

```bash
yarn build
```

## 配置文件说明

KDS-React 工程下的`krn.config.json`文件用来配置工程的描述信息。文件内容为一个 JSON 对象，有以下属性：

| 属性         |     类型      | 必填 | 描述                                                                                                                                                                                                                                                                                         |
| ------------ | :-----------: | ---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entry        | string 或 Map |   是 | 打包文件的入口路径，如果为 Map，则表示是一个多 bundle 工程，key 为 bundleId，value 为 bundle 的打包入口路径                                                                                                                                                                                  |
| scheme       |    string     |   否 | 指的是 APP 的 Scheme，比如`kwai://，当该参数缺失时，CLI 无法生成调试二维码                                                                                                                                                                                                                   |
| schemeParams | string 或 Map |   否 | 数据透传给 APP 的 Scheme Url 参数，例如`param1=A`，如果为 Map，则可以给指定 ComponentName 透传参数，key 为 ComponentName，value 为 url 参数，更详细的说明请查看 [scheme 说明](https://kds.corp.kuaishou.com/kds-react/document/tutorial/08-scheme.html#%E5%B9%B3%E5%8F%B0%E5%8F%82%E6%95%B0) |
| optimize     |     JSON      |   否 | 数据预请求的配置，构建时会优先读取工程根目录下的 optimize.config.\<platform\>.json，如果不存在平台特定配置文件，则会读取 optimize.config.json                                                                                                                                                |
| projectName  |    string     |   否 | 项目名                                                                                                                                                                                                                                                                                       |
| installCmd   |    string     |   否 | 包管理工具，例如`yarn`                                                                                                                                                                                                                                                                       |
| framework    |    string     |   否 | 框架，比如`React`                                                                                                                                                                                                                                                                            |
| language     |    string     |   否 | 编程语言，比如`TypeScript`                                                                                                                                                                                                                                                                   |
