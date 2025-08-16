import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Dimensions,
    Alert,
} from 'react-native';
import GroupHeader from '../components/GroupHeader';
import FloatingActionButton from '../components/FloatingActionButton';
import FeedItem, { FeedItemModel } from '../components/FeedItem';
import { useSharedStore } from '../store/store';

const TABS = ['综合', '热门', '最新'];

function generateMockList(seed: number): FeedItemModel[] {
    const list: FeedItemModel[] = [];
    for (let i = 0; i < 20; i++) {
        const imgCount = (i + seed) % 5 === 0 ? 1 : (i + seed) % 3 === 0 ? 2 : 3;
        const images = new Array(Math.max(1, Math.min(6, imgCount + ((i + seed) % 4))))
            .fill(0)
            .map((_, idx) => `placeholder:${seed}_${i}_${idx}`);
        list.push({
            photo: {
                photo_id: `${seed}_${i}`,
                user_id: `user_${i}`,
                user_name: `发布者_${i}`,
                avatar_url: 'placeholder:avatar',
                caption_title: i % 4 === 0 ? `标题 ${i}` : undefined,
                caption:
                    i % 2 === 0
                        ? '这是一段用于展示的描述文本，最多三行，超出显示“全文”。'
                        : '',
                timestamp: Date.now() - i * 3600 * 1000,
                images,
                liked: i % 3 === 0,
                like_count: (i + 1) * 2,
                collected: i % 4 === 0,
                collect_count: i,
                comment_count: (i * 3) % 17,
            },
        });
    }
    return list;
}

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
    const { setCurrentTabIndex, setGroupId } = useSharedStore();
    const [tabIndex, setTabIndex] = useState(0);
    const width = Dimensions.get('window').width;
    const scrollRef = useRef<ScrollView>(null);

    const passedGroupId =
        route?.params?.groupId ??
        nativeProps?.groupId ??
        nativeProps?.props?.groupId;
    const groupId: number = passedGroupId ? Number(passedGroupId) : 1;
    React.useEffect(() => {
        setGroupId(groupId);
    }, [groupId, setGroupId]);

    const lists = useMemo(
        () => [generateMockList(0), generateMockList(1), generateMockList(2)],
        [],
    );

    const onChangeTab = (idx: number) => {
        setTabIndex(idx);
        setCurrentTabIndex(idx);
        scrollRef.current?.scrollTo({ x: idx * width, y: 0, animated: true });
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(x / width);
        if (nextIndex !== tabIndex) {
            setTabIndex(nextIndex);
            setCurrentTabIndex(nextIndex);
        }
    };

    const ListHeader = (
        <View>
            <GroupHeader groupId={groupId} />
            <TabBar index={tabIndex} onChange={onChangeTab} />
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                {lists.map((data, idx) => (
                    <FlatList
                        key={`list_${idx}`}
                        data={data}
                        style={{ width }}
                        ListHeaderComponent={ListHeader}
                        contentContainerStyle={{ paddingBottom: 120 }}
                        keyExtractor={(item) => item.photo.photo_id}
                        renderItem={({ item }) => <FeedItem model={item} />}
                        onEndReachedThreshold={0.2}
                        onEndReached={() => {}}
                    />
                ))}
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
