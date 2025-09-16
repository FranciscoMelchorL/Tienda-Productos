import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colores } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export default function Venta(props) {
    const navigation = useNavigation();
    const esquema = useColorScheme();
    const tema = colores[esquema || 'light'];
    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: tema.header },
            headerTintColor: tema.texto,
            headerTitleStyle: { fontWeight: 'bold' },
        });
    }, [esquema]);

    return (
        <View style={[styles.container, { backgroundColor: tema.fondo }]}> 
            <Text style={[styles.title, { color: tema.texto }]}>Pantalla Venta</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});