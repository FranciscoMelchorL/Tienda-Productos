import { createSlice } from '@reduxjs/toolkit';

export const productosSlice = createSlice({
    name: 'productos',
    initialState: {
        lista: [],
    },
    reducers: {
        setProductos(state, action) {
            state.lista = action.payload;
        },
        agregarProducto(state, action) {
            state.lista.push(action.payload);
        },
        editarProducto(state, action) {
            const index = state.lista.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.lista[index] = action.payload;
            }
        },
        eliminarProducto(state, action) {
            state.lista = state.lista.filter(p => p.id !== action.payload);
        },
    },
});


export const { setProductos, agregarProducto, editarProducto, eliminarProducto } = productosSlice.actions;