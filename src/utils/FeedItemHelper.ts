import { NativeModules, Alert } from 'react-native';


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

/**
 * 头像点击事件
 * @param photo 图片数据对象
 */
export const onAvatarPress = (photo: any) => {
    console.log('点击头像', { userId: photo.user_id, userName: photo.user_name });
    
    jumpUrl(`kwai://profile/${photo.user_id}`);
};

// ==================== 图片相关 ====================

/**
 * 图片点击事件 - 打开图片预览
 * @param photo 图片数据对象
 * @param imageIndex 图片索引
 * @param rootTag React Native根标签
 */
export const onImagePress = (photo: any, imageIndex: number, rootTag: number) => {
    console.log('点击图片', { photoId: photo.photo_id, imageIndex });
    
    // TODO: 这里你可以实现图片预览逻辑
    // 例如：调用原生图片预览
    // openNativeImagePreview(photo, imageIndex, rootTag);
    
    // 临时实现：显示Alert
    Alert.alert(
        '图片预览',
        `第${imageIndex + 1}张图片\n图片URL: ${photo.images[imageIndex]}`,
        [{ text: '确定' }]
    );
};

// ==================== 内容相关 ====================

/**
 * 内容区域点击事件 - 进入帖子详情页
 * @param photo 图片数据对象
 * @param rootTag React Native根标签
 * @param isCommentClick 是否是点击评论进入
 */
export const onContentPress = (photo: any, rootTag: number, isCommentClick: boolean = false) => {
    console.log('点击内容区域', { photoId: photo.photo_id, isCommentClick });

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

// ==================== 交互相关 ====================

/**
 * 点赞功能
 * @param photo 图片数据对象
 * @param isLiked 当前点赞状态
 * @param onSuccess 成功回调
 * @param onError 失败回调
 */
export const onLikePress = (
    photo: any, 
    isLiked: boolean,
    onSuccess: (newLikeState: boolean, newCount: number) => void,
    onError: (error: any) => void
) => {
    console.log('点赞操作', { photoId: photo.photo_id, isLiked });
    
    // TODO: 这里你可以实现真实的点赞API调用
    // 例如：调用点赞接口
    // callLikeAPI(photo.photo_id, !isLiked).then(onSuccess).catch(onError);
    
    // 临时实现：模拟点赞
    setTimeout(() => {
        const newLikeState = !isLiked;
        const newCount = (photo.like_count || 0) + (newLikeState ? 1 : -1);
        onSuccess(newLikeState, Math.max(0, newCount));
    }, 300);
};

/**
 * 收藏功能
 * @param photo 图片数据对象
 * @param isCollected 当前收藏状态
 * @param onSuccess 成功回调
 * @param onError 失败回调
 */
export const onCollectPress = (
    photo: any,
    isCollected: boolean,
    onSuccess: (newCollectState: boolean, newCount: number) => void,
    onError: (error: any) => void
) => {
    console.log('收藏操作', { photoId: photo.photo_id, isCollected });
    
    // TODO: 这里你可以实现真实的收藏API调用
    // 例如：调用收藏接口
    // callCollectAPI(photo.photo_id, !isCollected).then(onSuccess).catch(onError);
    
    // 临时实现：模拟收藏
    setTimeout(() => {
        const newCollectState = !isCollected;
        const newCount = (photo.collect_count || 0) + (newCollectState ? 1 : -1);
        onSuccess(newCollectState, Math.max(0, newCount));
    }, 300);
};

/**
 * 评论点击事件
 * @param photo 图片数据对象
 * @param rootTag React Native根标签
 */
export const onCommentPress = (photo: any, rootTag: number) => {
    console.log('点击评论', { photoId: photo.photo_id });
    
    // TODO: 这里你可以实现评论相关逻辑
    // 例如：进入详情页并定位到评论区
    // openPostDetailWithComment(photo, rootTag);
    
    // 临时实现：调用内容点击，标记为评论点击
    onContentPress(photo, rootTag, true);
};

// ==================== 工具函数 ====================

/**
 * 格式化数字显示（万、亿）
 * @param count 数字
 * @returns 格式化后的字符串
 */
export const formatCount = (count: number): string => {
    if (count <= 9999) {
        return `${count}`;
    } else if (count >= 10000 && count <= 99999999) {
        const w = count / 10000;
        const wWith1Dot = Number(w.toFixed(1));
        return `${wWith1Dot}万`;
    } else if (count > 99999999) {
        const y = count / 100000000;
        const yWith1Dot = Number(y.toFixed(1));
        return `${yWith1Dot}亿`;
    }
    return `${count}`;
};

/**
 * 格式化时间显示
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
export const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const postTime = new Date(timestamp);

    const minutesAgo = Math.floor((now - timestamp) / (1000 * 60));
    const hoursAgo = Math.floor((now - timestamp) / (1000 * 60 * 60));
    const daysAgo = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
    const postYear = postTime.getFullYear();
    const nowYear = new Date().getFullYear();

    if (minutesAgo < 1) {
        return '刚刚';
    } else if (minutesAgo < 60) {
        return `${minutesAgo}分钟前`;
    } else if (hoursAgo < 24) {
        return `${hoursAgo}小时前`;
    } else if (daysAgo <= 1) {
        return '昨天';
    } else if (daysAgo <= 4) {
        return `${daysAgo}天前`;
    } else if (postYear === nowYear) {
        return `${postTime.getMonth() + 1}-${postTime.getDate()}`;
    } else {
        return `${postTime.getFullYear()}-${postTime.getMonth() + 1}-${postTime.getDate()}`;
    }
};