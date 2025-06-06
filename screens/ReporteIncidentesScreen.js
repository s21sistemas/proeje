import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator, SafeAreaView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

export default function ReporteIncidentesScreen({ route }) {
  // Parámetros de ruta con valores por defecto
  const { nombre, numeroEmpleado, datosCompletos } = route.params;

  // Estados del formulario
  const [incidente, setIncidente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacionIncidente, setUbicacionIncidente] = useState("");
  const [causa, setCausa] = useState("");
  const [personaReporta, setPersonaReporta] = useState("");
  const [accionesTomadas, setAccionesTomadas] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [fotos, setFotos] = useState([]);
  const [fotosConMarca, setFotosConMarca] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);
  const [hora, setHora] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [turno, setTurno] = useState("DÍA");
  const [puntoVigilancia, setPuntoVigilancia] = useState("");
  const [loading, setLoading] = useState(false);
  const [permisosListos, setPermisosListos] = useState(false);
  const [direccionCompleta, setDireccionCompleta] = useState("");
  const viewShotRef = useRef(null);
  const [ordenServicioId, setOrdenServicioId] = useState(null);
  const [fetchingOrden, setFetchingOrden] = useState(true);
  const [fotosConfirmadas, setFotosConfirmadas] = useState([]);

  const [formularioValido, setFormularioValido] = useState(false);
  // Tipos de incidentes predefinidos
  const tiposIncidentes = [
    "Conato de incendio",
    "Accidente laboral",
    "Intrusión",
    "Robo",
    "Vandalismo",
    "Falla eléctrica",
    "Fuga de agua",
    "Otro"
  ];
  //validación de permisos
  useEffect(() => {
    const verificarPermisos = async () => {
      try {
        // Verificar permisos existentes primero
        const [cameraStatus, locationStatus, mediaStatus] = await Promise.all([
          ImagePicker.getCameraPermissionsAsync(),
          Location.getForegroundPermissionsAsync(),
          MediaLibrary.getPermissionsAsync()
        ]);

        // Si ya tiene permisos, continuar
        if (cameraStatus.granted && locationStatus.granted && mediaStatus.granted) {
          setPermisosListos(true);
          return;
        }

        // Si no tiene permisos, solicitarlos
        const [
          newCameraStatus, 
          newLocationStatus, 
          newMediaStatus
        ] = await Promise.all([
          ImagePicker.requestCameraPermissionsAsync(),
          Location.requestForegroundPermissionsAsync(),
          MediaLibrary.requestPermissionsAsync()
        ]);

        if (
          newCameraStatus.granted && 
          newLocationStatus.granted && 
          newMediaStatus.granted
        ) {
          setPermisosListos(true);
        } else {
          Alert.alert(
            'Permisos requeridos',
            'La aplicación necesita permisos de cámara, ubicación y almacenamiento para funcionar correctamente',
            [
              {
                text: 'Aceptar',
                onPress: () => setPermisosListos(false)
              }
            ]
          );
        }
      } catch (error) {
        console.error("Error en permisos:", error);
        setPermisosListos(true); // Continuar aunque falle algún permiso
      }
    };

    verificarPermisos();
  }, []);

// validación del formulario
  useEffect(() => {
  const validarFormulario = () => {
    const camposObligatorios = [
      puntoVigilancia,
      incidente,
      descripcion,
      ubicacionIncidente
    ];
    
    const todosLlenos = camposObligatorios.every(campo => campo && campo.trim() !== '');
    setFormularioValido(todosLlenos);
  };

  validarFormulario();
}, [puntoVigilancia, incidente, descripcion, ubicacionIncidente]);

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

const obtenerDireccionCompleta = async () => {
  try {
    setLoading(true);
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000
    });
    setUbicacion(location.coords);
    
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
    
    if (address.length > 0) {
      const dir = [
        address[0].street,
        address[0].streetNumber ? `#${address[0].streetNumber}` : '',
        address[0].subregion,
        address[0].city,
        address[0].region,
        address[0].country
      ].filter(Boolean).join(', ');
      
      setDireccionCompleta(dir);
      setUbicacionIncidente(dir); // Autocompletar el campo de ubicación
    } else {
      Alert.alert("Información", "No se pudo determinar la dirección exacta");
    }
    
    const ahora = new Date();
    setHora(ahora.toLocaleTimeString('es-MX'));
    setFechaHora(ahora.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
  } catch (error) {
    console.error("Error obteniendo dirección:", error);
    Alert.alert("Error", "No se pudo obtener la ubicación. Verifica que tengas activado el GPS");
  } finally {
    setLoading(false);
  }
};

  const tomarFoto = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFotos([...fotos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo acceder a la cámara");
    } finally {
      setLoading(false);
    }
  };

