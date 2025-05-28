import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const ConfirmDialog = ({ visible, mensaje, onConfirm, onCancel, tema }) => {
    if (!visible) return null;
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={[styles.box, { backgroundColor: tema?.fondo || 'white', borderColor: tema?.borde || '#ccc' }]}>
                    <Text style={[styles.text, { color: tema?.texto || '#333' }]}>{mensaje}</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#e74c3c' }]} onPress={onConfirm}>
                            <Text style={styles.btnText}>Sí</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#95a5a6' }]} onPress={onCancel}>
                            <Text style={styles.btnText}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        borderWidth: 2,
        minWidth: 220,
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        marginBottom: 18,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    btn: {
        flex: 1,
        marginHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});