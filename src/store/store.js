import { configureStore } from '@reduxjs/toolkit';
import { productosSlice } from './productosSlice';

export const store = configureStore({
    reducer: {
        productos: productosSlice.reducer,
    },
});
