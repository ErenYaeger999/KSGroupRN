import React from 'react';
import { AppRegistry } from 'react-native';
import ImageGroupPage from './page/ImageGroupPage';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 0,
            retry: 0,
        },
        mutations: {
            retry: 0,
        },
    },
});

AppRegistry.registerComponent('GroupPage', () => (props) => (
	<QueryClientProvider client={queryClient}>
		<ImageGroupPage {...props} />
	</QueryClientProvider>
));

// 将 demo 也指向 GroupPage，启动即进入小组页
AppRegistry.registerComponent('demo', () => (props) => (
	<QueryClientProvider client={queryClient}>
		<ImageGroupPage {...props} />
	</QueryClientProvider>
));

export default ImageGroupPage;
