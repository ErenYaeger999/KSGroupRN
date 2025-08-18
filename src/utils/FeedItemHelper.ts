import { Alert, NativeModules } from 'react-native';

// 格式化数字显示（如点赞数、收藏数）
export const formatCount = (count: number): string => {
    if (count < 1000) {
        return count.toString();
    }
    if (count < 10000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return `${(count / 10000).toFixed(1)}w`;
};

// 格式化时间戳
export const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;
    
    if (diff < minute) {
        return '刚刚';
    }
    if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`;
    }
    if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`;
    }
    if (diff < month) {
        return `${Math.floor(diff / day)}天前`;
    }
    if (diff < year) {
        return `${Math.floor(diff / month)}个月前`;
    }
    return `${Math.floor(diff / year)}年前`;
};

// 头像点击事件
export const onAvatarPress = (photo: any, groupId?: number, groupName?: string) => {
    Alert.alert(
        '用户信息',
        `用户: ${photo.user_name}\nID: ${photo.user_id}\n小组: ${groupName || '未知'} (${groupId || 0})`,
        [
            { text: '取消', style: 'cancel' },
            { text: '查看主页', onPress: () => {
                // TODO: 在这里添加跳转到用户主页的逻辑
                console.log('跳转到用户主页:', {
                    userId: photo.user_id,
                    userName: photo.user_name,
                    groupId,
                    groupName
                });
            }}
        ]
    );
};

// 图片点击事件
export const onImagePress = (photo: any, imageIndex: number, rootTag: number, groupId?: number, groupName?: string) => {
    try {
        // 尝试调用原生图片预览
        NativeModules.Kds.invoke(
            'feed',
            'schoolImagesPreview',
            JSON.stringify({
                rootTag: rootTag,
                startIndex: imageIndex,
                enableEdit: false,
                photo: photo,
            }),
        );
        
        // 记录埋点日志
        console.log('图片预览埋点:', {
            photoId: photo.photo_id,
            imageIndex,
            groupId,
            groupName,
            rootTag
        });
    } catch (error) {
        // 降级方案：显示Alert
        Alert.alert(
            '图片预览',
            `点击了第${imageIndex + 1}张图片\n图片URL: ${photo.images[imageIndex]}\n小组: ${groupName || '未知'}`,
            [
                { text: '取消', style: 'cancel' },
                { text: '查看大图', onPress: () => {
                    // TODO: 在这里添加图片预览逻辑
                    console.log('查看大图:', {
                        imageUrl: photo.images[imageIndex],
                        photoId: photo.photo_id,
                        groupId,
                        groupName
                    });
                }}
            ]
        );
    }
};

// 内容点击事件
export const onContentPress = (photo: any, rootTag: number, groupId?: number, groupName?: string) => {
    Alert.alert(
        '帖子详情',
        `标题: ${photo.caption_title || '无标题'}\n内容: ${photo.caption || '无内容'}\n小组: ${groupName || '未知'}`,
        [
            { text: '取消', style: 'cancel' },
            { text: '查看详情', onPress: () => {
                // TODO: 在这里添加跳转到帖子详情页的逻辑
                console.log('跳转到帖子详情:', {
                    photoId: photo.photo_id,
                    rootTag,
                    groupId,
                    groupName
                });
            }}
        ]
    );
};

// 点赞事件
export const onLikePress = (
    photo: any,
    currentLikeState: boolean,
    onSuccess: (newLikeState: boolean, newCount: number) => void,
    onError: (error: string) => void,
    groupId?: number,
    groupName?: string
) => {
    // TODO: 在这里添加点赞API调用
    // 模拟异步操作
    setTimeout(() => {
        const newLikeState = !currentLikeState;
        const newCount = (photo.like_count || 0) + (newLikeState ? 1 : -1);
        onSuccess(newLikeState, newCount);
        
        // 记录埋点日志
        console.log('点赞操作埋点:', {
            photoId: photo.photo_id,
            action: newLikeState ? 'like' : 'unlike',
            groupId,
            groupName
        });
    }, 100);
};

// 收藏事件
export const onCollectPress = (
    photo: any,
    currentCollectState: boolean,
    onSuccess: (newCollectState: boolean, newCount: number) => void,
    onError: (error: string) => void,
    groupId?: number,
    groupName?: string
) => {
    // TODO: 在这里添加收藏API调用
    // 模拟异步操作
    setTimeout(() => {
        const newCollectState = !currentCollectState;
        const newCount = (photo.collect_count || 0) + (newCollectState ? 1 : -1);
        onSuccess(newCollectState, newCount);
        
        // 记录埋点日志
        console.log('收藏操作埋点:', {
            photoId: photo.photo_id,
            action: newCollectState ? 'collect' : 'uncollect',
            groupId,
            groupName
        });
    }, 100);
};

// 评论点击事件
export const onCommentPress = (photo: any, rootTag: number, groupId?: number, groupName?: string) => {
    Alert.alert(
        '评论',
        `帖子: ${photo.caption_title || photo.caption || '无标题'}\n评论数: ${photo.comment_count || 0}\n小组: ${groupName || '未知'}`,
        [
            { text: '取消', style: 'cancel' },
            { text: '查看评论', onPress: () => {
                // TODO: 在这里添加跳转到评论页的逻辑
                console.log('跳转到评论页:', {
                    photoId: photo.photo_id,
                    rootTag,
                    groupId,
                    groupName
                });
            }}
        ]
    );
};