import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'productos';

export const guardarProductos = async (productos) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
    } catch (error) {
        console.error('Error guardando productos:', error);
    }
};

export const cargarProductos = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error cargando productos:', error);
        return [];
    }
};
