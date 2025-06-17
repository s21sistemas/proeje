import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DetallesOrden = ({ route }) => {
  const { orden } = route.params;

  // Función para formatear las claves de la orden de servicio
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ') 
      .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase()); 
  };

  // Función para renderizar valores anidados
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <View style={styles.nestedContainer}>
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <View key={nestedKey} style={styles.nestedRow}>
              <Text style={styles.nestedLabel}>{formatKey(nestedKey)}:</Text>
              <Text style={styles.nestedValue}>
                {typeof nestedValue === 'object' 
                  ? JSON.stringify(nestedValue, null, 2) 
                  : nestedValue.toString()}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    return <Text style={styles.value}>{value?.toString()}</Text>;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detalles Completos de la Orden</Text>
        {orden.codigo_orden_servicio && (
          <Text style={styles.orderCode}>Código: {orden.codigo_orden_servicio}</Text>
        )}
      </View>
      
      <View style={styles.card}>
        {Object.entries(orden).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{formatKey(key)}:</Text>
            {renderValue(value)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  orderCode: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontWeight: '600',
    width: 150,
    color: '#34495e',
    fontSize: 15,
  },
  value: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 15,
  },
  nestedContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  nestedRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  nestedLabel: {
    fontWeight: '500',
    width: 120,
    color: '#7f8c8d',
    fontSize: 14,
  },
  nestedValue: {
    flex: 1,
    color: '#34495e',
    fontSize: 14,
  },
});

export default DetallesOrden;