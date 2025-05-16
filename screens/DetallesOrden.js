import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DetallesOrden = ({ route }) => {
  const { orden } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalles completos de la orden</Text>
      
      {/* Muestra toda la información de la orden */}
      {Object.entries(orden).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{key}:</Text>
          <Text style={styles.value}>{JSON.stringify(value, null, 2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    width: 150,
    color: '#555',
  },
  value: {
    flex: 1,
    color: '#666',
  },
});

export default DetallesOrden;