import * as React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import CheckGuardias from './screens/checkGuardias';
import ListarSolicitudesScreen from './screens/ListarSolicitudesScreen';
import DetallesSolicitudScreen from './screens/DetallesSolicitudScreen';
import ResponderSolicitudScreen from './screens/ResponderSolicitudScreen';
import ListarSolicitudesAtendidasScreen from './screens/ListarSolicitudesAtendidasScreen';
import ReporteIncidentesScreen from './screens/ReporteIncidentesScreen';
import DashboardSupervisor from './screens/DashboardSupervisor'; 
import ReportesScreen from './screens/ReportesSupervisorScreen';
import BitacoraForm from './screens/BitacoraForm'; 
import DetallesOrden from './screens/DetallesOrden';
import RegistroGuardia from './screens/RegistroGuardia';
import RegistroUnidad from './screens/ReporteUnidad';
import ReporteDiarioGuardia from './screens/ReporteDiarioGuardia';

const Tab = createBottomTabNavigator();
const SupervisorTab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SolicitudesStack = createStackNavigator();
const SupervisorStack = createStackNavigator(); 

// Nuevo Stack para el flujo de Supervisores
function SupervisorStackScreen({ route }) {
  return (
    <SupervisorStack.Navigator>
      <SupervisorStack.Screen
        name="SupervisorTabs"
        component={SupervisorTabs}
        initialParams={route?.params}
        options={{ headerShown: false }}
      />
      <SupervisorStack.Screen
        name="DetallesOrden"
        component={DetallesOrden}
        options={{ title: 'Detalles del servicio' }}
      />
      <SupervisorStack.Screen
        name="BitacoraForm"
        component={BitacoraForm}
        options={{ title: 'Nueva Bitácora' }}
      />
    </SupervisorStack.Navigator>
  );
}

// Tabs para Guardias
function MainTabs({ route }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Check in') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Solicitudes') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Rutas QR') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Reporte de Incidentes') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Reporte diario') {
            iconName = focused ? 'document' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Check in" 
        component={CheckGuardias}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Rutas QR"
        component={ListarSolicitudesAtendidasScreen}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Reporte de Incidentes"
        component={ReporteIncidentesScreen}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Reporte diario"
        component={ReporteDiarioGuardia}
        initialParams={route.params}
      />
    </Tab.Navigator>
  );
}

// Tabs para Supervisores
function SupervisorTabs({ route }) {
  return (
    <SupervisorTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Guardias') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Reportes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Registro de guardia') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          }
          else if (route.name === 'Unidades') {
            iconName = focused ? 'car-outline' : 'car-sharp';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <SupervisorTab.Screen 
        name="Dashboard" 
        component={DashboardSupervisor}
        initialParams={route.params}
        options={{ title: 'Resumen' }}
      />
      <SupervisorTab.Screen
        name="Reportes"
        component={ReportesScreen}
        initialParams={route.params}
        options={{ title: 'Reportes' }}
      />
      <SupervisorTab.Screen
        name="Registro de guardia"
        component={RegistroGuardia}
        initialParams={route.params}
        options={{ title: 'Guardia' }}
      />
      <SupervisorTab.Screen
        name="Unidades"
        component={RegistroUnidad}
        initialParams={route.params}
        options={{ title: 'Unidades' }}
      />
    </SupervisorTab.Navigator>
  );
}

// Navegación principal
export default function App() {
  return (
    <SafeAreaProvider>
       <StatusBar 
        
        barStyle="dark-content" // Texto blanco
        translucent={false} // Opcional: false para Android
      />
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
          <Stack.Screen
            name="SupervisorTabs"
            component={SupervisorStackScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}