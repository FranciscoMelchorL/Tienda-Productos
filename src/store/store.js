import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productosSlice } from './productosSlice';

const persistConfig = {
    key: 'productos',
    storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, productosSlice.reducer);

export const store = configureStore({
    reducer: {
        productos: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignora los paths problemáticos de redux-persist
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/PAUSE',
                    'persist/FLUSH',
                    'persist/PURGE',
                    'persist/REGISTER',
                ],
            },
        }),
});

export const persistor = persistStore(store);