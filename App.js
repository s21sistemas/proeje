import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import CrearSolicitudScreen from './screens/checkGuardias';
import ListarSolicitudesScreen from './screens/ListarSolicitudesScreen';
import DetallesSolicitudScreen from './screens/DetallesSolicitudScreen';
import ResponderSolicitudScreen from './screens/ResponderSolicitudScreen';
import ListarSolicitudesAtendidasScreen from './screens/ListarSolicitudesAtendidasScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SolicitudesStack = createStackNavigator();

function SolicitudesStackScreen() {
  return (
    <SolicitudesStack.Navigator>
      <SolicitudesStack.Screen
        name="ListarSolicitudes"
        component={ListarSolicitudesScreen}
        options={{ title: 'Solicitudes Pendientes' }}
      />
      <SolicitudesStack.Screen
        name="DetallesSolicitud"
        component={DetallesSolicitudScreen}
        options={{ title: 'Detalles de la Solicitud' }}
      />
      <SolicitudesStack.Screen
        name="ResponderSolicitud"
        component={ResponderSolicitudScreen}
        options={{ title: 'Responder Solicitud' }}
      />
    </SolicitudesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Check in') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Solicitudes Pendientes') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Escanear QR') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#009BFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Check in" 
        component={CrearSolicitudScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Escanear QR"
        component={ListarSolicitudesAtendidasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}