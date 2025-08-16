import React from 'react';
import { AppRegistry } from 'react-native';
import ImageGroupPage from './page/ImageGroupPage';

// 仅注册组件入口，供原生/调试直接拉起，无首页壳
AppRegistry.registerComponent('GroupPage', () => (props) => (
	<ImageGroupPage {...props} />
));

// 将 demo 也指向 GroupPage，启动即进入小组页
AppRegistry.registerComponent('demo', () => (props) => (
	<ImageGroupPage {...props} />
));

export default ImageGroupPage;
