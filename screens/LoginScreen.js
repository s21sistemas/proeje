import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, Pressable, Image } from 'react-native';
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
      // Buscar primero en guardias
      const qGuardias = query(collection(db, "guardias"), where("numeroEmpleado", "==", numeroEmpleado));
      const guardiasSnapshot = await getDocs(qGuardias);
      
      if (!guardiasSnapshot.empty) {
        const guardiaData = guardiasSnapshot.docs[0].data();
        navigation.replace('MainTabs', {
          nombre: guardiaData.nombre,
          numeroEmpleado: guardiaData.numeroEmpleado,
          rol: 'guardia'
        });
        return;
      }

      // Si no es guardia, buscar en supervisores
      const qSupervisores = query(collection(db, "supervisores"), where("numeroEmpleado", "==", numeroEmpleado));
      const supervisoresSnapshot = await getDocs(qSupervisores);
      
      if (!supervisoresSnapshot.empty) {
        const supervisorData = supervisoresSnapshot.docs[0].data();
        navigation.replace('SupervisorTabs', {
          nombre: supervisorData.nombre,
          numeroEmpleado: supervisorData.numeroEmpleado,
          rol: 'supervisor'
        });
        return;
      }

      alert('Número de empleado no registrado');
    } catch (error) {
      console.error("Error al autenticar:", error);
      alert('Error al verificar el número de empleado');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logoP.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Sistema de Checado</Text>
      <Text style={styles.subtitle}>Seguridad Corporativa</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Número de empleado"
          placeholderTextColor="gs-0001vmgm/sp-0001vmgm"
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
};

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
  },
  button: {
    backgroundColor: '#1E4A8D',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#15325E',
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