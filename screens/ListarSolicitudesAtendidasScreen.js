import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from "../database/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MaterialIcons } from '@expo/vector-icons';

export default function ListarSolicitudesAtendidasScreen({ route }) {
  const { nombre, numeroEmpleado, datosCompletos } = route.params;
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef(null);

  if (!permission || !cameraPermission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.permissionText}>Necesitamos permiso para acceder a la cámara</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setQrData(data);
    setIsCameraActive(false);
    Alert.alert(
      "QR Escaneado",
      `Contenido: ${data}`,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const resetScanner = () => {
    setScanned(false);
    setQrData(null);
    setComment('');
    setImage(null);
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    if (!isCameraActive && !permission.granted) {
      requestPermission();
      return;
    }
    setIsCameraActive(!isCameraActive);
  };

  const takePicture = async () => {
    if (!cameraPermission.granted) {
      await requestCameraPermission();
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const storageRef = ref(storage, `evidencias/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    blob.close();

    return await getDownloadURL(storageRef);
  };

  const guardarReporte = async () => {
    if (!qrData) {
      Alert.alert("Error", "Primero escanea un código QR");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await addDoc(collection(db, "RoutesQR"), {
        numero: qrData,
        comentario: comment,
        numero_empleado: datosCompletos.id,
        nombre: nombre,
        fecha: serverTimestamp(),
        evidenciaUrl: imageUrl
      });

      const requestData = {
        guardia_id: datosCompletos.id,
        uuid: qrData,
        observaciones: comment,
        foto: imageUrl
      };

      const response = await fetch('https://admin.grupoproeje.com.mx/api/recorridos-guardia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      Alert.alert("Listo", "Punto registrado correctamente, recuerda completar la ruta");
      resetScanner();
    } catch (error) {
      console.error("Error al guardar datos:", error);
      Alert.alert("Error", "No se pudieron guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{nombre}</Text>
                <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
              </View>
            </View>
            
            {!scanned && (
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={toggleCamera}
                disabled={loading}
              >
                <MaterialIcons 
                  name={"camera-alt"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.cameraButtonText}>
                  {isCameraActive ? 'Cerrar cámara' : 'Escanear QR'}
                </Text>
              </TouchableOpacity>
            )}

            {isCameraActive && !scanned && (
              <View style={styles.cameraContainer}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing={facing}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
                <View style={styles.scanFrame} />
                <Text style={styles.scanText}>Escanea el código QR de la ruta</Text>
              </View>
            )}

            {scanned && (
              <View style={styles.scannedDataContainer}>
                <Text style={styles.scannedDataTitle}>Datos escaneados:</Text>
                <Text style={styles.scannedData}>{qrData}</Text>
                
                <Text style={styles.commentLabel}>Comentarios:</Text>
                <TextInput
                  style={styles.commentInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Agrega un comentario..."
                  value={comment}
                  onChangeText={setComment}
                />

                {image && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => setImage(null)}
                    >
                      <MaterialIcons name="delete" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.photoButton} 
                  onPress={takePicture}
                  disabled={loading}
                >
                  <MaterialIcons name="add-a-photo" size={20} color="white" />
                  <Text style={styles.photoButtonText}>
                    {image ? 'Cambiar foto' : 'Tomar foto'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={resetScanner}
                    disabled={loading}
                  >
                    <MaterialIcons name="cancel" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={guardarReporte}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <MaterialIcons name="save" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Guardar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
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
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#009BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scanFrame: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(0, 155, 255, 0.7)',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  scanText: {
    marginTop: 20,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  scannedDataContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  scannedDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  scannedData: {
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cameraButton: {
    backgroundColor: '#1E4A8D',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
  },
  cameraButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E4A8D',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    height: 45,
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});