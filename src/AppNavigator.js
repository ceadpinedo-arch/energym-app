import React from 'react';
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
import QRAccesoScreen from './screens/QRAccesoScreen';
import CambiarClaveScreen from './screens/CambiarClaveScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            <Stack.Screen name="QRAcceso" component={QRAccesoScreen} />
            <Stack.Screen name="CambiarClave" component={CambiarClaveScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
