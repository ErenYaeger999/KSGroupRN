import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';

interface OtherState {
    value: number;
}

const initialState: OtherState = {
    value: 0,
};

export const otherSlice = createSlice({
    name: 'other',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
    },
});

export const selectOtherValue = (state: RootState) => state.other.value;

export default otherSlice.reducer;