const capturarConMarcaAgua = async (fotoUri, index) => {
  try {
    setLoading(true);
    const uri = await viewShotRef.current.capture();
    
    // Agregar a fotos con marca
    const nuevasFotosConMarca = [...fotosConMarca];
    nuevasFotosConMarca[index] = uri;
    setFotosConMarca(nuevasFotosConMarca);
    
    // Marcar como confirmada
    setFotosConfirmadas([...fotosConfirmadas, index]);
    
    // Guardar info de debug

    
    // Opcional: guardar en galería
    await MediaLibrary.saveToLibraryAsync(uri);
    
    // Mostrar feedback visual
    Alert.alert(
      "Foto confirmada",
      "La foto ha sido guardada con marca de agua y datos",
      [{ text: "OK" }]
    );
    
  } catch (error) {
    Alert.alert("Error", "No se pudo procesar la foto");
  } finally {
    setLoading(false);
  }
};

  const subirImagenFirebase = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileName = `incidentes/${Date.now()}-${Math.round(Math.random() * 1000)}.jpg`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }
  };

  const enviarReporte = async () => {

  const camposObligatorios = {
    "Punto de vigilancia": puntoVigilancia,
    "Tipo de incidente": incidente,
    "Descripción": descripcion,
    "Ubicación": ubicacionIncidente
  };

  const camposFaltantes = Object.entries(camposObligatorios)
    .filter(([_, valor]) => !valor || valor.trim() === '')
    .map(([nombre]) => nombre);

  if (camposFaltantes.length > 0) {
    Alert.alert(
      "Campos incompletos",
      `Por favor complete los siguientes campos obligatorios:\n\n${camposFaltantes.join('\n')}`
    );
    return;
  }

  if (fotos.length === 0) {
    Alert.alert(
      "Evidencia requerida",
      "Debe agregar al menos una foto como evidencia"
    );
    return;
  }

  setLoading(true);

  try {
    // Subir imágenes en paralelo
    const fotosUrls = await Promise.all(
      fotosConMarca.map(subirImagenFirebase)
    ).then(results => results.filter(url => url !== null));

    // Datos para Firestore
    const reporteData = {
      folio: `INC-${Date.now()}`,
      nombre,
      numeroEmpleado,
      puntoVigilancia,
      turno,
      hora,
      fecha: new Date().toISOString(),
      fechaHora,
      incidente,
      descripcion,
      ubicacionIncidente,
      direccionCompleta,
      causa,
      personaReporta,
      accionesTomadas,
      recomendaciones,
      fotos: fotosUrls,
      ubicacion,
      estado: "Pendiente",
      timestamp: new Date().getTime(),
      ordenServicioId // 
    };

    // Guardar en Firestore
   // await addDoc(collection(db, "reportesIncidentes"), reporteData); remanente de codigo de cuando se guardaba en firebase 
    
    // Datos para el API externo
    const apiData = {
      guardia_id: datosCompletos.id, // ID del guardia
      orden_servicio_id: ordenServicioId, // ID de la orden de servicio
      punto_vigilancia: puntoVigilancia,
      turno: turno,
      incidente: incidente,
      descripcion: descripcion,
      ubicacion: direccionCompleta || ubicacionIncidente,
      causa: causa,
      quien_reporta: personaReporta || nombre, // Usa el nombre del guardia si no hay persona que reporta
      acciones: accionesTomadas,
      recomendaciones: recomendaciones,
      lugar_incidente: ubicacionIncidente,
      foto: fotosUrls[0] || "" // Tomamos la primera foto si existe
    };

    console.log("Datos para API:", apiData);

    // Enviar al API externo
    const apiResponse = await fetch('https://admin.grupoproeje.com.mx/api/reporte-incidente-guardia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiData)
    });

    const responseData = await apiResponse.json();
    console.log("Respuesta del servidor:", responseData);

    if (!apiResponse.ok) {
      throw new Error(responseData.message || 'Error al enviar a la API externa');
    }

    Alert.alert("Éxito", "Reporte guardado correctamente");
    
    // Resetear formulario
    setIncidente("");
    setDescripcion("");
    setUbicacionIncidente("");
    setDireccionCompleta("");
    setFotos([]);
    setFotosConMarca([]);
    setCausa("");
    setPersonaReporta("");
    setAccionesTomadas("");
    setRecomendaciones("");
    
  } catch (error) {
    console.error("Error guardando reporte:", error);
    Alert.alert(
      "Aviso", 
      error.message.includes('API externa') //prueba para ver si fallaba el reporte al guardarlo en el API
        ? "Error al guardar el reporte" 
        : "No se pudo guardar el reporte"
    );
  } finally {
    setLoading(false);
  }
};
      const eliminarFoto = (index) => {
        Alert.alert(
          "Eliminar foto",
          "¿Estás seguro de que quieres eliminar esta foto?",
          [
            {
              text: "Cancelar",
              style: "cancel"
            },
            {
              text: "Eliminar",
              onPress: () => {
                // Eliminar de todos los estados relevantes
                const nuevasFotos = [...fotos];
                nuevasFotos.splice(index, 1);
                setFotos(nuevasFotos);
                
                const nuevasFotosConMarca = [...fotosConMarca];
                nuevasFotosConMarca.splice(index, 1);
                setFotosConMarca(nuevasFotosConMarca);
                
                setFotosConfirmadas(fotosConfirmadas.filter(i => i !== index));
              }
            }
          ]
        );
      };

  if (!permisosListos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009BFF" />
        <Text style={styles.loadingText}>Configurando aplicación...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView 
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >

              {/* Encabezado */}
              <View style={styles.profileHeader}>
                          <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{nombre}</Text>
                            <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
                          </View>
                        </View>

              {loading && <ActivityIndicator size="large" color="#009BFF" style={styles.fullScreenLoader} />}

              {/* Campos del formulario */}
              <Text style={styles.label}>Punto de Vigilancia *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Almacén principal"
                value={puntoVigilancia}
                onChangeText={setPuntoVigilancia}
                editable={!loading}
              />

              <Text style={styles.label}>Turno *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={turno}
                  onValueChange={setTurno}
                  style={styles.picker}
                  enabled={!loading}
                >
                  <Picker.Item label="DÍA" value="DÍA" />
                  <Picker.Item label="NOCHE" value="NOCHE" />
                  <Picker.Item label="24H" value="24H" />
                </Picker>
              </View>

              <Text style={styles.label}>Tipo de Incidente *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={incidente}
                  onValueChange={setIncidente}
                  style={styles.picker}
                  enabled={!loading}
                >
                  <Picker.Item label="Seleccione un tipo..." value="" />
                  {tiposIncidentes.map((tipo, index) => (
                    <Picker.Item key={index} label={tipo} value={tipo} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describa en detalle lo ocurrido..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                editable={!loading}
              />

              <Text style={styles.label}>Ubicación exacta *</Text>
              
              <Pressable 
                style={[styles.button, styles.locationButton]}
                onPress={obtenerDireccionCompleta}
                disabled={loading}
              >
                <Ionicons name="location" size={20} color="white" />
                <Text style={styles.buttonText}> Obtener ubicación actual</Text>
              </Pressable>
              
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Ej: Patio de almacenamiento, sector B"
                value={ubicacionIncidente}
                onChangeText={setUbicacionIncidente}
                editable={false}
              />

              <Text style={styles.label}>Causa probable</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describa la posible causa del incidente"
                value={causa}
                onChangeText={setCausa}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <Text style={styles.label}>Persona que reportó</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de quien reportó"
                value={personaReporta}
                onChangeText={setPersonaReporta}
                editable={!loading}
              />

              <Text style={styles.label}>Acciones tomadas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describa las acciones realizadas"
                value={accionesTomadas}
                onChangeText={setAccionesTomadas}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <Text style={styles.label}>Recomendaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describa recomendaciones para evitar futuros incidentes"
                value={recomendaciones}
                onChangeText={setRecomendaciones}
                multiline
                numberOfLines={4}
                editable={!loading}
              />

                <Text style={styles.label}>Evidencia fotográfica</Text>
                <Pressable 
                  style={[styles.button, (!formularioValido || loading) && styles.disabledButton]}
                  onPress={() => {
                    if (!formularioValido) {
                      Alert.alert(
                        "Campos incompletos",
                        "Por favor complete todos los campos obligatorios antes de tomar fotos"
                      );
                    } else {
                      tomarFoto();
                    }
                  }}
                  disabled={loading || !formularioValido}
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.buttonText}>
                    {loading ? 'Cargando...' : !formularioValido ? 'Llena todos los campos primero' : 'Tomar foto'}
                  </Text>
                </Pressable>

              {fotos.length > 0 && (
                <View style={styles.photosSection}>
                  <Text style={styles.sectionTitle}>Evidencia Fotográfica Tomada: ({fotos.length})</Text>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalGallery}
                  >
                    {fotos.map((fotoUri, index) => (
                      <View key={index} style={styles.photoCard}>
                        {/* Contenedor principal de la foto */}
                        <ViewShot
                          ref={viewShotRef}
                          options={{ format: 'jpg', quality: 0.9 }}
                          style={styles.viewShot}
                        >
                          <Image source={{ uri: fotoUri }} style={styles.galleryImage} />
                          <View style={styles.watermarkContainer}>
                            <Text style={styles.watermarkText}>{fechaHora}</Text>
                            <Text style={styles.watermarkText}>{nombre} - #{numeroEmpleado}</Text>
                            <Text style={styles.watermarkText}>{puntoVigilancia} - {turno}</Text>
                          </View>
                        </ViewShot>

                        {/* Controles de la foto */}
                        <View style={styles.photoControls}>
                          {/* Botón de eliminar */}
                          <Pressable
                            style={[styles.controlButton, styles.deleteButton]}
                            onPress={() => eliminarFoto(index)}
                          >
                            <Ionicons name="trash" size={18} color="white" />
                            <Text style={styles.controlButtonText}> Eliminar</Text>
                          </Pressable>

                          {/* Botón de confirmar (solo si no está confirmada) */}
                          {!fotosConfirmadas.includes(index) && (
                            <Pressable
                              style={[styles.controlButton, styles.confirmButton]}
                              onPress={() => capturarConMarcaAgua(fotoUri, index)}
                              disabled={loading}
                            >
                              <Ionicons name="checkmark" size={18} color="white" />
                              <Text style={styles.controlButtonText}> Confirmar</Text>
                            </Pressable>
                          )}

                          {/* Indicador de estado */}
                          {fotosConfirmadas.includes(index) && (
                            <View style={[styles.controlButton, styles.confirmedStatus]}>
                              <Ionicons name="checkmark-done" size={18} color="white" />
                              <Text style={styles.controlButtonText}> Confirmada</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Hora del reporte: {hora || 'No registrada'}</Text>
                {direccionCompleta && (
                  <Text style={styles.infoText}>Dirección: {direccionCompleta}</Text>
                )}
                {ubicacion && (
                  <Text style={styles.infoText}>
                    Coordenadas: {ubicacion.latitude.toFixed(4)}, {ubicacion.longitude.toFixed(4)}
                  </Text>
                )}
              </View>

              <Pressable
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={enviarReporte}
                disabled={loading || !incidente || !descripcion || !ubicacionIncidente}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Enviando...' : 'Enviar Reporte'}
                </Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
    </SafeAreaView>       
  );
}

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: '#0A1E3D',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 1000,
  },
  profileHeader: {
    backgroundColor: '#0A1E3D',
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 20,

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
  },
  headerContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#1E3A8A',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    textAlign: 'center',
  },
  photosContainer: {
    marginTop: 10,
  },
  photoItem: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  viewShot: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 5,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  watermarkText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 15,
  marginTop: 10,
},
thumbnailContainer: {
  position: 'relative',
  marginBottom: 15,
},
thumbnail: {
  width: '100%',
  height: 120,
  borderRadius: 8,
},
deleteButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'rgba(255, 59, 48, 0.8)',
  borderRadius: 20,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
},
photoStatus: {
  position: 'absolute',
  bottom: 10,
  left: 10,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 12,
},
confirmedStatus: {
  backgroundColor: 'rgba(76, 175, 80, 0.8)',
},
pendingStatus: {
  backgroundColor: 'rgba(255, 193, 7, 0.8)',
},
statusText: {
  color: 'white',
  fontSize: 12,
  fontWeight: 'bold',
},
photosSection: {
  marginTop: 15,
  marginBottom: 10,
},
horizontalGallery: {
  paddingVertical: 10,
},
photoCard: {
  width: 280,
  marginRight: 15,
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
galleryImage: {
  width: '100%',
  height: 180,
  borderRadius: 8,
},
photoControls: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
  flexWrap: 'wrap',
},
controlButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
  marginTop: 5,
},
controlButtonText: {
  color: 'white',
  fontSize: 14,
  marginLeft: 5,
},
deleteButton: {
  backgroundColor: '#FF3B30',
},
confirmButton: {
  backgroundColor: '#1E3A8A',
},
confirmedStatus: {
  backgroundColor: '#4CAF50',
},
viewShot: {
  width: '100%',
},
watermarkContainer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: 8,
},
watermarkText: {
  color: 'white',
  fontSize: 10,
  textAlign: 'center',
},
sectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 10,
},
disabledInput: {
  backgroundColor: '#f0f0f0',
  color: '#666',
},
disabledButton: {
  opacity: 0.6,
  backgroundColor: '#1E3A8A',
},
});