import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Pressable, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const ReporteDiarioGuardia = ({ route }) => {
  const { nombre, numeroEmpleado } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState({
    observaciones: null,
    consignas: null
  });
  
  const [reportData, setReportData] = useState({
    puntoVigilancia: '',
    turno: 'DIA',
    fecha: formatDate(new Date()),
    elementoEntrega: nombre,
    elementoRecibe: '',
    observaciones: [{ 
      id: Date.now(), 
      texto: '',
      hora: formatTime(new Date()) 
    }],
    consignas: [{ 
      id: Date.now(), 
      texto: '',
      hora: formatTime(new Date()) 
    }],
    equipo: {
      chaleco: false,
      esposas: false,
      gas: false,
      fornitura: false,
      celular: false,
      radio: false,
      impermeable: false,
      linterna: false,
      baston: false
    },
    supervisor: ''
  });

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Funciones para manejar el cambio de hora
  const handleTimeChange = (type, id, event, selectedTime) => {
    setShowTimePicker(prev => ({ ...prev, [type]: null }));
    
    if (selectedTime) {
      const timeString = formatTime(selectedTime);
      
      if (type === 'observaciones') {
        setReportData(prev => ({
          ...prev,
          observaciones: prev.observaciones.map(obs => 
            obs.id === id ? { ...obs, hora: timeString } : obs
          )
        }));
      } else if (type === 'consignas') {
        setReportData(prev => ({
          ...prev,
          consignas: prev.consignas.map(consigna => 
            consigna.id === id ? { ...consigna, hora: timeString } : consigna
          )
        }));
      }
    }
  };

  // Funciones para Observaciones
  const agregarObservacion = () => {
    setReportData(prev => ({
      ...prev,
      observaciones: [...prev.observaciones, { 
        id: Date.now(), 
        texto: '',
        hora: formatTime(new Date())
      }]
    }));
  };

  const eliminarObservacion = (id) => {
    if (reportData.observaciones.length > 1) {
      setReportData(prev => ({
        ...prev,
        observaciones: prev.observaciones.filter(obs => obs.id !== id)
      }));
    }
  };

  const handleObservacionChange = (id, texto) => {
    setReportData(prev => ({
      ...prev,
      observaciones: prev.observaciones.map(obs => 
        obs.id === id ? { ...obs, texto } : obs
      )
    }));
  };

  // Funciones para Consignas
  const agregarConsigna = () => {
    setReportData(prev => ({
      ...prev,
      consignas: [...prev.consignas, { 
        id: Date.now(), 
        texto: '',
        hora: formatTime(new Date())
      }]
    }));
  };

  const eliminarConsigna = (id) => {
    if (reportData.consignas.length > 1) {
      setReportData(prev => ({
        ...prev,
        consignas: prev.consignas.filter(consigna => consigna.id !== id)
      }));
    }
  };

  const handleConsignaChange = (id, texto) => {
    setReportData(prev => ({
      ...prev,
      consignas: prev.consignas.map(consigna => 
        consigna.id === id ? { ...consigna, texto } : consigna
      )
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCurrentDate(selectedDate);
      setReportData(prev => ({ ...prev, fecha: formatDate(selectedDate) }));
    }
  };

  const handleInputChange = (field, value) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const handleEquipoChange = (item, value) => {
    setReportData(prev => ({
      ...prev,
      equipo: {
        ...prev.equipo,
        [item]: value
      }
    }));
  };

  const submitReport = async () => {
    try {
      if (!reportData.puntoVigilancia || !reportData.elementoRecibe) {
        Alert.alert('Campos requeridos', 'Punto de vigilancia y elemento que recibe son obligatorios');
        return;
      }

      setLoading(true);
      
      const datosParaGuardar = {
        ...reportData,
        observaciones: reportData.observaciones.map(obs => ({
          texto: obs.texto,
          hora: obs.hora
        })),
        consignas: reportData.consignas.map(consigna => ({
          texto: consigna.texto,
          hora: consigna.hora
        })),
        empleadoId: numeroEmpleado,
        nombreEmpleado: nombre,
        fechaCreacion: serverTimestamp(),
        tipo: 'diario'
      };

      await addDoc(collection(db, 'reportesGuardia'), datosParaGuardar);
      Alert.alert('Éxito', 'Reporte diario guardado correctamente');
      
      // Resetear el formulario
      setReportData({
        puntoVigilancia: '',
        turno: 'DIA',
        fecha: formatDate(new Date()),
        elementoEntrega: nombre,
        elementoRecibe: '',
        observaciones: [{ 
          id: Date.now(), 
          texto: '',
          hora: formatTime(new Date())
        }],
        consignas: [{ 
          id: Date.now(), 
          texto: '',
          hora: formatTime(new Date())
        }],
        equipo: {
          chaleco: false,
          esposas: false,
          gas: false,
          fornitura: false,
          celular: false,
          radio: false,
          impermeable: false,
          linterna: false,
          baston: false
        },
        supervisor: ''
      });
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'No se pudo guardar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoiding}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Encabezado */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Reporte diario</Text>
          <Text style={styles.subheader}></Text>
        </View>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Guardia: {nombre}</Text>
            <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
          </View>
        </View>

        {/* Sección Información General */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACIÓN GENERAL</Text>
          
          <View style={styles.gridContainer}>
            {/* Punto de Vigilancia */}
            <View style={styles.gridItem}>
              <Text style={styles.inputLabel}>PUNTO DE VIGILANCIA</Text>
              <TextInput
                style={styles.input}
                value={reportData.puntoVigilancia}
                onChangeText={(text) => handleInputChange('puntoVigilancia', text)}
                placeholder="Ej: Torre Principal"
                placeholderTextColor="#999"
              />
            </View>
            
            {/* Fecha */}
            <View style={styles.gridItem}>
              <Text style={styles.inputLabel}>FECHA</Text>
              <Pressable 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{reportData.fecha}</Text>
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
            
            <View style={styles.gridItem2}>
              <Text style={styles.inputLabel}>TURNO</Text>
              <View style={styles.radioContainer}>
                <Pressable 
                  style={[
                    styles.radioButton, 
                    reportData.turno === 'DIA' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('turno', 'DIA')}
                >
                  <Text style={[
                    styles.radioText,
                    reportData.turno === 'DIA' && styles.radioTextSelected
                  ]}>
                    DÍA
                  </Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.radioButton, 
                    reportData.turno === 'NOCHE' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('turno', 'NOCHE')}
                >
                  <Text style={[
                    styles.radioText,
                    reportData.turno === 'NOCHE' && styles.radioTextSelected
                  ]}>
                    NOCHE
                  </Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.radioButton, 
                    reportData.turno === '24H' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('turno', '24H')}
                >
                  <Text style={[
                    styles.radioText,
                    reportData.turno === '24H' && styles.radioTextSelected
                  ]}>
                    24H
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Sección Entrega/Recibe Turno */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ENTREGA Y RECEPCIÓN DE TURNO</Text>
          
          <View style={styles.entregaContainer}>
            <View style={styles.entregaItem}>
              <Text style={styles.inputLabel}>ELEMENTO QUE ENTREGA</Text>
              <TextInput
                style={styles.input}
                value={reportData.elementoEntrega}
                onChangeText={(text) => handleInputChange('elementoEntrega', text)}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>
            
            <View style={styles.entregaItem}>
              <Text style={styles.inputLabel}>ELEMENTO QUE RECIBE</Text>
              <TextInput
                style={styles.input}
                value={reportData.elementoRecibe}
                onChangeText={(text) => handleInputChange('elementoRecibe', text)}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Sección Observaciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>OBSERVACIONES Y NOVEDADES</Text>
          <Text style={styles.observacionesSubtitle}>Registre las principales observaciones del turno:</Text>
          
          {reportData.observaciones.map((obs) => (
            <View key={`obs-${obs.id}`} style={styles.observacionCard}>
              <View style={styles.observacionHeader}>
                <View style={styles.observacionTitleContainer}>
                  <Text style={styles.observacionNumber}>Observación</Text>
                  <Pressable 
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker(prev => ({ ...prev, observaciones: obs.id }))}
                  >
                    <Ionicons name="time-outline" size={18} color="#1E3A8A" />
                    <Text style={styles.timeText}>{obs.hora}</Text>
                  </Pressable>
                </View>
                
                {reportData.observaciones.length > 1 && (
                  <Pressable 
                    style={styles.deleteButton}
                    onPress={() => eliminarObservacion(obs.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  </Pressable>
                )}
              </View>
              
              {showTimePicker.observaciones === obs.id && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, time) => handleTimeChange('observaciones', obs.id, event, time)}
                />
              )}
              
              <TextInput
                style={styles.multilineInput}
                value={obs.texto}
                onChangeText={(text) => handleObservacionChange(obs.id, text)}
                placeholder="Describa la observación"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          ))}
          
          <Pressable 
            style={styles.addButton}
            onPress={agregarObservacion}
          >
            <Ionicons name="add-circle" size={22} color="#1E3A8A" />
            <Text style={styles.addButtonText}>Agregar observación</Text>
          </Pressable>
        </View>

        {/* Sección Consignas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CONSIGNAS ESPECIALES</Text>
          <Text style={styles.consignasSubtitle}>Registre las consignas importantes para el siguiente turno:</Text>
          
          {reportData.consignas.map((consigna) => (
            <View key={`consigna-${consigna.id}`} style={styles.consignaCard}>
              <View style={styles.consignaHeader}>
                <View style={styles.consignaTitleContainer}>
                  <Text style={styles.consignaNumber}>Consigna</Text>
                  <Pressable 
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker(prev => ({ ...prev, consignas: consigna.id }))}
                  >
                    <Ionicons name="time-outline" size={18} color="#1E3A8A" />
                    <Text style={styles.timeText}>{consigna.hora}</Text>
                  </Pressable>
                </View>
                
                {reportData.consignas.length > 1 && (
                  <Pressable 
                    style={styles.deleteButton}
                    onPress={() => eliminarConsigna(consigna.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  </Pressable>
                )}
              </View>
              
              {showTimePicker.consignas === consigna.id && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, time) => handleTimeChange('consignas', consigna.id, event, time)}
                />
              )}
              
              <TextInput
                style={styles.multilineInput}
                value={consigna.texto}
                onChangeText={(text) => handleConsignaChange(consigna.id, text)}
                placeholder="Describa la consigna"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          ))}
          
          <Pressable 
            style={styles.addButton}
            onPress={agregarConsigna}
          >
            <Ionicons name="add-circle" size={22} color="#1E3A8A" />
            <Text style={styles.addButtonText}>Agregar consigna</Text>
          </Pressable>
        </View>

        {/* Sección Equipo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RESGUARDO DE EQUIPO</Text>
          <Text style={styles.proyeccionSubtitle}>Marque los elementos que están completos:</Text>
          
          <View style={styles.equipoGrid}>
            {Object.entries(reportData.equipo).map(([item, checked]) => (
              <Pressable
                key={item}
                style={[
                  styles.equipoItem,
                  checked && styles.equipoItemChecked
                ]}
                onPress={() => handleEquipoChange(item, !checked)}
              >
                <Text style={styles.equipoText}>
                  {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                </Text>
                {checked && <Ionicons name="checkmark" size={18} color="#4CAF50" />}
              </Pressable>
            ))}
          </View>
          
          <View style={styles.entregaItem}>
            <Text style={styles.inputLabel}>SUPERVISOR</Text>
            <TextInput
              style={styles.input}
              value={reportData.supervisor}
              onChangeText={(text) => handleInputChange('supervisor', text)}
              placeholder="Nombre del supervisor"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Botón de guardar */}
        <Pressable 
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            loading && styles.saveButtonDisabled
          ]}
          onPress={submitReport}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  profileHeader: {
    marginBottom: 25,
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 3,
  },
  profileBadge: {
    fontSize: 14,
    color: '#A0B9D9',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  headerContainer: {
    marginBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    textAlign: 'left',
    color: '#555',
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
  gridItem2: {
    width: width > 500 ? '50%' : '78%',
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
    justifyContent: 'left',
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
    width: '30%',
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
  entregaContainer: {
    marginBottom: 5,
  },
  entregaItem: {
    marginBottom: 15,
  },
  observacionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 15,
    marginBottom: 15,
  },
  consignaCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 15,
    marginBottom: 15,
  },
  observacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consignaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  observacionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consignaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  observacionNumber: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  consignaNumber: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButton: {
    padding: 5,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    padding: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  timeText: {
    color: '#1E3A8A',
    fontSize: 12,
    marginLeft: 5,
  },
  multilineInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  equipoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  equipoItem: {
    width: '30%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
  },
  equipoItemChecked: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  equipoText: {
    color: '#111827',
    fontSize: 12,
    marginRight: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginTop: 5,
  },
  addButtonText: {
    color: '#1E3A8A',
    fontWeight: '600',
    marginLeft: 8,
  },
  observacionesSubtitle: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  consignasSubtitle: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  proyeccionSubtitle: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 15,
    fontStyle: 'italic',
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

export default ReporteDiarioGuardia;