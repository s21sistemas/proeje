import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, SafeAreaView } from 'react-native';
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

  useEffect(() => {
    console.log("Params recibidos:", route.params); // ¿Aparece idSupervisor aquí?
  }, []);
  
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

  const saveBitacora = async () => {
    try {
      const bitacoraData = {
        ...formData,
        numeroEmpleado: numeroEmpleado,
        nombre: nombre,
        createdAt: serverTimestamp(),
        
      };
  
      // Guardar en bitacoras (genera ID automático)
      const docRef = await addDoc(collection(db, "bitacoras"), bitacoraData);
  
      // Opción 1: Guardar en bitacorasArchivadas con mismo ID
      await setDoc(doc(db, "bitacorasArchivadas", docRef.id), bitacoraData);
  
      // Opción alternativa 2: Guardar con ID automático diferente
      // await addDoc(collection(db, "bitacorasArchivadas"), bitacoraData);
  
      alert('Bitácora guardada correctamente');
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

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <TouchableOpacity style={styles.saveButton} onPress={saveBitacora}>
            <Text style={styles.saveButtonText}>Guardar Bitácora</Text>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1E3D',
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