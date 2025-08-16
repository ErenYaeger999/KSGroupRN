import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';

interface CounterState {
    value: number;
}

const initialState: CounterState = {
    value: 0,
};

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        reset: (state) => {
            state.value = 0;
        },
        beginLoading: () => {
            console.log('开始加载初始count');
        },
        finishLoading: (state, { payload }) => {
            state.value = payload;
        },
    },
});

export const { increment, decrement, reset, beginLoading, finishLoading } =
    counterSlice.actions;

const fetchData = () => {
    // return request({
    //     url: '/rest/app/flow/live/c/itemCombination/list',
    //     method: 'POST',
    //     businessName: 'merchant',
    //     headers: {
    //         'Content-Type': 'application/json', // 不带字符集
    //     },
    //     params: params,
    // });

    /// 模拟网络请求获取数据
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(2);
        }, 1000);
    });
};

export const fetchCountData = () => async (dispatch) => {
    // 开始加载处理，可以Loading提示
    dispatch(beginLoading());
    // 模拟网络请求获取数据
    fetchData()
        .then((data) => {
            // 网络请求结束后更新结果
            dispatch(finishLoading(data));
        })
        .catch((err) => {
            console.log(`请求失败 ${err}`);
        });
};

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
