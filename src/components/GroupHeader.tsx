import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useSharedStore } from '../store/store';
import { useFetchGroupInfo } from '../network/GroupService';

interface GroupHeaderProps {
    groupId?: number;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ groupId = 1 }) => {
    const { setNavigationTitle } = useSharedStore();
    const navigationTitle = useSharedStore((s) => s.navigationTitle);
    const [joined, setJoined] = useState(false);

    // 正确使用 Hook：不要把 Hook 放到 useMemo 里
    const groupInfo = useFetchGroupInfo(groupId);

    React.useEffect(() => {
        const newName = groupInfo?.data?.group?.name;
        if (!newName) return;
        if (navigationTitle !== newName) {
            setNavigationTitle(newName);
        }
    }, [groupInfo?.data?.group?.name, navigationTitle, setNavigationTitle]);

    const formatCount = (count: number) => {
        if (count >= 10000) {
            return `${(count / 10000).toFixed(1)}万`;
        }
        return `${count}`;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                    try {
                        // @ts-ignore
                        if (typeof globalThis?.onGroupPageBack === 'function') {
                            // @ts-ignore
                            globalThis.onGroupPageBack();
                            return;
                        }
                    } catch (e) {}
                    BackHandler.exitApp();
                }}
                activeOpacity={0.8}
            >
                <Text style={styles.backIcon}>{'‹'}</Text>
            </TouchableOpacity>
            <View style={styles.bg} >
                <Image source={{ uri: groupInfo.data?.group.bgImage }} style={styles.bg} />
            </View>
            <View style={styles.contentRow}>
                <View style={styles.avatar} >
                    <Image source={{ uri: groupInfo.data?.group.icon }} style={styles.avatar} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {groupInfo.data?.group.name}
                    </Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stats}>
                            {formatCount(groupInfo.data?.group.participantsCount)}人参与
                        </Text>
                        <Text style={styles.stats}>
                            {formatCount(groupInfo.data?.group.photoCount)}帖子
                        </Text>
                    </View>
                </View>
                {!joined ? (
                    <TouchableOpacity
                        style={styles.joinBtn}
                        onPress={() => setJoined(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.joinText}>加入</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.joinBtn, styles.joined]}>
                        <Text style={[styles.joinText, styles.joinedText]}>
                            已加入
                        </Text>
                    </View>
                )}
            </View>
            <Text style={styles.desc} numberOfLines={1}>
                {groupInfo.data?.group.desc}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 19,
        paddingTop: 76,
        paddingBottom: 12,
        backgroundColor: '#222',
    },
    backBtn: {
        position: 'absolute',
        left: 12,
        top: 36,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    backIcon: {
        color: '#fff',
        fontSize: 28,
        lineHeight: 30,
    },
    bg: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.35,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 68,
        height: 68,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
    },
    stats: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginRight: 8,
    },
    joinBtn: {
        width: 68,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    joined: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    joinText: {
        fontSize: 12,
        color: '#000',
        fontWeight: '500',
    },
    joinedText: {
        color: '#fff',
    },
    desc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        marginTop: 12,
    },
});

export default GroupHeader;
