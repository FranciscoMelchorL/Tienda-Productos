import { Provider } from 'react-redux';
import PantallaPrincipal from './src/screens/PantallaPrincipal';
import { persistor, store } from './src/store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PantallaPrincipal />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}