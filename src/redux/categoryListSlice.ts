import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductCategory } from "../api/categories";

type CurrentMapState = {
    list: ProductCategory[] | undefined;
}

const initialState = { list: undefined } as CurrentMapState;

export const categoryListSlice = createSlice({
    name: 'current-entity-id',
    initialState,
    reducers: {
        setCategoryList: (state, action: PayloadAction<ProductCategory[]>) => {
            state.list = action.payload;
        }
    }
})

export const { setCategoryList } = categoryListSlice.actions;