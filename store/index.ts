import { configureStore } from '@reduxjs/toolkit'
import modalSlice from './toggle-modal-slice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import replyingSlice  from './toggle-replying-slice'

export const store = configureStore({
    reducer: {
        modal: modalSlice,
        replying: replyingSlice,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;



