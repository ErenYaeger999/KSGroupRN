import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';

interface listState {
    value: any;
}

const initialState: listState = {
    value: [],
};

export const listSlice = createSlice({
    name: 'listData',
    initialState,
    reducers: {
        beginLoading: () => {
            console.log('开始加载初始listData');
        },
        finishLoading: (state, { payload }) => {
            state.value = payload;
        },
    },
});

export const { beginLoading, finishLoading } = listSlice.actions;

const getPhotoDate = async (start: number, count: number) => {
    const responseHusky = await fetch('https://dog.ceo/api/breed/husky/images');
    const responseBeagle = await fetch(
        'https://dog.ceo/api/breed/beagle/images',
    );

    const responseJsonHusky = await responseHusky.json();
    const responseJsonBeagle = await responseBeagle.json();

    const fullData = responseJsonHusky.message.concat(
        responseJsonBeagle.message,
    );

    const filteredData = fullData
        .slice(start, Math.min(fullData.length, start + count))
        .map((item: string, index: number) => ({ url: item, index }));
    return filteredData;
};

export const fetchListData = () => async (dispatch) => {
    // 开始加载处理，可以Loading提示
    dispatch(beginLoading());
    // 模拟网络请求获取数据
    getPhotoDate(0, 300)
        .then((data) => {
            // 网络请求结束后更新结果
            dispatch(finishLoading(data));
        })
        .catch((err) => {
            console.log(`请求失败 ${err}`);
        });
};

export const selectListValue = (state: RootState) => state.listData.value;

export default listSlice.reducer;
