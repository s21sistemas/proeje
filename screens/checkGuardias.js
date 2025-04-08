import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function checkGuardias() {
  const [comentarios, setComentarios] = useState("");
  const [foto, setFoto] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [hora, setHora] = useState("");
  const [tipoCheck, setTipoCheck] = useState("");
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');
    })();
  }, []);

  const tomarFoto = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Permiso denegado', 'Necesitas otorgar permisos para usar la cámara.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFoto(result.assets[0].uri);
    } else {
      Alert.alert('Error', 'No se pudo capturar la foto.');
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
      
      // Obtener ubicación
      let location = await Location.getCurrentPositionAsync({});
      setUbicacion(location.coords);
      
      // Obtener dirección a partir de coordenadas
      const address = await Location.reverseGeocodeAsync(location.coords);
      if (address.length > 0) {
        const dir = `${address[0].street}, ${address[0].city}, ${address[0].region}, ${address[0].country}`;
        setDireccion(dir);
      }
      
      // Obtener hora actual
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

    setLoading(true);

    try {
      let imageURL = "";
      if (foto) {
        imageURL = await uploadImageToFirebase(foto);
      }

      const checkData = {
        nombre: "Juan Perez",
        codigo: "GS-0001jp",
        tipo: tipoCheck,
        ubicacion: direccion || "Ubicación no disponible",
        coordenadas: ubicacion,
        hora: hora,
        comentarios: comentarios,
        foto: imageURL,
        fecha: new Date().toISOString()
      };

      await addDoc(collection(db, "guardias_check"), checkData);

      Alert.alert("Éxito", `Check ${tipoCheck === 'in' ? 'In' : 'Out'} registrado correctamente`);

      // Limpiar formulario (excepto los permisos)
      setComentarios("");
      setFoto("");
      setUbicacion(null);
      setDireccion("");
      setHora("");
      setTipoCheck("");
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo registrar el check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Juan Perez</Text>
        <Text style={styles.subheader}>GS-0001jp</Text>
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
        <Text style={styles.buttonText}>Tomar foto</Text>
      </Pressable>
      
      {foto && <Image source={{ uri: foto }} style={styles.image} />}

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
        style={[styles.submitButton, loading && styles.disabledButton]} 
        onPress={enviarCheck} 
        disabled={loading || !tipoCheck}
      >
        <Text style={styles.buttonText}>Enviar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subheader: {
    fontSize: 18,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 50,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#FF5722',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
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