import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fileUpload } from '../utils/fileUpload';
import { LoadingOverlay } from './LoadingOverlay';

export function AgregarProducto({ tema, onAgregar }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagenUrl, setImagenUrl] = useState(null);
    const [cargando, setCargando] = useState(false);

    const abrirModal = () => setModalVisible(true);
    // No se cierra al tocar fuera del modal

    const abrirGaleria = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) {
            setImagenUrl(result.assets[0].uri);
        }
    };

    const agregarProducto = async () => {
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
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setImagenUrl(null);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={abrirModal}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.text}>Agregar producto</Text>
            </TouchableOpacity>
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {}}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: tema.fondo, borderColor: tema.borde, borderWidth: 2 }]}> 
                        <Text style={{ color: tema.texto, fontSize: 18, marginBottom: 10 }}>Agregar producto</Text>
                        <TextInput
                            placeholder="Nombre"
                            value={nombre}
                            onChangeText={setNombre}
                            style={{ marginBottom: 10, backgroundColor: tema.input, borderColor: tema.borde, borderWidth: 1, color: tema.texto, width: '100%', padding: 8, borderRadius: 8 }}
                            placeholderTextColor={tema.textoSecundario}
                        />
                        <TextInput
                            placeholder="Descripción"
                            value={descripcion}
                            onChangeText={setDescripcion}
                            style={{ marginBottom: 10, backgroundColor: tema.input, borderColor: tema.borde, borderWidth: 1, color: tema.texto, width: '100%', padding: 8, borderRadius: 8 }}
                            placeholderTextColor={tema.textoSecundario}
                        />
                        <TextInput
                            placeholder="Precio"
                            value={precio}
                            onChangeText={setPrecio}
                            keyboardType="numeric"
                            style={{ marginBottom: 10, backgroundColor: tema.input, borderColor: tema.borde, borderWidth: 1, color: tema.texto, width: '100%', padding: 8, borderRadius: 8 }}
                            placeholderTextColor={tema.textoSecundario}
                        />
                        <TouchableOpacity style={[styles.imageButton, { backgroundColor: tema.input }]} onPress={abrirGaleria}>
                            <Ionicons name="image" size={20} color={tema.primario} />
                            <Text style={{ color: tema.texto, marginLeft: 8, fontWeight: 'bold' }}>
                                {imagenUrl ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                            </Text>
                        </TouchableOpacity>
                        {imagenUrl && (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: imagenUrl }} style={styles.imagePreview} />
                            </View>
                        )}
                        <TouchableOpacity style={styles.saveButton} onPress={agregarProducto}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Guardar Producto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={{ color: 'white' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                    <LoadingOverlay tema={tema} visible={cargando} mensaje="Subiendo producto..." />
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    imagePreviewContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 8,
        resizeMode: 'cover',
        backgroundColor: '#eee',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'transparent',
        padding: 8,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: '#008cff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#28a745', // Verde tipo éxito
    },
    text: {
        color: 'white',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "red",
        padding: 10,
        borderRadius: 8,
    },
});
