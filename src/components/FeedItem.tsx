import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import KwaiImage from '@kds/image';
import { useSharedStore } from '../store/store';
import {
    onAvatarPress,
    onImagePress,
    onContentPress,
    onLikePress,
    onCollectPress,
    onMentionPress,
    onTopicPress,
    formatCount,
    formatTimestamp,
} from '../network/FeedItemService';

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
    
    // 获取全局状态
    const { rootTag, groupId, groupName } = useSharedStore();

    const timeText = useMemo(() => {
        return formatTimestamp(photo.timestamp);
    }, [photo.timestamp]);

    const imageCount = photo.images.length;

    // 解析文字中的@用户信息和#话题信息
    const parseText = (text: string) => {
        // 先处理@用户，再处理#话题 - 支持中文字符
        const mentionRegex = /@([^\s@()]+)\((O\w+)\)/g;
        const topicRegex = /#([^\s#]+)/g;
        
        const parts = [];
        const mentions = [];
        const topics = [];
        
        // 收集所有@用户匹配
        let mentionMatch;
        while ((mentionMatch = mentionRegex.exec(text)) !== null) {
            mentions.push({
                start: mentionMatch.index,
                end: mentionMatch.index + mentionMatch[0].length,
                type: 'mention',
                content: `@${mentionMatch[1]}`,
                userId: mentionMatch[2].substring(1),
                userName: mentionMatch[1]
            });
        }
        
        // 收集所有#话题匹配
        let topicMatch;
        while ((topicMatch = topicRegex.exec(text)) !== null) {
            // 检查是否与@用户重叠
            const isOverlapping = mentions.some(mention => 
                topicMatch.index >= mention.start && topicMatch.index < mention.end
            );
            
            if (!isOverlapping) {
                topics.push({
                    start: topicMatch.index,
                    end: topicMatch.index + topicMatch[0].length,
                    type: 'topic',
                    content: topicMatch[0],
                    topicName: topicMatch[1]
                });
            }
        }
        
        // 合并并排序所有匹配
        const allMatches = [...mentions, ...topics].sort((a, b) => a.start - b.start);
        
        let lastIndex = 0;
        allMatches.forEach(match => {
            // 添加普通文字
            if (match.start > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.start)
                });
            }
            
            // 添加特殊元素
            parts.push(match);
            lastIndex = match.end;
        });
        
        // 添加剩余文字
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }
        
        return parts;
    };

    // 渲染富文本
    const renderRichText = (text: string, style: any, numberOfLines?: number) => {
        const parts = parseText(text);
        

        
        return (
            <Text style={style} numberOfLines={numberOfLines}>
                {parts.map((part, index) => {
                    if (part.type === 'mention') {
                        return (
                            <Text
                                key={index}
                                style={styles.mention}
                                onPress={() => onMentionPress(part.userId)}
                            >
                                {part.content}
                            </Text>
                        );
                    } else if (part.type === 'topic') {
                        return (
                            <Text
                                key={index}
                                style={styles.topic}
                                onPress={() => onTopicPress(part.topicName)}
                            >
                                {part.content}
                            </Text>
                        );
                    } else {
                        return (
                            <Text key={index}>
                                {part.content}
                            </Text>
                        );
                    }
                })}
            </Text>
        );
    };


    const likeIcon = require('../images/liked.png');
    const unLikeIcon = require('../images/like.png');
    const handleLike = () => {
        onLikePress(
            photo,
            isLike,
            likeCount,
            setIsLike,
            setLikeCount,
        );
    };


    const collectIcon = require('../images/collected.png');
    const unCollectIcon = require('../images/collect.png');
    const handleCollect = () => {
        onCollectPress(
            photo,
            isCollected,
            rootTag,
            setIsCollected,
            collectCount,
            setCollectCount,
        );
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
                    <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(photo, 0, rootTag)}>
                        <KwaiImage style={styles.oneImage} source={{ uri: photo.images[0] }} />
                    </TouchableOpacity>
                    {/* 单图右侧空白区域，点击跳转详情页 */}
                    <View style={styles.oneImageRightSpace} />
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
                    <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(photo, 0, rootTag)}>
                        <KwaiImage style={styles.twoImageLeft} source={{ uri: photo.images[0] }} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(photo, 1, rootTag)}>
                        <KwaiImage style={styles.twoImageRight} source={{ uri: photo.images[1] }} />
                    </TouchableOpacity>
                    {/* 双图右侧空白区域，点击跳转详情页 */}
                    <View style={styles.twoImageRightSpace} />
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
                <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(photo, 0, rootTag)}>
                    <KwaiImage style={styles.threeImage} source={{ uri: photo.images[0] }} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(photo, 1, rootTag)}>
                    <KwaiImage style={styles.threeImage} source={{ uri: photo.images[1] }} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(photo, 2, rootTag)}>
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
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <TouchableOpacity 
            style={styles.container} 
            activeOpacity={1} 
            onPress={() => onContentPress(photo, rootTag, false)}
        >
            <View style={styles.avatarContainer}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onAvatarPress(photo)}>
                    <KwaiImage style={styles.avatar} source={{ uri: photo.avatar_url }} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => onContentPress(photo, rootTag, false)}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {photo.user_name}
                    </Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.descriptionContainer}>
                {photo.caption_title ? (
                    renderRichText(
                        photo.caption_title,
                        [styles.captionTitle, { marginBottom: photo.caption ? 6 : 0 }],
                        1
                    )
                ) : null}
                {photo.caption ? (
                    renderRichText(
                        photo.caption,
                        styles.description,
                        3
                    )
                ) : null}
            </View>
            
            {renderImages()}
            
            <View style={styles.bottomContainer}>
                <TouchableOpacity activeOpacity={1} onPress={() => onContentPress(photo, rootTag, false)}>
                    <Text style={styles.time}>{`${timeText} 发布`}</Text>
                </TouchableOpacity>
                <View style={styles.interactionContainer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={handleLike}>
                        <View style={styles.interaction}>
                            <KwaiImage
                                    style={styles.interactionIcon}
                                    source={isLike ? likeIcon : unLikeIcon}
                                />
                                <Text style={styles.interactionText}>
                                    {formatCount(likeCount)}
                                </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={handleCollect}>
                        <View style={styles.interaction}>
                                <KwaiImage
                                    style={styles.interactionIcon}
                                    source={
                                        isCollected
                                            ? collectIcon
                                            : unCollectIcon
                                    }
                                />
                                <Text style={styles.interactionText}>
                                    {formatCount(collectCount)}
                                </Text>
                            </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => onContentPress(photo, rootTag, true)}>
                        <View style={styles.interaction}>
                                <KwaiImage
                                    style={styles.interactionIcon}
                                    source={require('../images/comment.png')}
                                />
                                <Text style={styles.interactionText}>
                                    {formatCount(photo.comment_count)}
                                </Text>
                            </View>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
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
    mention: {
        fontSize: 15,
        color: '#1890ff',  // 蓝色
        fontWeight: '500', // 稍微加粗
    },
    topic: {
        fontSize: 15,
        color: '#1890ff',  // 蓝色
        fontWeight: '500', // 稍微加粗
    },
    oneImageContainer: {
        flexDirection: 'row',
        marginLeft: 40,
        overflow: 'hidden',
        height: oneImageItemHeight,
        borderRadius: 8,
    },
    oneImage: {
        width: oneImageItemWidth,
        height: oneImageItemHeight,
        borderRadius: 8,
    },
    oneImageRightSpace: {
        flex: 1,
        height: oneImageItemHeight,
        minWidth: 20, // 确保有一定的点击区域
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
        height: itemHeight,
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
    twoImageRightSpace: {
        flex: 1,
        height: itemHeight,
        minWidth: 20, // 确保有一定的点击区域
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
    interactionIcon: {
        width: 24,
        height: 24,
    },
    interactionText: {
        fontSize: 14,
        color: '#222222',
    },
});

export default FeedItem;