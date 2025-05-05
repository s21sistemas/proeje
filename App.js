import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import CheckGuardias from './screens/checkGuardias';
import ListarSolicitudesScreen from './screens/ListarSolicitudesScreen';
import DetallesSolicitudScreen from './screens/DetallesSolicitudScreen';
import ResponderSolicitudScreen from './screens/ResponderSolicitudScreen';
import ListarSolicitudesAtendidasScreen from './screens/ListarSolicitudesAtendidasScreen';
import ReporteIncidentesScreen from './screens/ReporteIncidentesScreen';
import DashboardSupervisor from './screens/DashboardSupervisor'; 
import ReportesScreen from './screens/ReportesSupervisorScreen';
import BitacoraForm from './screens/BitacoraForm'; // Asegúrate de importar el componente

const Tab = createBottomTabNavigator();
const SupervisorTab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SolicitudesStack = createStackNavigator();
const SupervisorStack = createStackNavigator(); // Nuevo Stack para Supervisores


// Nuevo Stack para el flujo de Supervisores
function SupervisorStackScreen({ route }) {
  return (
    <SupervisorStack.Navigator>
      <SupervisorStack.Screen
        name="SupervisorTabs"
        component={SupervisorTabs}
        initialParams={route?.params} // 👈 asegúrate de pasar los params
        options={{ headerShown: false }}
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
          } else if (route.name === 'Escanear QR') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Reporte de Incidentes') {
            iconName = focused ? 'warning' : 'warning-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#009BFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Check in" 
        component={CheckGuardias}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Escanear QR"
        component={ListarSolicitudesAtendidasScreen}
        initialParams={route.params}
      />
      <Tab.Screen
        name="Reporte de Incidentes"
        component={ReporteIncidentesScreen}
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
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50', // Verde para diferenciar
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardSupervisor}
        initialParams={route.params}
        options={{ title: 'Resumen' }}
      />
      <Tab.Screen
        name="Reportes"
        component={ReportesScreen}
        initialParams={route.params}
        options={{ title: 'Reportes' }}
      />
    </SupervisorTab.Navigator>
  );
}

// Navegación principal
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
        <Stack.Screen
          name="SupervisorTabs" // Cambiado de SupervisorTabs a SupervisorFlow
          component={SupervisorStackScreen} // Usamos el nuevo Stack de supervisores
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}