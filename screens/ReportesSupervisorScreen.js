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
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { db } from '../database/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const ReporteSupervisorScreen = ({ route }) => {
  const { nombre, numeroEmpleado } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState({
    observaciones: null,
    consignas: null
  });
  
  const [reporte, setReporte] = useState({
    zona: '',
    turno: 'DÍA',
    fecha: formatDate(new Date()),
    elementoEntrega: '',
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
    proyeccion: [{ id: Date.now(), servicio: '', faltas: '', cubre: '' }],
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
        setReporte(prev => ({
          ...prev,
          observaciones: prev.observaciones.map(obs => 
            obs.id === id ? { ...obs, hora: timeString } : obs
          )
        }));
      } else if (type === 'consignas') {
        setReporte(prev => ({
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
    setReporte(prev => ({
      ...prev,
      observaciones: [...prev.observaciones, { 
        id: Date.now(), 
        texto: '',
        hora: formatTime(new Date())
      }]
    }));
  };

  const eliminarObservacion = (id) => {
    if (reporte.observaciones.length > 1) {
      setReporte(prev => ({
        ...prev,
        observaciones: prev.observaciones.filter(obs => obs.id !== id)
      }));
    }
  };

  const handleObservacionChange = (id, texto) => {
    setReporte(prev => ({
      ...prev,
      observaciones: prev.observaciones.map(obs => 
        obs.id === id ? { ...obs, texto } : obs
      )
    }));
  };

  // Funciones para Consignas
  const agregarConsigna = () => {
    setReporte(prev => ({
      ...prev,
      consignas: [...prev.consignas, { 
        id: Date.now(), 
        texto: '',
        hora: formatTime(new Date())
      }]
    }));
  };

  const eliminarConsigna = (id) => {
    if (reporte.consignas.length > 1) {
      setReporte(prev => ({
        ...prev,
        consignas: prev.consignas.filter(consigna => consigna.id !== id)
      }));
    }
  };

  const handleConsignaChange = (id, texto) => {
    setReporte(prev => ({
      ...prev,
      consignas: prev.consignas.map(consigna => 
        consigna.id === id ? { ...consigna, texto } : consigna
      )
    }));
  };

  // Funciones para Proyección
  const agregarProyeccion = () => {
    setReporte(prev => ({
      ...prev,
      proyeccion: [...prev.proyeccion, { id: Date.now(), servicio: '', faltas: '', cubre: '' }]
    }));
  };

  const eliminarProyeccion = (id) => {
    if (reporte.proyeccion.length > 1) {
      setReporte(prev => ({
        ...prev,
        proyeccion: prev.proyeccion.filter(proy => proy.id !== id)
      }));
    }
  };

  const handleProyeccionChange = (id, field, value) => {
    setReporte(prev => ({
      ...prev,
      proyeccion: prev.proyeccion.map(proy => 
        proy.id === id ? { ...proy, [field]: value } : proy
      )
    }));
  };

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

  const guardarReporte = async () => {
    if (!reporte.zona || !reporte.elementoEntrega || !reporte.elementoRecibe) {
      Alert.alert('Campos requeridos', 'Zona, elemento que entrega y elemento que recibe son obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para Firestore (eliminar los ids)
      const datosParaGuardar = {
        ...reporte,
        observaciones: reporte.observaciones.map(obs => ({
          texto: obs.texto,
          hora: obs.hora
        })),
        consignas: reporte.consignas.map(consigna => ({
          texto: consigna.texto,
          hora: consigna.hora
        })),
        proyeccion: reporte.proyeccion.map(proy => ({
          servicio: proy.servicio,
          faltas: proy.faltas,
          cubre: proy.cubre
        })),
        supervisorId: numeroEmpleado,
        fechaCreacion: serverTimestamp(),
        tipo: 'diario'
      };

      await addDoc(collection(db, 'reportesSupervisor'), datosParaGuardar);
      Alert.alert('Éxito', 'Reporte diario guardado correctamente');
      
      // Resetear el formulario
      setReporte({
        zona: '',
        turno: 'DÍA',
        fecha: formatDate(new Date()),
        elementoEntrega: '',
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
        proyeccion: [{ id: Date.now(), servicio: '', faltas: '', cubre: '' }],
      });
    } catch (error) {
      console.error('Error al guardar reporte:', error);
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
                <Text style={styles.profileName}>Supervisor: {nombre}</Text>
                <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
              </View>
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
                <View style={styles.gridItem2}>
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
                    <Pressable 
                      style={[
                        styles.radioButton, 
                        reporte.turno === '24H' && styles.radioButtonSelected
                      ]}
                      onPress={() => handleInputChange('turno', '24H')}
                    >
                      <Text style={[
                        styles.radioText,
                        reporte.turno === '24H' && styles.radioTextSelected
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
                    value={reporte.elementoEntrega}
                    onChangeText={(text) => handleInputChange('elementoEntrega', text)}
                    placeholder="Nombre completo"
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.entregaItem}>
                  <Text style={styles.inputLabel}>ELEMENTO QUE RECIBE</Text>
                  <TextInput
                    style={styles.input}
                    value={reporte.elementoRecibe}
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
              
              {reporte.observaciones.map((obs) => (
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
                    
                    {reporte.observaciones.length > 1 && (
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
              
              {reporte.consignas.map((consigna) => (
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
                    
                    {reporte.consignas.length > 1 && (
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

            {/* Sección Proyección de Personal */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>PROYECCIÓN DE PERSONAL</Text>
              <Text style={styles.proyeccionSubtitle}>Registre la proyección de personal</Text>
              
              {reporte.proyeccion.map((item) => (
                <View key={`proy-${item.id}`} style={styles.proyeccionCard}>
                  <View style={styles.proyeccionHeader}>
                    <Text style={styles.proyeccionNumber}>Registro</Text>
                    {reporte.proyeccion.length > 1 && (
                      <Pressable 
                        style={styles.deleteButton}
                        onPress={() => eliminarProyeccion(item.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#dc2626" />
                      </Pressable>
                    )}
                  </View>
                  
                  <View style={styles.proyeccionInputGroup}>
                    <Text style={styles.proyeccionLabel}>Servicio</Text>
                    <TextInput
                      style={styles.proyeccionInput}
                      value={item.servicio}
                      onChangeText={(text) => handleProyeccionChange(item.id, 'servicio', text)}
                      placeholder="Nombre del servicio"
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.proyeccionInputGroup}>
                    <Text style={styles.proyeccionLabel}>Ausencias</Text>
                    <TextInput
                      style={styles.proyeccionInput}
                      value={item.faltas}
                      onChangeText={(text) => handleProyeccionChange(item.id, 'faltas', text)}
                      placeholder="Nombre de quien esta ausente"
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.proyeccionInputGroup}>
                    <Text style={styles.proyeccionLabel}>Cubre</Text>
                    <TextInput
                      style={styles.proyeccionInput}
                      value={item.cubre}
                      onChangeText={(text) => handleProyeccionChange(item.id, 'cubre', text)}
                      placeholder="Nombre de quien cubre"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              ))}
              
              <Pressable 
                style={styles.addButton}
                onPress={agregarProyeccion}
              >
                <Ionicons name="add-circle" size={22} color="#1E3A8A" />
                <Text style={styles.addButtonText}>Agregar otro registro</Text>
              </Pressable>
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
  formGroup: {
    marginBottom: 15,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  proyeccionCard: {
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
  proyeccionHeader: {
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
  proyeccionNumber: {
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
  proyeccionInputGroup: {
    marginBottom: 12,
  },
  proyeccionLabel: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  proyeccionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#111827',
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

export default ReporteSupervisorScreen;