import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardSupervisor = ({ navigation, route }) => {
  const { nombre, numeroEmpleado, datosCompletos } = route.params;
  const id = datosCompletos?.id;
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión. Intente nuevamente.');
    }
  };

  useEffect(() => {
    const fetchOrdenesServicio = async () => {
      console.log('ID del guardia:', id);
      
      if (!id) {
        setError('No se encontró el ID del guardia');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://admin.grupoproeje.com.mx/api/orden-servicio-app?guardia_id=${id}`);
        const result = await response.json();
        
        console.log('Respuesta de la API:', result);

        if (response.ok) {
          const ordenesData = Array.isArray(result) ? result : [result];
          setOrdenes(ordenesData.filter(orden => orden && !orden.eliminado));
        } else {
          setError(result.message || 'Error al cargar las órdenes de servicio');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener órdenes:', err);
        setError('Error de conexión al servidor');
        setLoading(false);
        Alert.alert(
          'Error',
          'No se pudieron cargar las órdenes de servicio. Verifica tu conexión a internet o contacta al administrador.',
          [{ text: 'OK' }]
        );
      }
    };

    fetchOrdenesServicio();
  }, [id]);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    useEffect(() => {}, [id]);
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de cerrar sesión */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenido, {nombre}</Text>
          <Text style={styles.subText}>Número de empleado: {numeroEmpleado}</Text>
        </View>

      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Resumen del día</Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.resumenText}>
          Órdenes de servicio: {ordenes.length}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Órdenes de servicio asignadas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={retryFetch}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : ordenes.length === 0 ? (
        <Text style={styles.emptyText}>No hay órdenes de servicio asignadas</Text>
      ) : (
        <ScrollView style={styles.bitacorasContainer}>
          {ordenes.map((orden) => (
            <View key={orden.id} style={styles.bitacoraCard}>
              <View style={[styles.bitacoraRow, { marginBottom: 10 }]}>
                <Text style={[styles.bitacoraLabel, { color: '#4CAF50' }]}>Estatus:</Text>
                <Text style={[styles.bitacoraValue, { fontWeight: 'bold' }]}>
                  {orden.estatus || 'No especificado'}
                </Text>
              </View>

              <View style={styles.bitacoraRow}>
                <Text style={styles.bitacoraLabel}>Domicilio:</Text>
                <Text style={styles.bitacoraValue}>{orden.domicilio_servicio || 'N/A'}</Text>
              </View>

              <View style={styles.bitacoraRow}>
                <Text style={styles.bitacoraLabel}>Responsable:</Text>
                <Text style={styles.bitacoraValue}>{orden.nombre_responsable_sitio || 'N/A'}</Text>
              </View>

              <View style={styles.bitacoraRow}>
                <Text style={styles.bitacoraLabel}>Teléfono:</Text>
                <Text style={styles.bitacoraValue}>{orden.telefono_responsable_sitio || 'N/A'}</Text>
              </View>

              <View style={styles.bitacoraRow}>
                <Text style={styles.bitacoraLabel}>Inicio:</Text>
                <Text style={styles.bitacoraValue}>{formatDate(orden.fecha_inicio)}</Text>
              </View>

              <View style={styles.bitacoraRow}>
                <Text style={styles.bitacoraLabel}>Fin:</Text>
                <Text style={styles.bitacoraValue}>{formatDate(orden.fecha_fin)}</Text>
              </View>

              {/* Botones para cada orden */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.detailsButton]}
                  onPress={() => navigation.navigate('DetallesOrden', { orden })}
                >
                  <Text style={styles.buttonText}>Ver Detalles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardButton, styles.newBitacoraButton]}
                  onPress={() =>
                    navigation.navigate('BitacoraForm', {
                      nombre: nombre,
                      numeroEmpleado: numeroEmpleado,
                      id: id,
                      datosCompletos: datosCompletos,
                      ordenServicio: orden // Enviamos la orden completa
                    })
                  }
                >
                  <Text style={styles.buttonText}>Nueva Bitácora</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4CAF50',
  },
  resumenText: {
    fontSize: 16,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  bitacorasContainer: {
    flex: 1,
    marginBottom: 15,
  },
  bitacoraCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bitacoraRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bitacoraLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    color: '#555',
    width: 120,
  },
  bitacoraValue: {
    flex: 1,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cardButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  detailsButton: {
    backgroundColor: '#1E3A8A',
  },
  newBitacoraButton: {
    backgroundColor: '#1E3A8A',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default DashboardSupervisor;