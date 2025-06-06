import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, SafeAreaView, Platform,KeyboardAvoidingView } from 'react-native';
import { db  } from "../database/firebaseConfig";
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
const BitacoraForm = ({ navigation, route }) => {
  const { nombre, numeroEmpleado  } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    servicio:'',
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
    novedades: [],
    novedadActual: {
      servicio: '',
      incidente: '',
      tiempoExtra: '',
      motivo: '',
      aQuienCubre: '',
      comida: false,
      eventual: false,
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);
  const [ordenServicioId, setOrdenServicioId] = useState(null);
  useEffect(() => {
    console.log("Params recibidos:", route.params); // ¿Aparece idSupervisor aquí?
  }, []);

        //obtención del id de la orden de servicio
  useEffect(() => {
        const fetchOrdenServicio = async () => {
          try {
            const response = await fetch(`https://admin.grupoproeje.com.mx/api/orden-servicio-app?guardia_id=${datosCompletos.id}`);
            const result = await response.json();
            
            console.log('Respuesta de la API de órdenes:', result);
    
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
          } finally {
            setFetchingOrden(false);
          }
        };
    
        fetchOrdenServicio();
  }, [datosCompletos.id]);
  
  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
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

  const handleNovedadChange = (name, value) => {
    setFormData({
      ...formData,
      novedadActual: {
        ...formData.novedadActual,
        [name]: value,
      },
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
  };
/*
  const buscarGuardia = async (index) => {
    const numeroEmpleado = formData.guardias[index].numeroEmpleado;
    if (!numeroEmpleado) return;

    try {
      const guardiaRef = query(collection(db, "guardias"), where("numeroEmpleado", "==", numeroEmpleado));
      const snapshot = await getDocs(guardiaRef);
      
      if (!snapshot.empty) {
        const guardiaData = snapshot.docs[0].data();
        const updatedGuardias = [...formData.guardias];
        updatedGuardias[index] = {
          ...updatedGuardias[index],
          nombre: guardiaData.nombre || ''
        };
        
        setFormData({
          ...formData,
          guardias: updatedGuardias
        });
      } else {
        alert('No se encontró un guardia con ese número de empleado');
      }
    } catch (error) {
      console.error('Error al buscar guardia:', error);
      alert('Error al buscar guardia');
    }
  };*/

  const buscarGuardia = async (index) => {
    const numeroEmpleado = formData.guardias[index].numeroEmpleado;
    if (!numeroEmpleado) return;
  
    try {
      setLoading(true); // Agrega un estado de carga si es necesario
      
      // Consumir la API en lugar de Firestore
      const apiUrl = `https://admin.grupoproeje.com.mx/api/guardias-app?numero_empleado=${numeroEmpleado}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  
      const data = await response.json();
      
      if (data.length === 0) {
        alert('No se encontró un guardia con ese número de empleado');
        return;
      }
  
      const guardiaEncontrado = data[0];
      const nombreCompleto = `${guardiaEncontrado.nombre} ${guardiaEncontrado.apellido_p}`;
      
      // Actualizar el formulario con los datos del guardia
      const updatedGuardias = [...formData.guardias];
      updatedGuardias[index] = {
        ...updatedGuardias[index],
        nombre: nombreCompleto || '',
        datosCompletos: guardiaEncontrado // Opcional: guardar todos los datos si los necesitas después
      };
      
      setFormData({
        ...formData,
        guardias: updatedGuardias
      });
  
    } catch (error) {
      console.error('Error al buscar guardia:', error);
      alert('Error al buscar guardia. Por favor intenta nuevamente.');
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  };

  const addNovedad = () => {
    if (formData.novedadActual.servicio) {
      setFormData({
        ...formData,
        novedades: [...formData.novedades, formData.novedadActual],
        novedadActual: {
          servicio: '',
          incidente: '',
          tiempoExtra: '',
          motivo: '',
          aQuienCubre: '',
          comida: false,
          eventual: false,
        },
      });
    }
  };

const guardarBitacora = async () => {
  try {
    const bitacoraData = {
      ...formData,
      numeroEmpleado: numeroEmpleado,
      nombre: nombre,
      createdAt: serverTimestamp(),
    };

    // Guardar en Firebase (como ya lo tenías)
    const docRef = await addDoc(collection(db, "bitacoras"), bitacoraData);
    await setDoc(doc(db, "bitacorasArchivadas", docRef.id), bitacoraData);

    // Enviar a la API externa
    const apiSuccess = await guardarReporteAPI(bitacoraData);
    
    if (apiSuccess) {
      alert('Bitácora guardada correctamente en ambos sistemas');
    } else {
      alert('Bitácora guardada en Firebase pero hubo un error al enviar a la API externa');
    }
    
    navigation.goBack();
  } catch (error) {
    console.error('Error al guardar la bitácora:', error);
    alert('Error al guardar la bitácora: ' + error.message);
  }
};

  // Función para formatear solo la hora
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
    // Adaptar la estructura de datos para la API externa
    const apiData = {
      guardia_id: numeroEmpleado, 
      orden_servicio_id: ordenServicioId, //orden de servicio que se obtiene en el use effect, mejora posible obtener la orden en general y guardarla en el async storge
      codigo_servicio: bitacoraData.servicio,
      patrulla: bitacoraData.patrulla,
      zona: bitacoraData.zona,
      kilometraje: parseInt(bitacoraData.kilometraje) || 0,
      litros_carga: parseInt(bitacoraData.litrosCarga) || 0,
      fecha: bitacoraData.fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
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
    //feth para mandar la bitacora
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
                <TextInput
                  style={styles.input}
                  placeholder="Servicio"
                  value={formData.servicio}
                  onChangeText={(text) => handleChange('servicio', text)}
                />
                
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
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

                <TextInput
                  style={styles.input}
                  placeholder="Zona"
                  value={formData.zona}
                  onChangeText={(text) => handleChange('zona', text)}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Patrulla"
                  value={formData.patrulla}
                  onChangeText={(text) => handleChange('patrulla', text)}
                />

                <TouchableOpacity onPress={() => setShowHoraInicioPicker(true)} style={styles.input}>
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

                <TouchableOpacity onPress={() => setShowHoraFinPicker(true)} style={styles.input}>
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

                <TextInput
                  style={styles.input}
                  placeholder="Kilometraje"
                  value={formData.kilometraje}
                  onChangeText={(text) => handleChange('kilometraje', text)}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Litros de carga"
                  value={formData.litrosCarga}
                  onChangeText={(text) => handleChange('litrosCarga', text)}
                  keyboardType="numeric"
                />
              </View>

              {/* Sección de guardias y checklist */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Checklist de Guardias</Text>
                
                {formData.guardias.map((guardia, index) => (
                  <View key={index} style={styles.guardiaContainer}>
                    <Text style={styles.guardiaTitle}>Guardia {index + 1}</Text>
                    
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={[styles.input, styles.empleadoInput]}
                        placeholder="Número de empleado"
                        value={guardia.numeroEmpleado}
                        onChangeText={(text) => handleGuardiaChange(index, 'numeroEmpleado', text)}
                        
                      />
                      <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={() => buscarGuardia(index)}
                      >
                        <Text style={styles.searchButtonText}>Buscar</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre del guardia"
                      value={guardia.nombre}
                      onChangeText={(text) => handleGuardiaChange(index, 'nombre', text)}
                      editable={false}
                    />
                    
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
    paddingBlockEnd:20,
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
    marginBottom: 15,
    backgroundColor: '#fff',
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
    marginBottom: 15,
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
  novedadItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 50,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BitacoraForm;