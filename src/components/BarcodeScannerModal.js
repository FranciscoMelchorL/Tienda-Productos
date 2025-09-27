import { useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

export function BarcodeScannerModal({ visible, onScan, onCancel, tema }) {
    const [hasPermission, setHasPermission] = useState(null);

    // Solicitar permisos al abrir
    React.useEffect(() => {
        if (visible) {
            BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
                setHasPermission(status === 'granted');
            });
        }
    }, [visible]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.box, { backgroundColor: tema?.fondo || 'white', borderColor: tema?.borde || '#ccc' }]}> 
                    <Text style={{ color: tema?.texto || '#333', marginBottom: 12 }}>Escanea el código de barras</Text>
                    {hasPermission === null ? (
                        <Text style={{ color: tema?.texto || '#333' }}>Solicitando permisos...</Text>
                    ) : hasPermission === false ? (
                        <Text style={{ color: 'red' }}>Sin permiso de cámara</Text>
                    ) : (
                        <BarCodeScanner
                            onBarCodeScanned={({ data }) => onScan(data)}
                            style={{ width: 260, height: 260 }}
                        />
                    )}
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#e74c3c', marginTop: 18 }]} onPress={onCancel}>
                        <Text style={styles.btnText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

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
        borderWidth: 2,
        minWidth: 260,
        alignItems: 'center',
    },
    btn: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: 120,
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
