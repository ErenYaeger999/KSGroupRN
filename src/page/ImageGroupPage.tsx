import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Dimensions,
    Alert,
    Animated,
} from 'react-native';
import GroupHeader from '../components/GroupHeader';
import NavBar from '../components/NavBar';
import FloatingActionButton from '../components/FloatingActionButton';
import FeedItem, { FeedItemModel } from '../components/FeedItem';
import { useSharedStore } from '../store/store';
import { useFetchGroupFeeds } from '../network/GroupService';

const TABS = ['综合', '热门', '最新'];

const TabBar: React.FC<{ index: number; onChange: (idx: number) => void }> = ({
    index,
    onChange,
}) => {
    return (
        <View style={styles.tabBar}>
            {TABS.map((title, idx) => {
                const active = index === idx;
                return (
                    <Text
                        key={title}
                        style={[
                            styles.tabItem,
                            active ? styles.tabItemActive : null,
                        ]}
                        onPress={() => onChange(idx)}
                    >
                        {title}
                    </Text>
                );
            })}
        </View>
    );
};

const ImageGroupPage: React.FC<any> = ({ route, ...nativeProps }) => {
    const { setCurrentTabIndex, setGroupId, setRootTag } = useSharedStore();
    const [tabIndex, setTabIndex] = useState(0);
    const width = Dimensions.get('window').width;
    const scrollRef = useRef<ScrollView>(null);
    // 记录哪些页已经访问过（避免未访问的页提前请求）
    const visitedRef = React.useRef<[boolean, boolean, boolean]>([true, false, false]);

    const passedGroupId =
        route?.params?.groupId ??
        nativeProps?.groupId ??
        nativeProps?.props?.groupId;
    const groupId: number = passedGroupId ? Number(passedGroupId) : 1;
    
    // 获取rootTag并设置到全局状态
    const passedRootTag = 
        route?.params?.rootTag ??
        nativeProps?.rootTag ??
        nativeProps?.props?.rootTag;
    
    React.useEffect(() => {
        setGroupId(groupId);
    }, [groupId, setGroupId]);
    
    React.useEffect(() => {
        if (passedRootTag) {
            setRootTag(Number(passedRootTag));
        }
    }, [passedRootTag, setRootTag]);

    // 顶层创建三个查询对象（遵守 Hook 规则）；仅当前页或已访问过的页才启用请求
    const q0 = useFetchGroupFeeds(groupId, 0, { enabled: tabIndex === 0 || visitedRef.current[0] });
    const q1 = useFetchGroupFeeds(groupId, 1, { enabled: tabIndex === 1 || visitedRef.current[1] });
    const q2 = useFetchGroupFeeds(groupId, 2, { enabled: tabIndex === 2 || visitedRef.current[2] });

    // 扁平化分页数据，得到每页的一维列表
    const list0 = React.useMemo(() => q0.data?.pages?.flatMap((p: any) => p?.feeds ?? []) ?? [], [q0.data?.pages]);
    const list1 = React.useMemo(() => q1.data?.pages?.flatMap((p: any) => p?.feeds ?? []) ?? [], [q1.data?.pages]);
    const list2 = React.useMemo(() => q2.data?.pages?.flatMap((p: any) => p?.feeds ?? []) ?? [], [q2.data?.pages]);

    // 将服务端字段适配为 FeedItem 所需模型
    // 参考 FeedImageGroup 的数据结构：
    // - 头像：photo.headurls[0].url
    // - 用户名：photo.user_name
    // - 标题/描述：photo.captionTitle / photo.caption
    // - 图片：single => ext_params.single.{list, cdnList}；atlas => ext_params.atlas.{list, cdnList}
    // useCallback 缓存函数
    const toFeedItemModel = React.useCallback((photo: any) => {
        const getUrl = (cdn?: string, path?: string) => {
            if (!path) return '';
            if (!cdn) return path;
            if (!cdn.startsWith('http')) return `http://${cdn}${path}`;
            return `${cdn}${path}`;
        };
        const single = photo?.ext_params?.single;
        const atlas = photo?.ext_params?.atlas;
        const cdnSingle = single?.cdnList?.[0]?.cdn;
        const cdnAtlas = atlas?.cdnList?.[0]?.cdn;
        let images: string[] = [];
        if (single?.list?.length) {
            images = [getUrl(cdnSingle, single.list[0])];
        } else if (atlas?.list?.length) {
            images = atlas.list.slice(0, 3).map((p: string) => getUrl(cdnAtlas, p));
        }

        

        return {
            photo: {
                photo_id: String(photo?.photo_id ?? ''),
                user_id: String(photo?.user_id ?? ''),
                user_name: photo?.user_name ?? '',
                avatar_url: photo?.headurls?.[0]?.url ?? '',
                caption_title: photo?.captionTitle ?? '',
                caption: photo?.caption ?? '',
                timestamp: photo?.timestamp ?? Date.now(),
                images,
                liked: !!photo?.liked,
                like_count: photo?.like_count ?? 0,
                collected: !!photo?.collected,
                collect_count: photo?.collect_count ?? 0,
                comment_count: photo?.comment_count ?? 0,
            },
        };
    }, []); // 依赖空数组，不会变化

    const onChangeTab = (idx: number) => {
        if (idx === tabIndex) return; // 避免重复点击
        
        // 先执行滚动，再更新状态
        scrollRef.current?.scrollTo({ x: idx * width, y: 0, animated: true });
    
        // 延迟更新状态，让滚动动画先开始
        setTimeout(() => {
            setTabIndex(idx);
            setCurrentTabIndex(idx);
            visitedRef.current[idx] = true;
        }, 50);
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(x / width);
        if (nextIndex !== tabIndex) {
            setTabIndex(nextIndex);
            setCurrentTabIndex(nextIndex);
            visitedRef.current[nextIndex] = true;
        }
    };


    // 头部与 TabBar 常驻在列表外层，避免切页时被卸载重建
    // 读取并设置头部高度，用于非当前页渲染占位避免抖动
    const headerHeight = useSharedStore((s) => s.headerHeight);
    const onHeaderLayout = useSharedStore((s) => s.onHeaderLayout);

    const onHeaderMeasured = React.useCallback((e) => {
        const h = e.nativeEvent.layout.height;
        if (h && h !== headerHeight) {
            onHeaderLayout(h);
        }
    }, [headerHeight, onHeaderLayout]);

    const scrollY = React.useRef(new Animated.Value(0)).current;
    const titleOpacity = scrollY.interpolate({
        inputRange: [80, 160],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    
    const backgroundOpacity = scrollY.interpolate({
        inputRange: [80, 160],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const onListScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
    );


    
    return (
        <View style={styles.container}>
            <NavBar titleOpacity={titleOpacity} backgroundOpacity={backgroundOpacity} />
            {/* 绝对定位的 Header：随当前列表滚动进行位移，视觉上“被推走” */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    zIndex: 5,
                    transform: [{
                        translateY: scrollY.interpolate({
                            inputRange: [0, Math.max(1, headerHeight)],
                            outputRange: [0, -Math.max(1, headerHeight)],
                            extrapolate: 'clamp',
                        }),
                    }],
                }}
                pointerEvents="box-none"
            >
                <View onLayout={onHeaderMeasured}>
                    <GroupHeader groupId={groupId} />
                    <TabBar index={tabIndex} onChange={onChangeTab} />
                </View>
            </Animated.View>

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                {[0,1,2].map((idx) => {
                    const data = idx === 0 ? list0 : idx === 1 ? list1 : list2;
                    const query = idx === 0 ? q0 : idx === 1 ? q1 : q2;
                    const onEndReached = () => {
                        if (query.hasNextPage && !query.isFetchingNextPage) {
                            // 触底加载更多
                            query.fetchNextPage();
                        }
                    };
                    return (
                        <Animated.FlatList
                            key={`list_${idx}`}
                            data={data}
                            style={{ width }}
                            // 列表顶部为 Header 预留占位，让绝对定位的 Header 看起来被“推走”
                            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 120 }}
                            keyExtractor={(item: any, i: number) => String(item?.photo_id ?? i)}
                            renderItem={({ item }) => <FeedItem model={toFeedItemModel(item)} />}
                            onEndReachedThreshold={0.2}
                            onEndReached={onEndReached}
                            onScroll={idx === tabIndex ? onListScroll : undefined}
                            scrollEventThrottle={16}
                        />
                    );
                })}
            </ScrollView>
            <FloatingActionButton onPress={() => Alert.alert('发布', '跳转到发布页（占位）')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabBar: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: '#fff',
        paddingHorizontal: 8,
    },
    tabItem: {
        width: 64,
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        paddingVertical: 12,
    },
    tabItemActive: {
        color: '#222',
        fontWeight: '500',
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
    },
});

export default ImageGroupPage;