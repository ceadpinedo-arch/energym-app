import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import HomeSocioScreen from './screens/HomeSocioScreen';
import PanelAdminScreen from './screens/PanelAdminScreen';
import BibliotecaScreen from './screens/BibliotecaScreen';
import AsistenteIAScreen from './screens/AsistenteIAScreen';
import HistorialPagosScreen from './screens/HistorialPagosScreen';
import ListaSociosScreen from './screens/ListaSociosScreen';
import PagoEfectivoScreen from './screens/PagoEfectivoScreen';
import AltaSocioScreen from './screens/AltaSocioScreen';
import DetalleSocioScreen from './screens/DetalleSocioScreen';
import AparienciaScreen from './screens/AparienciaScreen';
import DatosGimnasioScreen from './screens/DatosGimnasioScreen';
import { ThemeProvider } from './theme/ThemeContext';
import CambiarClaveScreen from './screens/CambiarClaveScreen';
import ProgresoScreen from './screens/ProgresoScreen';

const Stack = createNativeStackNavigator();
const WEBNAV = Platform.OS === 'web';
const RAIZ = ['Login', 'HomeSocio', 'PanelAdmin'];
const TIT = { Biblioteca: 'Biblioteca', AsistenteIA: 'Asistente IA', HistorialPagos: 'Historial de pagos', ListaSocios: 'Socios', PagoEfectivo: 'Pago en efectivo', AltaSocio: 'Nuevo socio', DetalleSocio: 'Detalle del socio', Apariencia: 'Apariencia', DatosGimnasio: 'Datos del gimnasio', CambiarClave: 'Cambiar clave', Progreso: 'Mi progreso' };

export default function AppNavigator() {
  return (
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={({ route }) => ({ headerShown: WEBNAV && RAIZ.indexOf(route.name) < 0, title: TIT[route.name] || route.name, headerBackTitle: 'Volver', headerTitleAlign: 'center' })}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeSocio" component={HomeSocioScreen} />
        <Stack.Screen name="PanelAdmin" component={PanelAdminScreen} />
        <Stack.Screen name="Biblioteca" component={BibliotecaScreen} />
        <Stack.Screen name="AsistenteIA" component={AsistenteIAScreen} />
        <Stack.Screen name="HistorialPagos" component={HistorialPagosScreen} />
        <Stack.Screen name="ListaSocios" component={ListaSociosScreen} />
        <Stack.Screen name="PagoEfectivo" component={PagoEfectivoScreen} />
        <Stack.Screen name="AltaSocio" component={AltaSocioScreen} />
        <Stack.Screen name="DetalleSocio" component={DetalleSocioScreen} />
            <Stack.Screen name="Apariencia" component={AparienciaScreen} />
            <Stack.Screen name="DatosGimnasio" component={DatosGimnasioScreen} />
            <Stack.Screen name="CambiarClave" component={CambiarClaveScreen} />
            <Stack.Screen name="Progreso" component={ProgresoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
