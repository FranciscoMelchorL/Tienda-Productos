import { Provider } from 'react-redux';
import PantallaPrincipal from './src/screens/PantallaPrincipal';
import { store } from './src/store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PantallaPrincipal />
      </Provider>
    </SafeAreaProvider>
  );
}