import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";

type CurrentIdState = {
    id: number | undefined;
}

const initialState = { id: undefined } as CurrentIdState;

export const currentIdSlice = createSlice({
    name: 'current-entity-id',
    initialState,
    reducers: {
        setCurrentId: (state, action: PayloadAction<number>) => {
            state.id = action.payload;
        },
        resetCurrentId: (state) => {
            state.id = undefined;
        }
    }
})

export const { setCurrentId, resetCurrentId } = currentIdSlice.actions;