import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export const LoadingOverlay = ({ visible, mensaje, tema }) => {
    if (!visible) return null;
    return (
        <View style={styles.overlay}>
            <View style={[
                styles.box,
                { backgroundColor: tema?.fondo || 'white', borderColor: tema?.borde || '#ccc', borderWidth: 2 }
            ]}>
                <ActivityIndicator size="large" color={tema?.primario || "#228b22"} />
                <Text style={[styles.text, { color: tema?.texto || '#333' }]}>{mensaje}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        elevation: 20,
    },
    box: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 180,
    },
    text: {
        marginTop: 12,
        fontSize: 16,
    }
});