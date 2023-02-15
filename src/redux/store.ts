import { configureStore } from "@reduxjs/toolkit";
import { categoryListSlice } from "./categoryListSlice";
import { currentIdSlice } from "./currentIdSlice";

export const store = configureStore({
    reducer: {
        currentId: currentIdSlice.reducer,
        categoryList: categoryListSlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;