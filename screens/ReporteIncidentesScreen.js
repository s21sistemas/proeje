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
  ActivityIndicator
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
  const { nombre, numeroEmpleado } = route.params;

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

  const obtenerDireccionCompleta = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000
      });
      setUbicacion(location.coords);
      
      // 2. Convertir coordenadas a dirección
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // 3. Formatear dirección
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
      
      // 4. Obtener hora actual
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

  const capturarConMarcaAgua = async (fotoUri) => {
    try {
      setLoading(true);
      const uri = await viewShotRef.current.capture();
      setFotosConMarca([...fotosConMarca, uri]);
      
      // Opcional: guardar en galería
      await MediaLibrary.saveToLibraryAsync(uri);
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la foto");
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
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
    if (!incidente || !descripcion || !ubicacionIncidente) {
      Alert.alert("Error", "Complete los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      // Subir imágenes en paralelo
      const fotosUrls = await Promise.all(
        fotosConMarca.map(uploadImageToFirebase)
      ).then(results => results.filter(url => url !== null));

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
        timestamp: new Date().getTime()
      };

      await addDoc(collection(db, "reportesIncidentes"), reporteData);
      
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
      Alert.alert("Error", "No se pudo guardar el reporte");
    } finally {
      setLoading(false);
    }
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
        style={styles.input}
        placeholder="Ej: Patio de almacenamiento, sector B"
        value={ubicacionIncidente}
        onChangeText={setUbicacionIncidente}
        editable={!loading}
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
        style={styles.button}
        onPress={tomarFoto}
        disabled={loading}
      >
        <Ionicons name="camera" size={20} color="white" />
        <Text style={styles.buttonText}> Tomar foto</Text>
      </Pressable>

      {fotos.length > 0 && (
        <View style={styles.photosContainer}>
          {fotos.map((fotoUri, index) => (
            <View key={index} style={styles.photoItem}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'jpg', quality: 0.9 }}
                style={styles.viewShot}
              >
                <Image source={{ uri: fotoUri }} style={styles.image} />
                <View style={styles.watermarkContainer}>
                  <Text style={styles.watermarkText}>{fechaHora}</Text>
                  <Text style={styles.watermarkText}>{nombre} - #{numeroEmpleado}</Text>
                  <Text style={styles.watermarkText}>{puntoVigilancia} - {turno}</Text>
                </View>
              </ViewShot>
              
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() => capturarConMarcaAgua(fotoUri)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Confirmar foto</Text>
              </Pressable>
            </View>
          ))}
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
  );
}

const styles = StyleSheet.create({
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
  disabledButton: {
    backgroundColor: '#cccccc',
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
});