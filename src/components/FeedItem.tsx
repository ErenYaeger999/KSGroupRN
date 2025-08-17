import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import KwaiImage from '@kds/image';

interface PhotoModel {
    photo_id: string;
    user_id: string;
    user_name: string;
    avatar_url: string;
    caption_title?: string;
    caption?: string;
    timestamp: number;
    images: string[]; // 原图或缩略图 url
    liked?: boolean;
    like_count?: number;
    collected?: boolean;
    collect_count?: number;
    comment_count?: number;
}

export interface FeedItemModel {
    photo: PhotoModel;
}

const screenWidth = Dimensions.get('window').width;
const itemSpace = 4;
const defaultPadding = 19;
const itemWidth = (screenWidth - itemSpace * 2 - defaultPadding * 2 - 40) / 3;
const itemHeight = (itemWidth / 3) * 4;
const oneImageItemWidth = 160;
const oneImageItemHeight = (oneImageItemWidth / 3) * 4;

const FeedItem: React.FC<{ model: FeedItemModel }> = ({ model }) => {
    const { photo } = model;
    const [isLike, setIsLike] = useState(!!photo.liked);
    const [likeCount, setLikeCount] = useState(photo.like_count || 0);
    const [isCollected, setIsCollected] = useState(!!photo.collected);
    const [collectCount, setCollectCount] = useState(photo.collect_count || 0);

    const timeText = useMemo(() => {
        const date = new Date(photo.timestamp);
        return `${
            date.getMonth() + 1
        }-${date.getDate()} ${date.getHours()}:${String(
            date.getMinutes(),
        ).padStart(2, '0')}`;
    }, [photo.timestamp]);

    const imageCount = photo.images.length;

    const onLike = () => {
        const next = !isLike;
        setIsLike(next);
        setLikeCount((n) => Math.max(0, n + (next ? 1 : -1)));
    };

    const onCollect = () => {
        const next = !isCollected;
        setIsCollected(next);
        setCollectCount((n) => Math.max(0, n + (next ? 1 : -1)));
    };

    const renderImages = () => {
        if (imageCount <= 0) {
            return null;
        }
        if (imageCount === 1) {
            return (
                <View
                    style={[
                        styles.oneImageContainer,
                        photo.caption_title || photo.caption
                            ? { marginTop: 8 }
                            : null,
                    ]}
                >
                    <KwaiImage style={styles.oneImage} source={{ uri: photo.images[0] }} />
                </View>
            );
        }
        if (imageCount === 2) {
            return (
                <View
                    style={[
                        styles.twoImageContainer,
                        photo.caption_title || photo.caption
                            ? { marginTop: 8 }
                            : null,
                    ]}
                >
                    <KwaiImage style={styles.twoImageLeft} source={{ uri: photo.images[0] }} />
                    <KwaiImage style={styles.twoImageRight} source={{ uri: photo.images[1] }} />
                </View>
            );
        }
        return (
            <View
                style={[
                    styles.threeImageContainer,
                    photo.caption_title || photo.caption
                        ? { marginTop: 8 }
                        : null,
                ]}
            >
                <KwaiImage style={styles.threeImage} source={{ uri: photo.images[0] }} />
                <KwaiImage style={styles.threeImage} source={{ uri: photo.images[1] }} />
                <View>
                    <KwaiImage style={styles.threeImage} source={{ uri: photo.images[2] }} />
                    {imageCount > 3 ? (
                        <View style={styles.photoCountContainer}>
                            <View style={styles.photoCountBg}>
                                <Text
                                    style={styles.photoCount}
                                >{`共${imageCount}张`}</Text>
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <KwaiImage style={styles.avatar} source={{ uri: photo.avatar_url }} />
                <Text style={styles.userName} numberOfLines={1}>
                    {photo.user_name}
                </Text>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
                <View style={styles.descriptionContainer}>
                    {photo.caption_title ? (
                        <Text
                            style={[
                                styles.captionTitle,
                                { marginBottom: photo.caption ? 6 : 0 },
                            ]}
                            numberOfLines={1}
                        >
                            {photo.caption_title}
                        </Text>
                    ) : null}
                    {photo.caption ? (
                        <Text style={styles.description} numberOfLines={3}>
                            {photo.caption}
                            {photo.caption.length > 34 ? (
                                <Text style={styles.descriptionTail}>
                                    {' '}
                                    全文
                                </Text>
                            ) : null}
                        </Text>
                    ) : null}
                </View>
            </TouchableOpacity>
            {renderImages()}
            <View style={styles.bottomContainer}>
                <Text style={styles.time}>{`${timeText} 发布`}</Text>
                <View style={styles.interactionContainer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={onLike}>
                        <View style={styles.interaction}>
                            <Text style={styles.interactionText}>
                                {isLike ? '❤️' : '🤍'} {likeCount}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={onCollect}>
                        <View style={styles.interaction}>
                            <Text style={styles.interactionText}>
                                {isCollected ? '⭐️' : '☆'} {collectCount}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.interaction}>
                        <Text style={styles.interactionText}>
                            💬 {photo.comment_count || 0}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 19,
        marginBottom: 20,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    userName: {
        fontSize: 13,
        color: '#222222',
        marginLeft: 8,
    },
    descriptionContainer: {
        marginLeft: 40,
        marginTop: 5,
    },
    captionTitle: {
        fontSize: 15,
        color: '#222222',
    },
    description: {
        fontSize: 15,
        color: '#222222',
    },
    descriptionTail: {
        fontSize: 15,
        color: '#666666',
    },
    oneImageContainer: {
        marginLeft: 40,
        overflow: 'hidden',
        width: oneImageItemWidth,
        height: oneImageItemHeight,
        borderRadius: 8,
    },
    oneImage: {
        width: oneImageItemWidth,
        height: oneImageItemHeight,
        borderRadius: 8,
    },
    oneImagePlaceholder: {
        width: oneImageItemWidth,
        height: oneImageItemHeight,
        borderRadius: 8,
        backgroundColor: '#eaeaea',
    },
    twoImageContainer: {
        flexDirection: 'row',
        marginLeft: 40,
        overflow: 'hidden',
    },
    twoImageLeft: {
        width: itemWidth,
        height: itemHeight,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        marginRight: 4,
    },
    twoImageRight: {
        width: itemWidth,
        height: itemHeight,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    twoImageLeftPlaceholder: {
        width: itemWidth,
        height: itemHeight,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        marginRight: 4,
        backgroundColor: '#eaeaea',
    },
    twoImageRightPlaceholder: {
        width: itemWidth,
        height: itemHeight,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: '#eaeaea',
    },
    threeImageContainer: {
        flexDirection: 'row',
        marginLeft: 40,
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    threeImage: {
        width: itemWidth,
        height: itemHeight,
        borderRadius: 8,
    },
    threeImagePlaceholder: {
        width: itemWidth,
        height: itemHeight,
        borderRadius: 8,
        backgroundColor: '#eaeaea',
    },
    photoCountContainer: {
        position: 'absolute',
        bottom: 6,
        right: 6,
    },
    photoCountBg: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 5,
        backgroundColor: 'rgba(68, 68, 68, 0.4)',
        height: 20,
    },
    photoCount: {
        fontSize: 12,
        color: '#FFFFFF',
    },
    bottomContainer: {
        flexDirection: 'row',
        height: 24,
        marginLeft: 40,
        marginTop: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    time: {
        fontSize: 12,
        color: '#9C9C9C',
    },
    interactionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interaction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    interactionText: {
        fontSize: 14,
        color: '#222222',
    },
});

export default FeedItem;
