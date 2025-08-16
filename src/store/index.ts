import { configureStore } from '@reduxjs/toolkit';
import { counterSlice } from './slice';
import { otherSlice } from './slice2';
import { listSlice } from './listSlice';
import thunk from 'redux-thunk';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';

// 1、定义store
export const store = configureStore({
    // 1.1 组合各个reducer
    reducer: {
        counter: counterSlice.reducer,
        other: otherSlice.reducer,
        listData: listSlice.reducer,
    },
    // 1.2 添加中间件
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

// 定义RootState，为了能够更好的支持TS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// 定义带类型的dispatch和selector hook，为了能够在整个App中使用正确的TS类型
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
