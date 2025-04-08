import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, Image, Pressable } from 'react-native';
import { db } from '../database/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [numeroEmpleado, setNumeroEmpleado] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!numeroEmpleado) {
      alert('Por favor ingresa tu número de empleado');
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, "guardias"), where("numeroEmpleado", "==", numeroEmpleado));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        navigation.replace('MainTabs');
      } else {
        alert('Número de empleado no registrado');
      }
    } catch (error) {
      console.error("Error al autenticar:", error);
      alert('Error al verificar el número de empleado');
    }
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logoP.jpg')} // Asegúrate de tener esta imagen en tu proyecto
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Sistema de Checado</Text>
      

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Número de empleado"
          placeholderTextColor="#666"
          value={numeroEmpleado}
          onChangeText={setNumeroEmpleado}
        />
        
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar al Sistema</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.footerText}>Protegiendo tu trabajo, cuidando tu seguridad</Text>
    </View>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1E3D',
    padding: 25,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 25,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A0B9D9',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#0A1E3D',
    borderWidth: 1,
    borderColor: '#E3E9F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    backgroundColor: '#1E4A8D',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonPressed: {
    backgroundColor: '#15325E',
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    color: '#A0B9D9',
    fontSize: 12,
    marginTop: 30,
    textAlign: 'center',
  },
});

export default LoginScreen;