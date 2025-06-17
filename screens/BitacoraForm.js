import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  SafeAreaView, 
  Platform, 
  KeyboardAvoidingView, 
  Alert 
} from 'react-native';
import { db } from "../database/firebaseConfig";
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BitacoraForm = ({ navigation, route }) => {
  const { nombre, numeroEmpleado, datosCompletos } = route.params || {};
  const id = datosCompletos?.id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    servicio: '',
    fecha: new Date(),
    zona: '',
    patrulla: '',
    horaInicioRecorrido: new Date(),
    horaFinRecorrido: new Date(),
    kilometraje: '',
    litrosCarga: '',
    guardias: [{
      numeroEmpleado: '',
      nombre: '',
      checkItems: {
        camisa: false,
        pantalon: false,
        corbata: false,
        chaleco: false,
        zapatos: false,
        fornitura: false,
        gas: false,
        esposas: false,
        llave: false,
        tolete: false,
        tocado: false,
        reportes: false,
        peloCorto: false,
        rasurado: false,
        puntualidad: false,
      }
    }],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);
  const [ordenServicioId, setOrdenServicioId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchOrdenServicio = async () => {
      try {
        const response = await fetch(`https://admin.grupoproeje.com.mx/api/orden-servicio-app?guardia_id=${id}`);
        const result = await response.json();
        
        if (response.ok) {
          const ordenesData = Array.isArray(result) ? result : [result];
          const ordenActiva = ordenesData.find(orden => orden && !orden.eliminado);
          if (ordenActiva) {
            setOrdenServicioId(ordenActiva.id);
          } else {
            Alert.alert('Error', 'No se encontró una orden de servicio activa');
          }
        } else {
          Alert.alert('Error', result.message || 'Error al cargar las órdenes de servicio');
        }
      } catch (err) {
        console.error('Error al obtener órdenes:', err);
        Alert.alert('Error', 'Error de conexión al servidor');
      }
    };

    if (id) {
      fetchOrdenServicio();
    }
  }, [id]);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleGuardiaChange = (index, name, value) => {
    const updatedGuardias = [...formData.guardias];
    updatedGuardias[index] = {
      ...updatedGuardias[index],
      [name]: value
    };
    setFormData({
      ...formData,
      guardias: updatedGuardias
    });
    // Limpiar error si existe
    const errorKey = `guardia_${index}_${name}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: null }));
    }
  };

  const handleCheckChange = (guardiaIndex, name, value) => {
    const updatedGuardias = [...formData.guardias];
    updatedGuardias[guardiaIndex] = {
      ...updatedGuardias[guardiaIndex],
      checkItems: {
        ...updatedGuardias[guardiaIndex].checkItems,
        [name]: value
      }
    };
    setFormData({
      ...formData,
      guardias: updatedGuardias
    });
  };

  const addGuardia = () => {
    setFormData({
      ...formData,
      guardias: [
        ...formData.guardias,
        {
          numeroEmpleado: '',
          nombre: '',
          checkItems: {
            camisa: false,
            pantalon: false,
            corbata: false,
            chaleco: false,
            zapatos: false,
            fornitura: false,
            gas: false,
            esposas: false,
            llave: false,
            tolete: false,
            tocado: false,
            reportes: false,
            peloCorto: false,
            rasurado: false,
            puntualidad: false,
          }
        }
      ]
    });
  };

  const removeGuardia = (index) => {
    const updatedGuardias = [...formData.guardias];
    updatedGuardias.splice(index, 1);
    setFormData({
      ...formData,
      guardias: updatedGuardias
    });
    // Limpiar errores relacionados con este guardia
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`guardia_${index}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const buscarGuardia = async (index) => {
    const numeroEmpleado = formData.guardias[index].numeroEmpleado;
    if (!numeroEmpleado) {
      setErrors(prev => ({
        ...prev,
        [`guardia_${index}_numeroEmpleado`]: 'Ingrese un número de empleado'
      }));
      return;
    }

    try {
      setLoading(true);
      const apiUrl = `https://admin.grupoproeje.com.mx/api/guardias-app?numero_empleado=${numeroEmpleado}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      
      if (data.length === 0) {
        setErrors(prev => ({
          ...prev,
          [`guardia_${index}_numeroEmpleado`]: 'No se encontró el guardia'
        }));
        return;
      }

      const guardiaEncontrado = data[0];
      const nombreCompleto = `${guardiaEncontrado.nombre} ${guardiaEncontrado.apellido_p}`;
      
      const updatedGuardias = [...formData.guardias];
      updatedGuardias[index] = {
        ...updatedGuardias[index],
        nombre: nombreCompleto || '',
        datosCompletos: guardiaEncontrado
      };
      
      setFormData({
        ...formData,
        guardias: updatedGuardias
      });

      // Limpiar errores después de éxito
      const newErrors = { ...errors };
      delete newErrors[`guardia_${index}_numeroEmpleado`];
      delete newErrors[`guardia_${index}_nombre`];
      setErrors(newErrors);

    } catch (error) {
      console.error('Error al buscar guardia:', error);
      setErrors(prev => ({
        ...prev,
        [`guardia_${index}_numeroEmpleado`]: 'Error al buscar guardia'
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validar campos obligatorios
    const requiredFields = [
      'servicio', 'zona', 'patrulla', 'kilometraje', 'litrosCarga'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'Este campo es requerido';
        isValid = false;
      }
    });

    // Validar campos numéricos
    const numericFields = ['kilometraje', 'litrosCarga'];
    numericFields.forEach(field => {
      if (formData[field] && isNaN(formData[field])) {
        newErrors[field] = 'Debe ser un número válido';
        isValid = false;
      }
    });

    // Validar que al menos haya un guardia
    if (formData.guardias.length === 0) {
      newErrors.guardias = 'Debe agregar al menos un guardia';
      isValid = false;
    }

    // Validar datos de cada guardia
    formData.guardias.forEach((guardia, index) => {
      if (!guardia.numeroEmpleado || guardia.numeroEmpleado.trim() === '') {
        newErrors[`guardia_${index}_numeroEmpleado`] = 'Número de empleado requerido';
        isValid = false;
      }
      
      if (!guardia.nombre || guardia.nombre.trim() === '') {
        newErrors[`guardia_${index}_nombre`] = 'Debe buscar y seleccionar un guardia';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeForAPI = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const guardarReporteAPI = async (bitacoraData) => {
    try {
      const apiData = {
        guardia_id: datosCompletos?.id, 
        orden_servicio_id: ordenServicioId,
        codigo_servicio: bitacoraData.servicio,
        patrulla: bitacoraData.patrulla,
        zona: bitacoraData.zona,
        kilometraje: parseInt(bitacoraData.kilometraje) || 0,
        litros_carga: parseInt(bitacoraData.litrosCarga) || 0,
        fecha: bitacoraData.fecha.toISOString().split('T')[0],
        hora_inicio_recorrido: formatTimeForAPI(bitacoraData.horaInicioRecorrido),
        hora_fin_recorrido: formatTimeForAPI(bitacoraData.horaFinRecorrido),
        guardias: bitacoraData.guardias.map(guardia => ({
          nombre_guardia: guardia.nombre,
          numero_empleado: guardia.numeroEmpleado,
          items: {
            camisa: guardia.checkItems.camisa,
            chaleco: guardia.checkItems.chaleco,
            corbata: guardia.checkItems.corbata,
            esposas: guardia.checkItems.esposas,
            fornitura: guardia.checkItems.fornitura,
            gas: guardia.checkItems.gas,
            llave: guardia.checkItems.llave,
            pantalon: guardia.checkItems.pantalon,
            peloCorto: guardia.checkItems.peloCorto,
            puntualidad: guardia.checkItems.puntualidad,
            rasurado: guardia.checkItems.rasurado,
            reportes: guardia.checkItems.reportes,
            tocado: guardia.checkItems.tocado,
            tolete: guardia.checkItems.tolete,
            zapatos: guardia.checkItems.zapatos
          }
        }))
      };

      const response = await fetch('https://admin.grupoproeje.com.mx/api/reporte-bitacoras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Respuesta de la API externa:', responseData);
      return true;
    } catch (error) {
      console.error('Error al enviar a la API externa:', error);
      return false;
    }
  };

  const guardarBitacora = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const bitacoraData = {
        ...formData,
        numeroEmpleado: numeroEmpleado,
        nombre: nombre,
        createdAt: serverTimestamp(),
      };

      // Guardar en Firebase (opcional)
      // await addDoc(collection(db, "bitacoras"), bitacoraData);

      // Enviar a la API externa
      const apiSuccess = await guardarReporteAPI(bitacoraData);
      
      if (apiSuccess) {
        Alert.alert('Éxito', 'Bitácora guardada correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Hubo un error al enviar a la API externa');
      }
    } catch (error) {
      console.error('Error al guardar la bitácora:', error);
      Alert.alert('Error', 'Error al guardar la bitácora: ' + error.message);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Nueva Bitácora de Supervisión</Text>

          {/* Sección de información general */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información General</Text>
            
            <View>
              <TextInput
                style={[styles.input, errors.servicio && styles.inputError]}
                placeholder="Servicio"
                value={formData.servicio}
                onChangeText={(text) => handleChange('servicio', text)}
              />
              <ErrorMessage error={errors.servicio} />
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)} 
              style={[styles.input, {justifyContent: 'center'}]}
            >
              <Text>Fecha: {formData.fecha.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData.fecha}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    handleChange('fecha', selectedDate);
                  }
                }}
              />
            )}

            <View>
              <TextInput
                style={[styles.input, errors.zona && styles.inputError]}
                placeholder="Zona"
                value={formData.zona}
                onChangeText={(text) => handleChange('zona', text)}
              />
              <ErrorMessage error={errors.zona} />
            </View>

            <View>
              <TextInput
                style={[styles.input, errors.patrulla && styles.inputError]}
                placeholder="Patrulla"
                value={formData.patrulla}
                onChangeText={(text) => handleChange('patrulla', text)}
              />
              <ErrorMessage error={errors.patrulla} />
            </View>

            <TouchableOpacity 
              onPress={() => setShowHoraInicioPicker(true)} 
              style={[styles.input, {justifyContent: 'center'}]}
            >
              <Text>Hora de inicio de recorrido: {formatTime(formData.horaInicioRecorrido)}</Text>
            </TouchableOpacity>
            
            {showHoraInicioPicker && (
              <DateTimePicker
                value={formData.horaInicioRecorrido}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowHoraInicioPicker(false);
                  if (selectedTime) {
                    handleChange('horaInicioRecorrido', selectedTime);
                  }
                }}
              />
            )}

            <TouchableOpacity 
              onPress={() => setShowHoraFinPicker(true)} 
              style={[styles.input, {justifyContent: 'center'}]}
            >
              <Text>Hora de fin de recorrido: {formatTime(formData.horaFinRecorrido)}</Text>
            </TouchableOpacity>
            
            {showHoraFinPicker && (
              <DateTimePicker
                value={formData.horaFinRecorrido}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowHoraFinPicker(false);
                  if (selectedTime) {
                    handleChange('horaFinRecorrido', selectedTime);
                  }
                }}
              />
            )}

            <View>
              <TextInput
                style={[styles.input, errors.kilometraje && styles.inputError]}
                placeholder="Kilometraje"
                value={formData.kilometraje}
                onChangeText={(text) => handleChange('kilometraje', text)}
                keyboardType="numeric"
              />
              <ErrorMessage error={errors.kilometraje} />
            </View>

            <View>
              <TextInput
                style={[styles.input, errors.litrosCarga && styles.inputError]}
                placeholder="Litros de carga"
                value={formData.litrosCarga}
                onChangeText={(text) => handleChange('litrosCarga', text)}
                keyboardType="numeric"
              />
              <ErrorMessage error={errors.litrosCarga} />
            </View>
          </View>

          {/* Sección de guardias y checklist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist de Guardias</Text>
            
            {errors.guardias && (
              <Text style={styles.errorText}>{errors.guardias}</Text>
            )}
            
            {formData.guardias.map((guardia, index) => (
              <View key={index} style={styles.guardiaContainer}>
                <Text style={styles.guardiaTitle}>Guardia {index + 1}</Text>
                
                <View style={styles.searchContainer}>
                  <View style={{flex: 1}}>
                    <TextInput
                      style={[styles.input, styles.empleadoInput, errors[`guardia_${index}_numeroEmpleado`] && styles.inputError]}
                      placeholder="Número de empleado"
                      value={guardia.numeroEmpleado}
                      onChangeText={(text) => handleGuardiaChange(index, 'numeroEmpleado', text)}
                    />
                    <ErrorMessage error={errors[`guardia_${index}_numeroEmpleado`]} />
                  </View>
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => buscarGuardia(index)}
                  >
                    <Text style={styles.searchButtonText}>Buscar</Text>
                  </TouchableOpacity>
                </View>
                
                <View>
                  <TextInput
                    style={[styles.input, errors[`guardia_${index}_nombre`] && styles.inputError]}
                    placeholder="Nombre del guardia"
                    value={guardia.nombre}
                    onChangeText={(text) => handleGuardiaChange(index, 'nombre', text)}
                    editable={false}
                  />
                  <ErrorMessage error={errors[`guardia_${index}_nombre`]} />
                </View>
                
                <Text style={styles.checklistTitle}>Checklist:</Text>
                {Object.entries(guardia.checkItems).map(([key, value]) => (
                  <View key={key} style={styles.checkItem}>
                    <Text style={styles.checkLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Text>
                    <Switch
                      value={value}
                      onValueChange={(val) => handleCheckChange(index, key, val)}
                    />
                  </View>
                ))}
                
                {formData.guardias.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeGuardia(index)}
                  >
                    <Text style={styles.removeButtonText}>Eliminar Guardia</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addButton} onPress={addGuardia}>
              <Text style={styles.addButtonText}>Agregar Otro Guardia</Text>
            </TouchableOpacity>
          </View> 

          <TouchableOpacity style={styles.saveButton} onPress={guardarBitacora}>
            <Text style={styles.saveButtonText}>Guardar Bitácora</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1E3D',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  guardiaContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  guardiaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkLabel: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  empleadoInput: {
    flex: 1,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 60,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default BitacoraForm;