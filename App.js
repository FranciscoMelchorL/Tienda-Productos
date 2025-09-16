import { Provider } from 'react-redux';
import PantallaPrincipal from './src/screens/PantallaPrincipal';
import Inventario from './src/screens/Inventario';
import Venta from './src/screens/Venta';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { persistor, store } from './src/store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { useColorScheme } from 'react-native';
import { colores } from './src/theme/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  const esquema = useColorScheme();
  const tema = colores[esquema || 'light'];
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="PantallaPrincipal"
              screenOptions={{
                headerStyle: { backgroundColor: tema.primario },
                headerTintColor: tema.texto,
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            >
              <Stack.Screen name="PantallaPrincipal">
                {props => <PantallaPrincipal {...props} tema={tema} />}
              </Stack.Screen>
              <Stack.Screen name="Inventario">
                {props => <Inventario {...props} tema={tema} />}
              </Stack.Screen>
              <Stack.Screen name="Venta">
                {props => <Venta {...props} tema={tema} />}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}