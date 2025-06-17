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
  ActivityIndicator,SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


export default function CheckGuardias({ route }) {
    const { nombre, numeroEmpleado, datosCompletos} = route.params || {};
       const id = datosCompletos?.id;
      const [ordenServicioId, setOrdenServicioId] = useState(null);
      const [ordenServicio, setOrdenServicio] = useState(null);
  const [comentarios, setComentarios] = useState("");
  const [foto, setFoto] = useState("");
  const [fotoConMarca, setFotoConMarca] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [hora, setHora] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [tipoCheck, setTipoCheck] = useState("");
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const viewShotRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');

      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(mediaStatus.status === 'granted');
    })();
  }, []);

      useEffect(() => {
            const fetchOrdenServicio = async () => {
              try {
                const response = await fetch(`https://admin.grupoproeje.com.mx/api/orden-servicio-app?guardia_id=${id}`);
                const result = await response.json();
                
                console.log('Respuesta de la API de órdenes:', result);
        
                if (response.ok) {
                  const ordenesData = Array.isArray(result) ? result : [result];
                  const ordenActiva = ordenesData.find(orden => orden && !orden.eliminado);
                  if (ordenActiva) {
  
                    setOrdenServicioId(ordenActiva.id);
                    setOrdenServicio(ordenActiva);
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

  const verificarEstadoGuardia = async () => {
        try {
          const lastCheck = await AsyncStorage.getItem('lastCheckAPI');
          if (lastCheck) {
            const lastCheckData = JSON.parse(lastCheck);
      
          // Mostrar en consola
           console.log("Datos recuperados de AsyncStorage:", lastCheckData);

            if (!lastCheckData.message.includes("Check-out")) {
              Alert.alert(
                "Aviso", 
                `Tienes un check-in registrado, recuerda registrar tu check out al finalizar tu turno.`
              );
            }
          }
        } catch (error) {
          console.error("Error al verificar estado:", error);
        }
      };

// Llama a esta función en tu useEffect principal
  useEffect(() => {
  verificarEstadoGuardia();

}, []);
  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('userData');
       navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const tomarFoto = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Permiso denegado', 'Necesitas otorgar permisos para usar la cámara.');
      return;
    }

    try {
      setLoading(true);
      const ahora = new Date();
      const fechaHoraStr = ahora.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setFechaHora(fechaHoraStr);

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFoto(result.assets[0].uri);
      } else {
        Alert.alert('Error', 'No se pudo capturar la foto.');
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo capturar la foto");
    } finally {
      setLoading(false);
    }
  };

  const capturarConMarcaAgua = async () => {
    if (!foto) {
      Alert.alert('Error', 'Primero debes tomar una foto');
      return;
    }

    try {
      setLoading(true);
      const uri = await viewShotRef.current.capture();
      setFotoConMarca(uri);
      
      if (hasMediaPermission) {
        await MediaLibrary.saveToLibraryAsync(uri);
      }
      
      Alert.alert('Éxito', 'Registro guardado en la foto');
    } catch (error) {
      console.error("Error al capturar vista:", error);
      Alert.alert("Error", "No se pudo agregar la marca de agua");
    } finally {
      setLoading(false);
    }
  };

const obtenerUbicacionYHora = async (tipo) => {
  if (!hasLocationPermission) {
    Alert.alert('Permiso denegado', 'Necesitas otorgar permisos para obtener la ubicación.');
    return;
  }

  try {
    setLoading(true);
    
    // Verificar si ya hay un check-in sin check-out
    if (tipo === 'in') {
      const lastCheck = await AsyncStorage.getItem('lastCheckAPI');
      if (lastCheck) {
        const lastCheckData = JSON.parse(lastCheck);
        if (!lastCheckData.message.includes("Check-out")) {
          Alert.alert(
            "Check-in pendiente", 
            `Ya tienes un check-in registrado el ${lastCheckData.fecha_entrada}. Debes hacer check-out primero.`
          );
          setLoading(false);
          return;
        }
      }
    }
    
    setTipoCheck(tipo);
    
    let location = await Location.getCurrentPositionAsync({});
    setUbicacion(location.coords);
    
    const address = await Location.reverseGeocodeAsync(location.coords);
    if (address.length > 0) {
      const dir = `${address[0].street}, ${address[0].city}, ${address[0].region}, ${address[0].country}`;
      setDireccion(dir);
    }
    
    const ahora = new Date();
    const horaStr = ahora.toLocaleTimeString();
    setHora(horaStr);
    
    Alert.alert("Información obtenida", `Check ${tipo === 'in' ? 'In' : 'Out'} registrado a las ${horaStr}`);
  } catch (error) {
    Alert.alert("Error", "No se pudo obtener la ubicación");
  } finally {
    setLoading(false);
  }
};

  const uploadImageToFirebase = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `check_images/${Date.now()}.jpg`);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la imagen");
      return null;
    }
  };

 //función que crea y envia el check in o check out  y lo envia a la api 
const enviarCheckAPI = async (checkData) => {
  try {
    let imageURL = await uploadImageToFirebase(fotoConMarca);
    
    // Payload base para ambos casos
    let requestBody = {
      foto: imageURL
    };

    // Solo para check-in añadimos todos los datos
    if (tipoCheck === 'in') {
      requestBody = {
        ...requestBody,
        guardia_id: parseInt(id),
        orden_servicio_id: ordenServicioId,
        latitude: checkData.coordenadas.latitude,
        longitude: checkData.coordenadas.longitude,
        ubicacion: checkData.ubicacion,
        comentarios: checkData.comentarios
      };
    }

    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    
    // Determinar la URL y método según el tipo de check
    let url = 'https://admin.grupoproeje.com.mx/api/check-guardia';
    let method = 'POST';
    console.log(url);
    // Si es check-out, usamos el ID guardado y cambiamos a PUT
    if (tipoCheck === 'out') {
      const lastCheck = await AsyncStorage.getItem('lastCheckAPI');
      if (lastCheck) {
        const lastCheckData = JSON.parse(lastCheck);
        url = `https://admin.grupoproeje.com.mx/api/check-guardia/${lastCheckData.id}`;
        method = 'PUT';
        console.log(url);
      } else {
        Alert.alert("Error", "No se encontró un check-in previo");
        return null;
      }
    }
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al enviar a API:", error);
    return null;
  }
};

const obtenerUltimoCheck = async () => {
  try {
    // Obtener los datos almacenados
    const datosGuardados = await AsyncStorage.getItem('lastCheckAPI');
    
    if (datosGuardados) {
      // Parsear los datos de JSON a objeto
      const datosParseados = JSON.parse(datosGuardados);
      
      // Mostrar en consola
      console.log("Datos recuperados de AsyncStorage:", datosParseados);
      
      // Mostrar en alerta (útil en dispositivos físicos)
      Alert.alert(
        "Datos almacenados",
        `ID: ${datosParseados.id}\nMensaje: ${datosParseados.message}`
      );
      
      return datosParseados;
    } else {
      console.log("No hay datos guardados en AsyncStorage");
      Alert.alert("Información", "No se encontraron datos almacenados");
      return null;
    }
  } catch (error) {
    console.error("Error al recuperar datos:", error);
    Alert.alert("Error", "No se pudieron recuperar los datos");
    return null;
  }
};


// Valida check in o checkout en los botones y llama a enviarcheckAPI
const enviarCheck = async () => {
  if (!tipoCheck) {
    Alert.alert("Error", "Debes hacer check-in o check-out primero");
    return;
  }

  if (!fotoConMarca) {
    Alert.alert("Error", "Debes generar la foto con marca de agua primero");
    return;
  }

  setLoading(true);

  try {
    const checkData = {
      nombre,
      numeroEmpleado,
      tipo: tipoCheck,
      ubicacion: direccion || "Ubicación no disponible",
      coordenadas: ubicacion,
      hora: hora,
      fechaHora: fechaHora,
      comentarios: tipoCheck === 'in' ? comentarios : "", // Solo comentarios para check-in
      foto: "", // La URL se genera en enviarCheckAPI
      fecha: new Date().toISOString()
    };

    const apiResponse = await enviarCheckAPI(checkData);
    
    if (apiResponse) {
      let successMessage = apiResponse.message || 
                         `Check ${tipoCheck === 'in' ? 'In' : 'Out'} registrado correctamente`;
      
      Alert.alert("Éxito", successMessage);
      
      // Actualizar AsyncStorage
      if (tipoCheck === 'in') {
        await AsyncStorage.setItem('lastCheckAPI', JSON.stringify(apiResponse));
      } else {
        await AsyncStorage.removeItem('lastCheckAPI');
      }

      // Limpiar formulario
      setComentarios("");
      setFoto("");
      setFotoConMarca("");
      setUbicacion(null);
      setDireccion("");
      setHora("");
      setFechaHora("");
      setTipoCheck("");
    } else {
      Alert.alert("Error", "No se pudo registrar el check");
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    Alert.alert("Error", "No se pudo registrar el check");
  } finally {
    setLoading(false);
  }
};

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{nombre}</Text>
                <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
              </View>
              
              <Pressable 
                onPress={handleLogout}
                style={styles.logoutButton}
                disabled={loading}
              >
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </Pressable>
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.header}>Registro de servicio</Text>
              <Text style={styles.subheader}>Selecciona tu tipo de check</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.checkButton, styles.checkInButton]} 
                onPress={() => obtenerUbicacionYHora('in')}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Check In</Text>
              </Pressable>

              <Pressable 
                style={[styles.checkButton, styles.checkOutButton]} 
                onPress={() => obtenerUbicacionYHora('out')}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Check Out</Text>
              </Pressable>
            </View>

            {loading && <ActivityIndicator size="large" color="#009BFF" />}

            {(direccion || hora) && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Tipo: {tipoCheck === 'in' ? 'Check In' : 'Check Out'}</Text>
                <Text style={styles.infoText}>Hora: {hora}</Text>
                <Text style={styles.infoText}>Ubicación: {direccion}</Text>
              </View>
            )}

            <Pressable 
              onPress={tomarFoto} 
              style={styles.button}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Tomar foto de evidencia</Text>
            </Pressable>
            
            {foto && (
              <View style={styles.imageContainer}>
                <ViewShot 
                  ref={viewShotRef} 
                  options={{ format: "jpg", quality: 0.9 }}
                  style={styles.viewShot}
                >
                  <Image source={{ uri: foto }} style={styles.image} />
                  <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>{fechaHora}</Text>
                    <Text style={styles.watermarkText}>{nombre} - {numeroEmpleado}</Text>
                  </View>
                </ViewShot>
                
                <Pressable 
                  onPress={capturarConMarcaAgua} 
                  style={[styles.button, styles.captureButton]}
                  disabled={loading || !foto}
                >
                  <Text style={styles.buttonText}>Confirmar foto</Text>
                </Pressable>
              </View>
            )}
            
              {tipoCheck === 'in' && (
                <>
                  <Text style={styles.label}>Comentarios:</Text>
                  <TextInput
                    style={[styles.input, styles.comentariosInput]}
                    placeholder="Ingrese comentarios (opcional)"
                    onChangeText={setComentarios}
                    value={comentarios}
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                  />
                </>
              )}
            

            <Pressable 
              style={[styles.submitButton, (loading || !fotoConMarca) && styles.disabledButton]} 
              onPress={enviarCheck} 
              disabled={loading || !fotoConMarca || !tipoCheck}
            >
              <Text style={styles.buttonText}>Enviar Registro</Text>
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
  },
  profileHeader: {
    marginBottom: 25,
    backgroundColor: '#0A1E3D',
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoutButton: {
    backgroundColor: '#d9534f',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  checkOutButton: {
    backgroundColor: '#F44336',
    marginLeft: 10,
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: '#1E3A8A',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    height: 50,
  },
  captureButton: {
    backgroundColor: '#1E3A8A',
    marginTop: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#FF5722',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewShot: {
    width: '100%',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  watermarkText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  comentariosInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
});