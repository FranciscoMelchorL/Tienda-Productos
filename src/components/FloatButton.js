import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Modal, TextInput, Button } from 'react-native-paper';
import { guardarProductos } from '../utils/storage';
import { useDispatch, useSelector } from 'react-redux';
import { setProductos } from '../store/productosSlice';
import { Alert, Image } from 'react-native';
import { useState } from 'react';
import { fileUpload } from '../utils/fileUpload';
import { LoadingOverlay } from './LoadingOverlay';


export const FloatButton = ({ tema, onAgregar }) => {
    
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagenUrl, setImagenUrl] = useState(null);
    const dispatch = useDispatch();
    const productos = useSelector(state => state.productos.lista);
    const [cargando, setCargando] = useState(false);
    
    const abrirGaleria = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setImagenUrl(result.assets[0].uri);
        }
    };

    const agregarProducto = async() => {
        
        if (!nombre || !descripcion || !precio || !imagenUrl) {
            Alert.alert('Campos incompletos', 'Por favor completa todos los campos e incluye una imagen.');
            return;
        }

        setCargando(true);

        let extension = imagenUrl.split('.').pop();
        let mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

        const fileToUpload = {
            uri: imagenUrl,
            type: mimeType,
            name: `producto-${uuidv4()}.${extension}`,
        };

        const cloudinaryUrl = await fileUpload(fileToUpload);

        setCargando(false);

        if (!cloudinaryUrl) {
            Alert.alert('Error', 'No se pudo subir la imagen.');
            return;
        }

        const nuevo = {
            nombre,
            descripcion,
            precio: parseFloat(precio),
            imagenUrl: cloudinaryUrl,
        };

        await onAgregar(nuevo);

        const nuevosProductos = [...productos, nuevo];
        dispatch(setProductos(nuevosProductos));
        guardarProductos(nuevosProductos);

        setNombre('');
        setDescripcion('');
        setPrecio('');
        setImagenUrl(null);
        setModalVisible(false);
    };

    return (
        <>
            <Button icon="plus" mode="contained" onPress={() => setModalVisible(true)} style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
                Agregar
            </Button>

            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: tema.fondo,borderColor: tema.borde, borderWidth: 2, padding: 20, margin: 20, borderRadius: 10, zIndex: 1000, elevation: 10 }}>
                <TextInput
                    label="Nombre"
                    value={nombre}
                    onChangeText={setNombre}
                    style={{ marginBottom: 10, backgroundColor: tema.input, borderColor: tema.borde, borderWidth: 1, }}
                    textColor= {tema.texto}
                />
                <TextInput
                    label="Descripción"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    style={{ marginBottom: 10, backgroundColor: tema.input, borderColor: tema.borde, borderWidth: 1 }}
                    textColor= {tema.texto}
                />
                <TextInput
                    label="Precio"
                    value={precio}
                    onChangeText={setPrecio}
                    keyboardType="numeric"
                    style={{ marginBottom: 10, backgroundColor: tema.input, borderColor: tema.borde, borderWidth: 1 }}
                    textColor= {tema.texto}
                />
                <Button onPress={abrirGaleria} mode="outlined" style={{ marginBottom: 10 }}>
                    {imagenUrl ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </Button>
                    {imagenUrl && <Image source={{ uri: imagenUrl }} style={{ height: 100, marginBottom: 10 }} />}
                <Button mode="contained" onPress={agregarProducto}>Guardar Producto</Button>
            </Modal>

            <LoadingOverlay tema={tema} visible={cargando} mensaje="Subiendo producto..." />
        </>
    )
}


