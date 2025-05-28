import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet, 
  Pressable, 
  Image, 
  KeyboardAvoidingView, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [numeroEmpleado, setNumeroEmpleado] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar si hay sesión guardada al cargar el componente
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          redirectUser(parsedData);
        }
      } catch (error) {
        console.error('Error al recuperar datos de sesión:', error);
      }
    };

    checkLoggedInUser();
  }, []);

  const redirectUser = (userData) => {
    if (userData.rol.toLowerCase().includes('supervisor')) {
      navigation.replace('SupervisorTabs', {
        nombre: userData.nombre,
        numeroEmpleado: userData.numeroEmpleado,
        rol: userData.rol,
        datosCompletos: userData.datosCompletos
      });
    } else {
      navigation.replace('MainTabs', {
        nombre: userData.nombre,
        numeroEmpleado: userData.numeroEmpleado,
        rol: userData.rol,
        datosCompletos: userData.datosCompletos
      });
    }
  };

  const handleLogin = async () => {
    if (!numeroEmpleado) {
      alert('Por favor ingresa tu número de empleado');
      return;
    }
  
    setLoading(true);
    try {
      const apiUrl = `https://admin.grupoproeje.com.mx/api/guardias-app?numero_empleado=${numeroEmpleado}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      
      if (data.length === 0) {
        alert('Credenciales incorrectas o usuario no registrado');
        setLoading(false);
        return;
      }
  
      const usuario = data[0];
      const userData = {
        nombre: `${usuario.nombre} ${usuario.apellido_p}`,
        numeroEmpleado: usuario.numero_empleado,
        id: usuario.id,
        rol: usuario.rango.toLowerCase().includes('supervisor') ? 'supervisor' : 'guardia',
        datosCompletos: usuario
      };
      
      // Guardar datos del usuario en AsyncStorage
      console.log(userData)
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      redirectUser(userData);
      
    } catch (error) {
      console.error("Error al autenticar:", error);
      alert('Error al verificar las credenciales. Por favor intenta nuevamente.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
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
              placeholderTextColor="#999"
              value={numeroEmpleado}
              onChangeText={(text) => setNumeroEmpleado(text.toLocaleUpperCase())}
              autoCapitalize="none"
              autoCorrect={false}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A0B9D9',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    marginTop: 32,
    textAlign: 'center',
  },
});

export default LoginScreen;