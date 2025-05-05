import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions 
} from 'react-native';
import { db } from '../database/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const ReporteSupervisorScreen = ({ route }) => {
  const { numeroEmpleado } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estado para todos los campos del formulario
  const [reporte, setReporte] = useState({
    zona: '',
    turno: 'DÍA',
    fecha: formatDate(new Date()),
    elementoEntrega: '',
    elementoRecibe: '',
    observaciones: Array(10).fill(''),
    consignas: Array(5).fill(''),
    proyeccion: Array(7).fill({ servicio: '', faltas: '', cubre: '' }),
  });

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCurrentDate(selectedDate);
      setReporte(prev => ({ ...prev, fecha: formatDate(selectedDate) }));
    }
  };

  const handleInputChange = (field, value) => {
    setReporte(prev => ({ ...prev, [field]: value }));
  };

  const handleObservacionChange = (index, value) => {
    const newObservaciones = [...reporte.observaciones];
    newObservaciones[index] = value;
    setReporte(prev => ({ ...prev, observaciones: newObservaciones }));
  };

  const handleConsignaChange = (index, value) => {
    const newConsignas = [...reporte.consignas];
    newConsignas[index] = value;
    setReporte(prev => ({ ...prev, consignas: newConsignas }));
  };

  const handleProyeccionChange = (index, field, value) => {
    const newProyeccion = [...reporte.proyeccion];
    newProyeccion[index] = { ...newProyeccion[index], [field]: value };
    setReporte(prev => ({ ...prev, proyeccion: newProyeccion }));
  };

  const guardarReporte = async () => {
    if (!reporte.zona || !reporte.elementoEntrega || !reporte.elementoRecibe) {
      Alert.alert('Campos requeridos', 'Zona, elemento que entrega y elemento que recibe son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reportesSupervisor'), {
        ...reporte,
        supervisorId: numeroEmpleado,
        fechaCreacion: serverTimestamp(),
        tipo: 'diario'
      });
      Alert.alert('Éxito', 'Reporte diario guardado correctamente');
      // Limpiar formulario después de guardar
      setReporte({
        zona: '',
        turno: 'DÍA',
        fecha: formatDate(new Date()),
        elementoEntrega: '',
        elementoRecibe: '',
        observaciones: Array(10).fill(''),
        consignas: Array(5).fill(''),
        proyeccion: Array(7).fill({ servicio: '', faltas: '', cubre: '' }),
      });
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      Alert.alert('Error', 'No se pudo guardar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REPORTE DIARIO</Text>
        <Text style={styles.headerSubtitle}>Supervisor #{numeroEmpleado}</Text>
      </View>

      {/* Sección Zona/Turno/Fecha */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>INFORMACIÓN GENERAL</Text>
        
        <View style={styles.gridContainer}>
          {/* Zona */}
          <View style={styles.gridItem}>
            <Text style={styles.inputLabel}>ZONA</Text>
            <TextInput
              style={styles.input}
              value={reporte.zona}
              onChangeText={(text) => handleInputChange('zona', text)}
              placeholder="Ej: Zona Norte"
            />
          </View>

          {/* Turno */}
          <View style={styles.gridItem}>
            <Text style={styles.inputLabel}>TURNO</Text>
            <View style={styles.radioContainer}>
              <Pressable 
                style={[
                  styles.radioButton, 
                  reporte.turno === 'DÍA' && styles.radioButtonSelected
                ]}
                onPress={() => handleInputChange('turno', 'DÍA')}
              >
                <Text style={[
                  styles.radioText,
                  reporte.turno === 'DÍA' && styles.radioTextSelected
                ]}>
                  DÍA
                </Text>
              </Pressable>
              <Pressable 
                style={[
                  styles.radioButton, 
                  reporte.turno === 'NOCHE' && styles.radioButtonSelected
                ]}
                onPress={() => handleInputChange('turno', 'NOCHE')}
              >
                <Text style={[
                  styles.radioText,
                  reporte.turno === 'NOCHE' && styles.radioTextSelected
                ]}>
                  NOCHE
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Fecha */}
          <View style={styles.gridItem}>
            <Text style={styles.inputLabel}>FECHA</Text>
            <Pressable 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{reporte.fecha}</Text>
              <Ionicons name="calendar" size={20} color="#555" />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                locale="es-ES"
              />
            )}
          </View>
        </View>
      </View>

      {/* Sección Entrega/Recibe Turno */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ENTREGA Y RECEPCIÓN DE TURNO</Text>
        
        <View style={styles.gridContainer}>
          <View style={[styles.gridItem, { flex: 1 }]}>
            <Text style={styles.inputLabel}>ELEMENTO QUE ENTREGA</Text>
            <TextInput
              style={styles.input}
              value={reporte.elementoEntrega}
              onChangeText={(text) => handleInputChange('elementoEntrega', text)}
              placeholder="Nombre completo"
            />
          </View>
          
          <View style={[styles.gridItem, { flex: 1 }]}>
            <Text style={styles.inputLabel}>ELEMENTO QUE RECIBE</Text>
            <TextInput
              style={styles.input}
              value={reporte.elementoRecibe}
              onChangeText={(text) => handleInputChange('elementoRecibe', text)}
              placeholder="Nombre completo"
            />
          </View>
        </View>
      </View>

      {/* Sección Observaciones */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>OBSERVACIONES Y NOVEDADES</Text>
        
        <View style={styles.observationsContainer}>
          {reporte.observaciones.map((obs, index) => (
            <View key={`obs-${index}`} style={styles.observationRow}>
              <View style={styles.timeCell}>
                <Text style={styles.timeLabel}>{`${index + 1}.`}</Text>
              </View>
              <TextInput
                style={styles.observationInput}
                value={obs}
                onChangeText={(text) => handleObservacionChange(index, text)}
                placeholder={`Ingrese observación ${index + 1}`}
                multiline
              />
            </View>
          ))}
        </View>
      </View>

      {/* Sección Consignas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CONSIGNAS ESPECIALES</Text>
        
        {reporte.consignas.map((consigna, index) => (
          <View key={`consigna-${index}`} style={styles.consignaContainer}>
            <Text style={styles.consignaNumber}>{index + 1}.</Text>
            <TextInput
              style={styles.consignaInput}
              value={consigna}
              onChangeText={(text) => handleConsignaChange(index, text)}
              placeholder={`Consigna ${index + 1}`}
              multiline
            />
          </View>
        ))}
      </View>

      {/* Sección Proyección */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PROYECCIÓN DE PERSONAL</Text>
        
        <View style={styles.projectionHeader}>
          <Text style={styles.projectionHeaderCell}>SERVICIO</Text>
          <Text style={styles.projectionHeaderCell}>AUSENCIAS</Text>
          <Text style={styles.projectionHeaderCell}>CUBRE</Text>
        </View>
        
        {reporte.proyeccion.map((item, index) => (
          <View key={`proy-${index}`} style={styles.projectionRow}>
            <TextInput
              style={styles.projectionInput}
              value={item.servicio}
              onChangeText={(text) => handleProyeccionChange(index, 'servicio', text)}
              placeholder={`Servicio ${index + 1}`}
            />
            <TextInput
              style={styles.projectionInput}
              value={item.faltas}
              onChangeText={(text) => handleProyeccionChange(index, 'faltas', text)}
              placeholder={`Ausencia ${index + 1}`}
            />
            <TextInput
              style={styles.projectionInput}
              value={item.cubre}
              onChangeText={(text) => handleProyeccionChange(index, 'cubre', text)}
              placeholder={`Cubre ${index + 1}`}
            />
          </View>
        ))}
      </View>

      {/* Botón de guardar */}
      <Pressable 
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.saveButtonPressed,
          loading && styles.saveButtonDisabled
        ]}
        onPress={guardarReporte}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="save" size={20} color="#fff" style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>GUARDAR REPORTE</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#E0E7FF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  gridItem: {
    width: width > 500 ? '30%' : '48%',
    marginBottom: 15,
  },
  inputLabel: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  radioButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
    backgroundColor: '#F3F4F6',
  },
  radioButtonSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  radioText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  radioTextSelected: {
    color: '#fff',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
  },
  observationsContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  observationRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  timeCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  timeLabel: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 12,
  },
  observationInput: {
    flex: 1,
    minHeight: 50,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  consignaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  consignaNumber: {
    width: 25,
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 14,
  },
  consignaInput: {
    flex: 1,
    minHeight: 50,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
  },
  projectionHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectionInput: {
    flex: 1,
    marginHorizontal: 3,
    height: 45,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    color: '#111827',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  saveIcon: {
    marginRight: 8,
  },
});

export default ReporteSupervisorScreen;