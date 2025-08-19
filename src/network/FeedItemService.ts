import { Alert, NativeModules } from 'react-native';
import bridge from '@kds/bridge-lite';

function jumpUrl(url: string) {
    if (!url) {
        return;
    }
    let fixedUrl = url;
    if (!(url.indexOf('kwai://') === 0 || url.indexOf('ksnebula://') === 0)) {
        fixedUrl = `kwai://yodaweb?url=${url}`;
    }
    NativeModules.KRNBasic.log(fixedUrl);
    NativeModules.KRNBasic.open(fixedUrl, (e) => {
        console.log(e);
    });
}

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
export const onAvatarPress = (photo: any) => {
    jumpUrl(`kwai://profile/${photo.user_id}`);
};

// 图片点击事件
export const onImagePress = (photo: any, imageIndex: number, rootTag: number) => {
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

};

// 内容点击事件
export const onContentPress = (photo: any, rootTag: number, isCommentClick: boolean) => {
    NativeModules.Kds.invoke(
        'feed',
        'openAtlasDetail',
        JSON.stringify({
            rootTag: rootTag,
            photo: photo,
            isClickCommentEnter: isCommentClick,
        }),
    );
};

// 点赞事件
export const onLikePress = (
    photo: any,
    isLike: boolean,
    likeCount: number,
    setIsLike: (isLike: boolean) => void,
    setLikeCount: (likeCount: number) => void,
) => {
    bridge.invoke('feed.likePhoto', {
            cancel: photo.liked === 0 ? '0' : '1',
            serverExpTag: photo.serverExpTag,
            expTag: photo.exp_tag,
            photoId: `${photo.photo_id}`,
            userId: photo.user_id,
            biz: '',
        })
        .then(() => {
            console.log('点赞成功');
            const currentLike = !isLike;
            const currentLikeCount = currentLike
                ? likeCount + 1
                : likeCount - 1;
            photo.liked = currentLike ? 1 : 0;
            photo.like_count = currentLikeCount;
            setIsLike(currentLike);
            setLikeCount(currentLikeCount);
        })
        .catch((e) => {
            console.log('点赞失败', e);
        });
};

// @用户点击事件
export const onMentionPress = (user_id: string) => {
    jumpUrl(`kwai://profile/${user_id}`);
};

// 话题点击事件
export const onTopicPress = (topicName: string) => {
    console.log('点击话题:', topicName);
    // TODO: 在这里添加话题页面跳转逻辑
    jumpUrl(`kwai://topic/${topicName}`);
};

// 收藏事件
export const onCollectPress = (
    photo: any,
    isCollected: boolean,
    rootTag: number,
    setIsCollected: (isCollected: boolean) => void,
    collectCount: number,
    setCollectCount: (collectCount: number) => void,
) => {
    NativeModules.Kds.invoke(
        'feed',
        'collectOrUnCollectPhoto',
        JSON.stringify({
            photoId: `${photo.photo_id}`,
            userId: `${photo.user_id}`,
            expTag: photo.exp_tag,
            source: 'GRAPHICS_TEXT_GROUP_PAGE',
            isCollect: !isCollected,
            rootTag: rootTag,
        }),
    )
        .then((response) => {
            console.log('收藏操作成功:', response);
            const currentCollected = !isCollected;
            const currentCollectCount = Math.max(
                0,
                currentCollected ? collectCount + 1 : collectCount - 1,
            );
            photo.collected = currentCollected;
            photo.collect_count = currentCollectCount;
            setIsCollected(currentCollected);
            setCollectCount(currentCollectCount);
        })
        .catch((e) => {
            console.log('收藏操作失败:', e);
        });
};