import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardSupervisor = ({ navigation, route }) => {
  const { nombre, numeroEmpleado, idSupervisor } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenido, {nombre}</Text>
      <Text style={styles.subText}>Número de empleado: {numeroEmpleado}</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen del día</Text>
        {/* Aquí puedes agregar estadísticas o resúmenes */}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('BitacoraForm', { idSupervisor })}
      >
        <Text style={styles.buttonText}>Nueva Bitácora</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardSupervisor;