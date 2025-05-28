import { useState, useEffect } from 'react';
import { Modal, View, TextInput, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fileUpload } from '../utils/fileUpload';
import { LoadingOverlay } from './LoadingOverlay';

export const EditProductModal = ({ visible, producto, onClose, onSave, tema }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagenUrl, setImagenUrl] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (producto) {
            setNombre(producto.nombre);
            setDescripcion(producto.descripcion);
            setPrecio(producto.precio.toString());
            setImagenUrl(producto.imagenUrl);
        }
    }, [producto]);

    const abrirGaleria = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setImagenUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!nombre || !descripcion || !precio) return;

        setCargando(true);

        let urlFinal = imagenUrl;

        if (imagenUrl && imagenUrl !== producto.imagenUrl) {
            let extension = imagenUrl.split('.').pop();
            let mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
            const fileToUpload = {
                uri: imagenUrl,
                type: mimeType,
                name: `producto-editado.${extension}`,
            };
            const cloudinaryResp = await fileUpload(fileToUpload);
            if (cloudinaryResp && cloudinaryResp.url) {
                urlFinal = cloudinaryResp.url;
            }
        }

        onSave({
            ...producto,
            nombre,
            descripcion,
            precio: parseFloat(precio),
            imagenUrl: urlFinal,
        });

        setCargando(false);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.box, { backgroundColor: tema?.fondo || 'white' }]}>
                    <Text style={[styles.label, { color: tema?.texto || '#333' }]}>Editar producto</Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Nombre"
                        style={[styles.input, { backgroundColor: tema?.input || '#fff', color: tema?.texto || '#333' }]}
                        placeholderTextColor={tema?.textoSecundario || '#888'}
                    />
                    <TextInput
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Descripción"
                        style={[styles.input, { backgroundColor: tema?.input || '#fff', color: tema?.texto || '#333' }]}
                        placeholderTextColor={tema?.textoSecundario || '#888'}
                    />
                    <TextInput
                        value={precio}
                        onChangeText={setPrecio}
                        placeholder="Precio"
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: tema?.input || '#fff', color: tema?.texto || '#333' }]}
                        placeholderTextColor={tema?.textoSecundario || '#888'}
                    />
                    {imagenUrl ? (
                        <Image source={{ uri: imagenUrl }} style={styles.imagen} />
                    ) : null}

                    <TouchableOpacity
                        style={[styles.btnCambiarImagen, { backgroundColor: tema?.borde || '#888', marginBottom: 10 }]}
                        onPress={abrirGaleria}
                    >
                        <Text style={styles.btnText}>Cambiar Imagen</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: tema?.primario || '#228b22' }]} onPress={handleSave}>
                            <Text style={styles.btnText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#e74c3c' }]} onPress={onClose}>
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <LoadingOverlay visible={cargando} mensaje="Actualizando producto..." tema={tema} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        padding: 24,
        borderRadius: 12,
        minWidth: 260,
        alignItems: 'stretch',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
        borderRadius: 8,
        padding: 10,
    },
    imagen: {
        width: 80,
        height: 80,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    btn: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnCambiarImagen: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 6,
    },
});