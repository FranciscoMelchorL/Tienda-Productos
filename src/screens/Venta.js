import { generarPDFVenta } from '../utils/pdfTicket';
import { Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { View, TextInput, FlatList, Text, Image, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { colores } from '../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setProductos } from '../store/productosSlice';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerProductosFirebase } from '../utils/productosService';
import { LoadingOverlay } from '../components/LoadingOverlay';


export default function Venta() {
    const [ticketChecked, setTicketChecked] = useState(false);
    const dispatch = useDispatch();
    const productos = useSelector(state => state.productos.lista);
    const [cargando, setCargando] = useState(true);
    const esquema = useColorScheme();
    const coloresTema = require('../theme/theme').colores;
    const temaActual = coloresTema[esquema || 'light'];
    const [busqueda, setBusqueda] = useState('');
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState({});
    const [modalVisible, setModalVisible] = useState(false);

    // Recargar productos
    const recargarProductos = async () => {
        setCargando(true);
        try {
            const productosRemotos = await obtenerProductosFirebase();
            dispatch(setProductos(productosRemotos));
        } catch (e) {}
        setCargando(false);
    };

    useEffect(() => {
        recargarProductos();
    }, []);

    // Actualiza el header para mostrar el botón de carrito
    useEffect(() => {
        if (typeof arguments !== 'undefined' && arguments[0] && arguments[0].navigation) {
            const { navigation } = arguments[0];
            navigation.setOptions({
                headerStyle: { backgroundColor: temaActual.header },
                headerTintColor: temaActual.texto,
                headerTitleStyle: { fontWeight: 'bold' },
                headerRight: () => (
                    <View style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}>
                        {Object.keys(carrito).length > 0 && (
                            <View style={{
                                backgroundColor: 'red',
                                borderRadius: 10,
                                minWidth: 18,
                                height: 18,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingHorizontal: 4,
                                marginRight: 4,
                            }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>
                                    {Object.keys(carrito).length}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons name="cart" size={28} color={temaActual.texto} />
                        </TouchableOpacity>
                    </View>
                ),
            });
        }
    }, [esquema, temaActual, setModalVisible, carrito]);

    const productosFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase();
        return productos.filter(
            (p) => p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto)
        ).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [productos, busqueda]);

    // Contador + y -
    const handleCantidad = (id, valor) => {
        setCantidades({ ...cantidades, [id]: Math.max(1, valor) });
    };
    const incrementar = (id) => {
        handleCantidad(id, (cantidades[id] || 1) + 1);
    };
    const decrementar = (id) => {
        handleCantidad(id, Math.max(1, (cantidades[id] || 1) - 1));
    };

    // Añadir al carrito
    const añadirAlCarrito = (producto) => {
        setCarrito(prev => {
            const actual = prev[producto.id];
            const cantidadNueva = actual ? actual.cantidad + 1 : (cantidades[producto.id] || 1);
            return {
                ...prev,
                [producto.id]: {
                    ...producto,
                    cantidad: cantidadNueva
                }
            };
        });
    };

    if (cargando) {
        return <LoadingOverlay visible={true} mensaje="Cargando productos..." tema={temaActual} />;
    }

    // Render de cada producto
    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: temaActual.tarjeta, borderColor: temaActual.borde }]}> 
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: item.imagenUrl }} style={styles.imagen} />
                <Text style={{ fontSize: 16, color: temaActual.texto, marginTop: 5, fontWeight: 'bold' }}>Cantidad</Text>
            </View>
            <View style={styles.textosUnificado}>
                <View>
                    <Text style={[styles.nombre, { color: temaActual.texto }]}>{item.nombre}</Text>
                    <Text style={[styles.descripcion, { color: temaActual.textoSecundario }]}>{item.descripcion}</Text>
                    <Text style={[styles.precio]}>{`$${item.precio}`}</Text>
                </View>
                <View style={[styles.cantidadRowUnificado, { justifyContent: 'flex-end', alignItems: 'center' }]}> 
                    <TouchableOpacity onPress={() => decrementar(item.id)} style={styles.cantidadBtn}>
                        <Ionicons name="remove-circle-outline" size={28} color={temaActual.textoSecundario} />
                    </TouchableOpacity>
                    <Text style={[styles.cantidadTexto, { color: temaActual.texto }]}>{cantidades[item.id] || 1}</Text>
                    <TouchableOpacity onPress={() => incrementar(item.id)} style={styles.cantidadBtn}>
                        <Ionicons name="add-circle-outline" size={28} color={temaActual.textoSecundario} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: '#D45FF6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, marginLeft: 8 }]}
                        onPress={() => añadirAlCarrito(item)}
                    >
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: temaActual.texto}}>Añadir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Carrito ordenado alfabéticamente
    const productosCarrito = Object.values(carrito).sort((a, b) => a.nombre.localeCompare(b.nombre));
    const precioTotal = productosCarrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

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
                <TouchableOpacity style={styles.reloadButton} onPress={recargarProductos}>
                    <Ionicons name="refresh" size={24} color='#fff' />
                </TouchableOpacity>
            </View>
            <FlatList
                data={productosFiltrados}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={{ color: temaActual.texto, textAlign: 'center', marginTop: 20 }}>
                        No hay productos para mostrar.
                    </Text>
                }
            />
            {/* Modal carrito */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: temaActual.fondo, borderColor: temaActual.borde, borderWidth: 2 }]}> 
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: temaActual.texto }}>Carrito de compras</Text>
                        <View style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: temaActual.borde }}>
                            <View style={{ flexDirection: 'row', backgroundColor: temaActual.header, paddingVertical: 8, paddingHorizontal: 12 }}>
                                <Text style={{ flex: 1, fontWeight: 'bold', color: temaActual.texto}}>Producto</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', color: temaActual.texto, textAlign: 'center' }}>Cantidad</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', color: temaActual.texto, textAlign: 'center' }}>Precio</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', color: temaActual.texto, textAlign: 'center' }}>Acción</Text>
                            </View>
                            {productosCarrito.length === 0 ? (
                                <Text style={{ color: temaActual.texto, textAlign: 'center', marginTop: 20, padding: 12 }}>No hay productos en el carrito.</Text>
                            ) : (
                                productosCarrito.map(item => (
                                    <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: temaActual.borde, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: temaActual.fondo }}>
                                        <Text style={{ flex: 1, color: temaActual.texto }}>{item.nombre}</Text>
                                        <Text style={{ flex: 1, color: temaActual.texto, fontWeight: 'bold', textAlign: 'center' }}>{item.cantidad}</Text>
                                        <Text style={{ flex: 1, color: temaActual.texto, textAlign: 'center' }}>{`$${(item.precio * item.cantidad).toFixed(2)}`}</Text>
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => {
                                                const nuevoCarrito = { ...carrito };
                                                delete nuevoCarrito[item.id];
                                                setCarrito(nuevoCarrito);
                                            }} style={{ padding: 4 }}>
                                                <Ionicons name="trash" size={22} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: temaActual.texto }}>Total: </Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#228b22', marginLeft: 8 }}>{`$${precioTotal.toFixed(2)}`}</Text>
                        </View>
                        <Pressable
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                            onPress={() => setTicketChecked(!ticketChecked)}
                        >
                            <View style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                borderWidth: 2,
                                borderColor: temaActual.borde,
                                backgroundColor: ticketChecked ? '#28a745' : temaActual.fondo,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                {ticketChecked && (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                )}
                            </View>
                            <Text style={{ color: temaActual.texto, marginLeft: 8 }}>Imprimir ticket PDF</Text>
                        </Pressable>
                        <TouchableOpacity
                            style={[styles.cerrarBtn, { marginTop: 10, backgroundColor: '#28a745' }]}
                            onPress={async () => {
                                if (ticketChecked && productosCarrito.length > 0) {
                                    const now = new Date();
                                    const nombreArchivo = `venta_${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,'0')}_${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
                                    const fecha = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
                                    try {
                                        await generarPDFVenta({ productos: productosCarrito, total: precioTotal, fecha, nombreArchivo });
                                    } catch (e) {
                                        alert('No se pudo guardar el ticket PDF: ' + e.message);
                                    }
                                }
                                setCarrito({});
                                setModalVisible(false);
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Pagar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.cerrarBtn, { marginTop: 10 }]} onPress={() => setModalVisible(false)}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    textosUnificado: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        minHeight: 110,
    },
    cantidadControlesUnificado: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    cantidadRowUnificado: {
        flexDirection: 'row',
        alignItems: 'center',
    },
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
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 110,
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
    cantidadColumna: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        flex: 0.7,
    },
    cantidadBtn: {
        paddingVertical: 2,
    },
    cantidadTexto: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 3,
        minWidth: 24,
        textAlign: 'center',
    },
    addButton: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    imagen: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
    },
    textos: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    textosUnificado: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        minHeight: 110,
    },
    cantidadControlesUnificado: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    cantidadRowUnificado: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nombre: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    descripcion: {
        fontSize: 14,
        flex: 0,
        flexWrap: 'wrap',
        textAlignVertical: 'top',
    },
    precio: {
        fontSize: 14,
        fontWeight: '600',
        color: '#228b22',
    },
    cantidadRow: {
        display: 'none',
    },
    cantidadControlesColumna: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    cantidadRowColumna: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        borderRadius: 16,
        padding: 20,
        elevation: 4,
    },
    cerrarBtn: {
        marginTop: 18,
        backgroundColor: '#008cff',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    tablaHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingBottom: 6,
        marginBottom: 6,
    }
});
