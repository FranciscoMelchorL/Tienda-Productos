import { useState, useEffect, useMemo } from 'react';
import { View, TextInput, FlatList, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { colores } from '../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setProductos } from '../store/productosSlice';
import { AgregarProducto } from '../components/AgregarProducto';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EditProductModal } from '../components/EditProducto';
import { obtenerProductosFirebase, guardarProductosLocal, cargarProductosLocal, agregarProductoFirebase, editarProductoFirebase, eliminarProductoFirebase} from '../utils/productosService';
import { LoadingOverlay } from '../components/LoadingOverlay';

export default function Inventario() {

    const dispatch = useDispatch();
    const productos = useSelector(state => state.productos.lista);
    const [cargando, setCargando] = useState(true);

    // Función para recargar productos
    const recargarProductos = async () => {
        setCargando(true);
        try {
            const productosRemotos = await obtenerProductosFirebase();
            dispatch(setProductos(productosRemotos));
            // guardarProductosLocal(productosRemotos);
        } catch (e) {
            // const productosLocales = await cargarProductosLocal();
            // dispatch(setProductos(productosLocales));
        }
        setCargando(false);
    };

    useEffect(() => {
        recargarProductos();
    }, []);
    // Recibe el tema por props y actualiza el header dinámicamente
    const { navigation, tema } = arguments[0];
    const esquema = useColorScheme();
    const colores = require('../theme/theme').colores;
    const temaActual = tema || colores[esquema || 'light'];
    require('react').useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: temaActual.header },
            headerTintColor: temaActual.texto,
            headerTitleStyle: { fontWeight: 'bold' },
        });
    }, [esquema]);
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
        // guardarProductosLocal(nuevos);
    };

    const editarProducto = async (productoEditado) => {
        await editarProductoFirebase(productoEditado);
        const nuevos = productos.map(p =>
            p.id === productoEditado.id ? productoEditado : p
        );
        dispatch(setProductos(nuevos));
        // guardarProductosLocal(nuevos);
    };

    const borrarProducto = async (id) => {
        await eliminarProductoFirebase(id);
        const nuevos = productos.filter(p => p.id !== id);
        dispatch(setProductos(nuevos));
        // guardarProductosLocal(nuevos);
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
                <Ionicons name="create" size={32} color="#008cff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pedirConfirmacionBorrar(item)}>
                <Ionicons name="trash" size={32} color="red" />
            </TouchableOpacity>
        </View>
    );

    if (cargando) {
        return <LoadingOverlay visible={true} mensaje="Cargando productos..." tema={tema} />;
    }

    return (
        <SafeAreaView style={[{ backgroundColor: temaActual.fondo, flex: 1, padding: 10 }]} edges={['left', 'right']}> 
            <StatusBar barStyle={esquema === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.inputRow, { marginTop: 0 }]}> 
                <TextInput
                    placeholder="Buscar producto..."
                    placeholderTextColor={temaActual.textoSecundario}
                    value={busqueda}
                    onChangeText={setBusqueda}
                    style={[styles.input, { backgroundColor: temaActual.input, color: temaActual.texto }]}
                />
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.updateButton, { backgroundColor: '#008cff' }]} onPress={recargarProductos}>
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.actionText}>Recargar productos</Text>
                </TouchableOpacity>
                <AgregarProducto tema={temaActual} onAgregar={agregarProducto} />
            </View>
            <FlatList
                data={productosFiltrados}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            <EditProductModal
                visible={editVisible}
                producto={productoAEditar}
                onClose={cancelarEdicion}
                onSave={guardarEdicion}
                tema={temaActual}
            />
            <ConfirmDialog
                visible={dialogVisible}
                mensaje="¿Estás seguro de que deseas borrar este producto?"
                onConfirm={confirmarBorrado}
                onCancel={cancelarBorrado}
                tema={temaActual}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'flex-start',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#008cff',
        padding: 10,
        borderRadius: 8,
        marginRight: 8,
    },
    actionText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
            flex: 1,
    },
    reloadButton: {
        marginLeft: 8,
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#008cff',
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
