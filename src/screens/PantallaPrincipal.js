import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores } from '../theme/theme';
import { useEffect } from 'react';

export default function PantallaPrincipal() {
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
		<SafeAreaView style={[styles.container, { backgroundColor: tema.fondo }]}> 
			<View style={styles.buttonColumn}>
				<TouchableOpacity style={[styles.buttonLarge, { backgroundColor: '#28a745' }]} onPress={() => navigation.navigate('Venta', { tema })}>
					<Text style={styles.buttonTextLarge}>Vender</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.buttonLarge, { backgroundColor: '#008cff' }]} onPress={() => navigation.navigate('Inventario', { tema })}>
					<Text style={styles.buttonTextLarge}>Inventario</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
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
		marginBottom: 40,
	},
	buttonColumn: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		gap: 24,
	},
	buttonLarge: {
		paddingVertical: 32,
		paddingHorizontal: 32,
		borderRadius: 16,
		marginVertical: 12,
		width: '80%',
		alignItems: 'center',
		elevation: 2,
	},
	buttonTextLarge: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 22,
	},
});

