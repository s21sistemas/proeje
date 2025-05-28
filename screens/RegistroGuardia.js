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
  ActivityIndicator, KeyboardAvoidingView, SafeAreaView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

export default function RegistroGuardia({ route }) {
  const { nombre, numeroEmpleado, ordenServicio } = route.params;
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
  const [idServicio, setIdServicio] = useState(ordenServicio?.id || "");
  const [nombreGuardia, setNombreGuardia] = useState("");
  const [fotoGaleria, setFotoGaleria] = useState("");
  const viewShotRef = useRef(null);

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

  const seleccionarFotoGaleria = async () => {
    try {
      setLoading(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFotoGaleria(result.assets[0].uri);
        setFoto(""); // Limpiar foto de cámara si existe
      }
    } catch (error) {
      console.error("Error al seleccionar foto:", error);
      Alert.alert("Error", "No se pudo seleccionar la foto");
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
        setFotoGaleria(""); // Limpiar foto de galería si existe
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
      Alert.alert('Error', 'Primero debes tomar una foto con la cámara');
      return;
    }

    try {
      setLoading(true);
      const uri = await viewShotRef.current.capture();
      setFotoConMarca(uri);
      
      // Guardar la imagen en el album (opcional)
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

  const enviarCheck = async () => {
    if (!tipoCheck) {
      Alert.alert("Error", "Debes hacer check-in o check-out primero");
      return;
    }

    if (!fotoConMarca && !fotoGaleria) {
      Alert.alert("Error", "Debes generar la foto con marca de agua o seleccionar una foto");
      return;
    }

    setLoading(true);

    try {
      let imageURL = fotoConMarca 
        ? await uploadImageToFirebase(fotoConMarca) 
        : await uploadImageToFirebase(fotoGaleria);

      const checkData = {
        nombre: nombreGuardia,
        numeroEmpleado,
        idServicio,
        tipo: tipoCheck,
        ubicacion: direccion || "Ubicación no disponible",
        coordenadas: ubicacion,
        hora: hora,
        fechaHora: fechaHora,
        comentarios: comentarios,
        foto: imageURL,
        fecha: new Date().toISOString(),
        tipo:"Eventual",
        ordenServicio: ordenServicio || null
      };

      await addDoc(collection(db, "guardias_check"), checkData);

      Alert.alert("Éxito", `Check ${tipoCheck === 'in' ? 'In' : 'Out'} registrado correctamente`);

      // Limpiar formulario
      setComentarios("");
      setFoto("");
      setFotoConMarca("");
      setFotoGaleria("");
      setUbicacion(null);
      setDireccion("");
      setHora("");
      setFechaHora("");
      setTipoCheck("");
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
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Check para guardia eventual</Text>
                    <Text style={styles.subheader}></Text>
                  
                  </View>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>Supervisor: {nombre}</Text>
                      <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
                      {idServicio && (
                        <Text style={styles.profileBadge}>Servicio #{idServicio}</Text>
                      )}
                    </View>
                </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Nombre del Guardia:</Text>
                    <TextInput
                      style={styles.input}
                      value={nombreGuardia}
                      onChangeText={setNombreGuardia}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>ID de Servicio:</Text>
                    <TextInput
                      style={styles.input}
                      value={idServicio}
                      onChangeText={setIdServicio}
                      editable={!loading}
                      placeholder="Ingrese el ID del servicio"
                    />
                  </View>
                  <View style={styles.headerContainer}>
                    <Text style={styles.label}>Selecciona el tipo de check:</Text>
                  
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

                  <View style={styles.photoButtonsContainer}>
                    <Pressable 
                      style={[styles.button, styles.photoButton]}
                      onPress={seleccionarFotoGaleria}
                      disabled={loading}
                    >
                      <Text style={styles.buttonText}>Seleccionar foto</Text>
                    </Pressable>
                    
                    <Pressable 
                      onPress={tomarFoto} 
                      style={[styles.button, styles.photoButton]}
                      disabled={loading}
                    >
                      <Text style={styles.buttonText}>Tomar foto</Text>
                    </Pressable>
                  </View>

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
                          <Text style={styles.watermarkText}>{nombreGuardia} - {numeroEmpleado}</Text>
                          <Text style={styles.watermarkText}>Servicio #{idServicio}</Text>
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

                  {fotoGaleria && !foto && (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: fotoGaleria }} style={styles.image} />
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>Foto seleccionada de galería</Text>
                        <Text style={styles.infoText}>{nombreGuardia} - {numeroEmpleado}</Text>
                        <Text style={styles.infoText}>Servicio #{idServicio}</Text>
                      </View>
                    </View>
                  )}

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

                  <Pressable 
                    style={[styles.submitButton, (loading || (!fotoConMarca && !fotoGaleria)) && styles.disabledButton]} 
                    onPress={enviarCheck} 
                    disabled={loading || (!fotoConMarca && !fotoGaleria) || !tipoCheck}
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
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  checkButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  photoButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginHorizontal: 5,
    backgroundColor: '#1E3A8A',
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
    padding: 10,
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