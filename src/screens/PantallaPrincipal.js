// src/screens/PantallaPrincipal.js
import { useState, useEffect, useMemo } from 'react';
import { View, TextInput, FlatList, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { colores } from '../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { cargarProductos, guardarProductos } from '../utils/storage';
import { setProductos } from '../store/productosSlice';
import { FloatButton } from '../components/FloatButton';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EditProductModal } from '../components/EditProducto';
import { obtenerProductosFirebase, guardarProductosLocal, cargarProductosLocal, agregarProductoFirebase, editarProductoFirebase, eliminarProductoFirebase} from '../utils/productosService';

export default function PantallaPrincipal() {

    const dispatch = useDispatch();
    const productos = useSelector(state => state.productos.lista);

    useEffect(() => {
        const cargar = async () => {
            try {
                const productosRemotos = await obtenerProductosFirebase();
                dispatch(setProductos(productosRemotos));
                guardarProductosLocal(productosRemotos);
            } catch (e) {
                const productosLocales = await cargarProductosLocal();
                dispatch(setProductos(productosLocales));
            }
        };
        cargar();
    }, []);

    const esquema = useColorScheme();
    const tema = colores[esquema || 'light'];
    const [busqueda, setBusqueda] = useState('');

    const productosFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase();

        return productos.filter(
            (p) => p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto)
        ).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [productos, busqueda]);

    const agregarProducto = async (nuevoProducto) => {
        const productoConId = await agregarProductoFirebase(nuevoProducto);
        const nuevos = [...productos, productoConId];
        dispatch(setProductos(nuevos));
        guardarProductosLocal(nuevos);
    };

    const editarProducto = async (productoEditado) => {
        await editarProductoFirebase(productoEditado);
        const nuevos = productos.map(p =>
            p.id === productoEditado.id ? productoEditado : p
        );
        dispatch(setProductos(nuevos));
        guardarProductosLocal(nuevos);
    };

    const borrarProducto = async (id) => {
        await eliminarProductoFirebase(id);
        const nuevos = productos.filter(p => p.id !== id);
        dispatch(setProductos(nuevos));
        guardarProductosLocal(nuevos);
    };

    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const pedirConfirmacionBorrar = (producto) => {
        setProductoAEliminar(producto);
        setDialogVisible(true);
    };

    const confirmarBorrado = async () => {
        if (productoAEliminar) {
            await borrarProducto(productoAEliminar.id);
        }
        setDialogVisible(false);
        setProductoAEliminar(null);
    };

    const cancelarBorrado = () => {
        setDialogVisible(false);
        setProductoAEliminar(null);
    };

    const [productoAEditar, setProductoAEditar] = useState(null);
    const [editVisible, setEditVisible] = useState(false);

    const pedirEditar = (producto) => {
        setProductoAEditar(producto);
        setEditVisible(true);
    };

    const guardarEdicion = async (productoEditado) => {
        await editarProducto(productoEditado);
        setEditVisible(false);
        setProductoAEditar(null);
    };

    const cancelarEdicion = () => {
        setEditVisible(false);
        setProductoAEditar(null);
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
            <Image source={{ uri: item.imagenUrl }} style={styles.imagen} />
            <View style={styles.textos}>
                <Text style={[styles.nombre, { color: tema.texto }]}>{item.nombre}</Text>
                <Text style={[styles.descripcion, { color: tema.textoSecundario }]}>{item.descripcion}</Text>
                <Text style={[styles.precio]}>{`$${item.precio}`}</Text>
            </View>
            <TouchableOpacity onPress={() => pedirEditar(item)}>
                <Ionicons name="create" size={32} color={tema.primario || "#008cff"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pedirConfirmacionBorrar(item)}>
                <Ionicons name="trash" size={32} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
            <StatusBar style="auto" />
            <TextInput
                placeholder="Buscar producto..."
                placeholderTextColor={tema.textoSecundario}
                value={busqueda}
                onChangeText={setBusqueda}
                style={[styles.input, { backgroundColor: tema.input, color: tema.texto }]}
            />
            <FlatList
                data={productosFiltrados}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            <FloatButton tema={tema} onAgregar={agregarProducto} />
            <EditProductModal
                visible={editVisible}
                producto={productoAEditar}
                onClose={cancelarEdicion}
                onSave={guardarEdicion}
                tema={tema}
            />
            <ConfirmDialog
                visible={dialogVisible}
                mensaje="¿Estás seguro de que deseas borrar este producto?"
                onConfirm={confirmarBorrado}
                onCancel={cancelarBorrado}
                tema={tema}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        padding: 16,
        paddingTop:10,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        borderColor: '#ccc',
    },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 10,
    },
    imagen: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
    },
    textos: {
        flex: 1,
        justifyContent: 'center',
    },
    nombre: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    descripcion: {
        fontSize: 14,
        marginVertical: 4,
    },
    precio: {
        fontSize: 14,
        fontWeight: '600',
        color: '#228b22',
    },
});
