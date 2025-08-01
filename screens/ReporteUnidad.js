import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from 'firebase/firestore';

const RegistroUnidad = ({ route }) => {
  const { nombre, numeroEmpleado, datosCompletos } = route.params || {};
  const id = datosCompletos?.id;
  const [ordenServicioId, setOrdenServicioId] = useState(null);
  const [ordenServicio, setOrdenServicio] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supervisor: nombre || '',
    numeroEmpleado: numeroEmpleado || '',
    fecha: new Date().toISOString().split('T')[0],
    licenciaManejo: '',
    tarjetaCombustible: '',
    kilometrajeInicial: '',
    kilometrajeFinal: '',
    unidadLimpia: false,
    placas: '',
    tarjetaCirculacion: '',
    llantaDelanteraDerecha: { marca: '', condicion: '' },
    llantaDelanteraIzquierda: { marca: '', condicion: '' },
    llantaTraseraDerecha: { marca: '', condicion: '' },
    llantaTraseraIzquierda: { marca: '', condicion: '' },
    llantaExtra: { marca: '', condicion: '' },
    nivelAguaBateria: '',
    nivelAguaRadiador: '',
    nivelAceiteMotor: '',
    nivelFrenos: '',
    nivelWipers: '',
    nivelAceiteTransmision: '',
    interiorMotor: true,
    bateriaMarca: '',
    tapaRadiador: '',
    taponAceite: '',
    varillaMedidoraAceite: '',
    bandasVentilador: '',
    claxon: '',
    radio: '',
    rejillasClima: '',
    guantera: '',
    descansabrazos: '',
    tapiceria: '',
    tapetes: '',
    encendedorCigarrillos: '',
    espejoRetrovisor: '',
    luzInterior: '',
    interruptorLucesDireccionales: '',
    acCalefaccion: '',
    switchIgnicion: '',
    interruptorParabrisas: '',
    velocimetro: '',
    medidorGasolina: '',
    medidorTemperatura: '',
    medidorAceite: '',
    herramientas: false,
    gato: '',
    crucetas: '',
    palancaGato: '',
    triangulos: '',
    extintor: '',
    manualVehiculo: '',
    polizaSeguro: '',
    placaDelantera: '',
    placaTrasera: '',
    torreta: '',
    sistemaFrenos: '',
    sistemaClutch: '',
    sistemaSuspension: '',
    sistemaMotor: '',
    sistemaLuces: '',
    costadoDerecho: '',
    vidriosLateralesDerecho: '',
    manijaDerecho: '',
    cerradurasDerecho: '',
    copasRuedasDerecho: '',
    taponGasolina: '',
    costadoIzquierdo: '',
    vidriosLateralesIzquierdo: '',
    manijaIzquierdo: '',
    cerradurasIzquierdo: '',
    copasRuedasIzquierdo: '',
    llaves: false,
    puertasCajuela: '',
    ignicion: '',
    observaciones: '',
    entregadoPor: nombre || '',
    recibidoPor: ''
  });

  const opcionesCondicion = [
    { label: 'Seleccionar', value: '' },
    { label: 'Buena', value: 'Buena' },
    { label: 'Regular', value: 'Regular' },
    { label: 'Mala', value: 'Mala' }
  ];

  const opcionesSiNo = [
    { label: 'Seleccionar', value: '' },
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' }
  ];

  useEffect(() => {
    const fetchOrdenServicio = async () => {
      try {
        const response = await fetch(`https://admin.grupoproeje.com.mx/api/orden-servicio-app?guardia_id=${id}`);
        const result = await response.json();
        
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
      }
    };

    fetchOrdenServicio();
  }, [id]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    // Limpiar error cuando el usuario selecciona
    if (formErrors[`${parent}${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`${parent}${field}`]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validar campos obligatorios
    if (!formData.licenciaManejo) {
      errors.licenciaManejo = 'Este campo es obligatorio';
      isValid = false;
    }
    
    if (!formData.kilometrajeInicial) {
      errors.kilometrajeInicial = 'Este campo es obligatorio';
      isValid = false;
    }
    
    if (!formData.placas) {
      errors.placas = 'Este campo es obligatorio';
      isValid = false;
    }
    
    if (!formData.recibidoPor) {
      errors.recibidoPor = 'Este campo es obligatorio';
      isValid = false;
    }

    // Validar llantas (al menos marca y condición)
    const llantas = [
      { key: 'llantaDelanteraDerecha', name: 'Delantera derecha' },
      { key: 'llantaDelanteraIzquierda', name: 'Delantera izquierda' },
      { key: 'llantaTraseraDerecha', name: 'Trasera derecha' },
      { key: 'llantaTraseraIzquierda', name: 'Trasera izquierda' }
    ];
    
    llantas.forEach(llanta => {
      if (!formData[llanta.key]?.marca) {
        errors[`${llanta.key}Marca`] = `Marca de llanta ${llanta.name} es obligatoria`;
        isValid = false;
      }
      if (!formData[llanta.key]?.condicion) {
        errors[`${llanta.key}Condicion`] = `Condición de llanta ${llanta.name} es obligatoria`;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const transformDataForAPI = (formData, numeroEmpleado) => {
    const convertToBoolean = (value) => {
      if (value === 'SI') return true;
      if (value === 'NO') return false;
      return Boolean(value);
    };

    const cleanValue = (value, isBoolean = false) => {
      if (value === '' || value === undefined) {
        return isBoolean ? false : null;
      }
      return isBoolean ? convertToBoolean(value) : value;
    };

    return {
      guardia_id: parseInt(id) || 0,
      orden_servicio_id: ordenServicioId || 1,
      licencia_manejo: cleanValue(formData.licenciaManejo),
      tarjeta_combustible: cleanValue(formData.tarjetaCombustible),
      observaciones: cleanValue(formData.observaciones),
      recibido_por: cleanValue(formData.recibidoPor),
      datos_vehiculo: {
        kilometraje_inicial: parseInt(formData.kilometrajeInicial) || 0,
        kilometraje_final: parseInt(formData.kilometrajeFinal) || 0,
        unidad_limpia: cleanValue(formData.unidadLimpia, true),
        placas: cleanValue(formData.placas),
        tarjeta_circulacion: cleanValue(formData.tarjetaCirculacion)
      },
      llantas: {
        llanta_delantera_derecha: {
          marca: cleanValue(formData.llantaDelanteraDerecha?.marca),
          condicion: cleanValue(formData.llantaDelanteraDerecha?.condicion)
        },
        llanta_delantera_izquierda: {
          marca: cleanValue(formData.llantaDelanteraIzquierda?.marca),
          condicion: cleanValue(formData.llantaDelanteraIzquierda?.condicion)
        },
        llanta_trasera_derecha: {
          marca: cleanValue(formData.llantaTraseraDerecha?.marca),
          condicion: cleanValue(formData.llantaTraseraDerecha?.condicion)
        },
        llanta_trasera_izquierda: {
          marca: cleanValue(formData.llantaTraseraIzquierda?.marca),
          condicion: cleanValue(formData.llantaTraseraIzquierda?.condicion)
        },
        llanta_extra: {
          marca: cleanValue(formData.llantaExtra?.marca),
          condicion: cleanValue(formData.llantaExtra?.condicion)
        }
      },
      niveles: {
        nivel_agua_bateria: cleanValue(formData.nivelAguaBateria),
        nivel_agua_radiador: cleanValue(formData.nivelAguaRadiador),
        nivel_aceite_motor: cleanValue(formData.nivelAceiteMotor),
        nivel_frenos: cleanValue(formData.nivelFrenos),
        nivel_wipers: cleanValue(formData.nivelWipers),
        nivel_aceite_transmision: cleanValue(formData.nivelAceiteTransmision)
      },
      interior_motor: {
        bateria_marca: cleanValue(formData.bateriaMarca),
        tapon_aceite: cleanValue(formData.taponAceite, true),
        varilla_medidora: cleanValue(formData.varillaMedidoraAceite, true),
        bandas_ventilador: cleanValue(formData.bandasVentilador, true),
        claxon: cleanValue(formData.claxon, true)
      },
      interior_vehiculo: {
        radio: cleanValue(formData.radio),
        rejillas_clima: cleanValue(formData.rejillasClima),
        guantera: cleanValue(formData.guantera),
        descansabrazos: cleanValue(formData.descansabrazos),
        tapiceria: cleanValue(formData.tapiceria),
        tapetes: cleanValue(formData.tapetes),
        encendedor: cleanValue(formData.encendedorCigarrillos),
        espejo_retrovisor: cleanValue(formData.espejoRetrovisor),
        luz_interior: cleanValue(formData.luzInterior)
      },
      marcadores_tablero: {
        luces_direccionales: cleanValue(formData.interruptorLucesDireccionales),
        ac_calefaccion: cleanValue(formData.acCalefaccion),
        swicth_ignicion: cleanValue(formData.switchIgnicion),
        interrumptor_parabrisas: cleanValue(formData.interruptorParabrisas),
        velocimetro: cleanValue(formData.velocimetro),
        medidor_gasolina: cleanValue(formData.medidorGasolina),
        medidor_temperatura: cleanValue(formData.medidorTemperatura),
        medidor_aceite: cleanValue(formData.medidorAceite)
      },
      herramientas: {
        herramientas: cleanValue(formData.herramientas, true),
        gato: cleanValue(formData.gato, true),
        crucetas: cleanValue(formData.crucetas, true),
        palanca_gato: cleanValue(formData.palancaGato, true),
        triangulos: cleanValue(formData.triangulos, true),
        extintor: cleanValue(formData.extintor, true)
      },
      documentacion: {
        manual_vehiculo: cleanValue(formData.manualVehiculo, true),
        poliza_seguro: cleanValue(formData.polizaSeguro, true),
        placa_delantera: cleanValue(formData.placaDelantera, true),
        placa_trasera: cleanValue(formData.placaTrasera, true),
        torreta: cleanValue(formData.torreta, true)
      },
      condiciones_mecanicas: {
        sistema_frenos: cleanValue(formData.sistemaFrenos),
        sistema_clutch: cleanValue(formData.sistemaClutch),
        sistema_suspension: cleanValue(formData.sistemaSuspension),
        sistema_motor: cleanValue(formData.sistemaMotor),
        sistema_luces: cleanValue(formData.sistemaLuces)
      },
      costado_derecho: {
        condicion: cleanValue(formData.costadoDerecho),
        vidrios_laterales: cleanValue(formData.vidriosLateralesDerecho),
        manija: cleanValue(formData.manijaDerecho),
        cerraduras: cleanValue(formData.cerradurasDerecho),
        copas_ruedas: cleanValue(formData.copasRuedasDerecho),
        tapon_gasolina: cleanValue(formData.taponGasolina)
      },
      costado_izquierda: {
        condicion: cleanValue(formData.costadoIzquierdo),
        vidrios_laterales: cleanValue(formData.vidriosLateralesIzquierdo),
        manija: cleanValue(formData.manijaIzquierdo),
        cerraduras: cleanValue(formData.cerradurasIzquierdo),
        copas_ruedas: cleanValue(formData.copasRuedasIzquierdo)
      },
      llaves_accesos: {
        llaves_puertas_cajuela: cleanValue(formData.puertasCajuela),
        llave_ignicion: cleanValue(formData.ignicion)
      }
    };
  };

  const guardarReporte = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!validateForm()) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      // Guardar en Firebase
      await addDoc(collection(db, "reportes_patrullas"), formData);
      
      // Preparar datos para API externa
      const apiData = transformDataForAPI(formData, numeroEmpleado);
      
      // Enviar a API externa
      const apiResponse = await fetch('https://admin.grupoproeje.com.mx/api/reporte-patrullas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!apiResponse.ok) {
        throw new Error(`Error en API: ${apiResponse.status}`);
      }

      const responseData = await apiResponse.json();
      console.log('Respuesta API:', responseData);
      
      Alert.alert('Éxito', 'Reporte guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el reporte: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoiding}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>CHECK LIST PATRULLA</Text>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Supervisor: {nombre}</Text>
            <Text style={styles.profileBadge}>Empleado #{numeroEmpleado}</Text>
          </View>
        </View>
        
        {/* Información general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Supervisor:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.supervisor}
                onChangeText={(text) => handleChange('supervisor', text)}
                placeholder="Nombre del supervisor"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.fecha}
                onChangeText={(text) => handleChange('fecha', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Licencia de manejo:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.licenciaManejo && styles.inputError]}
                value={formData.licenciaManejo}
                onChangeText={(text) => handleChange('licenciaManejo', text)}
                placeholder="Número de licencia"
                placeholderTextColor="#999"
              />
              {formErrors.licenciaManejo && <Text style={styles.errorText}>{formErrors.licenciaManejo}</Text>}
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tarjeta de combustible:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.tarjetaCombustible}
                onChangeText={(text) => handleChange('tarjetaCombustible', text)}
                placeholder="Número de tarjeta"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
        
        {/* Datos del vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Vehículo</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Kilometraje inicial:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.kilometrajeInicial && styles.inputError]}
                value={formData.kilometrajeInicial}
                onChangeText={(text) => handleChange('kilometrajeInicial', text)}
                keyboardType="numeric"
                placeholder="Km"
                placeholderTextColor="#999"
              />
              {formErrors.kilometrajeInicial && <Text style={styles.errorText}>{formErrors.kilometrajeInicial}</Text>}
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Kilometraje final:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.kilometrajeFinal}
                onChangeText={(text) => handleChange('kilometrajeFinal', text)}
                keyboardType="numeric"
                placeholder="Km"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Unidad limpia:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.unidadLimpia}
                onValueChange={(value) => handleChange('unidadLimpia', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Placas:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.placas && styles.inputError]}
                value={formData.placas}
                onChangeText={(text) => handleChange('placas', text)}
                placeholder="Número de placas"
                placeholderTextColor="#999"
              />
              {formErrors.placas && <Text style={styles.errorText}>{formErrors.placas}</Text>}
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tarjeta de circulación:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.tarjetaCirculacion}
                onChangeText={(text) => handleChange('tarjetaCirculacion', text)}
                placeholder="Número de tarjeta"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
        
        {/* Llantas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Llantas</Text>
          
          <Text style={styles.subsectionTitle}>Delantera derecha</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.llantaDelanteraDerechaMarca && styles.inputError]}
                value={formData.llantaDelanteraDerecha.marca}
                onChangeText={(text) => handleNestedChange('llantaDelanteraDerecha', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
              {formErrors.llantaDelanteraDerechaMarca && <Text style={styles.errorText}>{formErrors.llantaDelanteraDerechaMarca}</Text>}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.llantaDelanteraDerecha.condicion}
                onValueChange={(value) => handleNestedChange('llantaDelanteraDerecha', 'condicion', value)}
                style={[styles.picker, formErrors.llantaDelanteraDerechaCondicion && styles.inputError]}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
              {formErrors.llantaDelanteraDerechaCondicion && <Text style={styles.errorText}>{formErrors.llantaDelanteraDerechaCondicion}</Text>}
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>Delantera izquierda</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.llantaDelanteraIzquierdaMarca && styles.inputError]}
                value={formData.llantaDelanteraIzquierda.marca}
                onChangeText={(text) => handleNestedChange('llantaDelanteraIzquierda', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
              {formErrors.llantaDelanteraIzquierdaMarca && <Text style={styles.errorText}>{formErrors.llantaDelanteraIzquierdaMarca}</Text>}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.llantaDelanteraIzquierda.condicion}
                onValueChange={(value) => handleNestedChange('llantaDelanteraIzquierda', 'condicion', value)}
                style={[styles.picker, formErrors.llantaDelanteraIzquierdaCondicion && styles.inputError]}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
              {formErrors.llantaDelanteraIzquierdaCondicion && <Text style={styles.errorText}>{formErrors.llantaDelanteraIzquierdaCondicion}</Text>}
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>Trasera derecha</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.llantaTraseraDerechaMarca && styles.inputError]}
                value={formData.llantaTraseraDerecha.marca}
                onChangeText={(text) => handleNestedChange('llantaTraseraDerecha', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
              {formErrors.llantaTraseraDerechaMarca && <Text style={styles.errorText}>{formErrors.llantaTraseraDerechaMarca}</Text>}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.llantaTraseraDerecha.condicion}
                onValueChange={(value) => handleNestedChange('llantaTraseraDerecha', 'condicion', value)}
                style={[styles.picker, formErrors.llantaTraseraDerechaCondicion && styles.inputError]}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
              {formErrors.llantaTraseraDerechaCondicion && <Text style={styles.errorText}>{formErrors.llantaTraseraDerechaCondicion}</Text>}
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>Trasera izquierda</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.llantaTraseraIzquierdaMarca && styles.inputError]}
                value={formData.llantaTraseraIzquierda.marca}
                onChangeText={(text) => handleNestedChange('llantaTraseraIzquierda', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
              {formErrors.llantaTraseraIzquierdaMarca && <Text style={styles.errorText}>{formErrors.llantaTraseraIzquierdaMarca}</Text>}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.llantaTraseraIzquierda.condicion}
                onValueChange={(value) => handleNestedChange('llantaTraseraIzquierda', 'condicion', value)}
                style={[styles.picker, formErrors.llantaTraseraIzquierdaCondicion && styles.inputError]}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
              {formErrors.llantaTraseraIzquierdaCondicion && <Text style={styles.errorText}>{formErrors.llantaTraseraIzquierdaCondicion}</Text>}
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>Llanta extra</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.llantaExtra.marca}
                onChangeText={(text) => handleNestedChange('llantaExtra', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.llantaExtra.condicion}
                onValueChange={(value) => handleNestedChange('llantaExtra', 'condicion', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Niveles de motor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveles de Motor</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de agua batería:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.nivelAguaBateria}
                onValueChange={(value) => handleChange('nivelAguaBateria', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de agua radiador:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.nivelAguaRadiador}
                onValueChange={(value) => handleChange('nivelAguaRadiador', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de aceite de motor:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.nivelAceiteMotor}
                onValueChange={(value) => handleChange('nivelAceiteMotor', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de frenos:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.nivelFrenos}
                onValueChange={(value) => handleChange('nivelFrenos', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de wipers:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.nivelWipers}
                onValueChange={(value) => handleChange('nivelWipers', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nivel aceite de transmisión:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.nivelAceiteTransmision}
                onValueChange={(value) => handleChange('nivelAceiteTransmision', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Interior del motor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior del Motor</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Batería marca:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.bateriaMarca}
                onChangeText={(text) => handleChange('bateriaMarca', text)}
                placeholder="Marca de la batería"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tapón de aceite:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.taponAceite}
                onValueChange={(value) => handleChange('taponAceite', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Varilla medidora de aceite:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.varillaMedidoraAceite}
                onValueChange={(value) => handleChange('varillaMedidoraAceite', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Bandas de ventilador:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.bandasVentilador}
                onValueChange={(value) => handleChange('bandasVentilador', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Claxon:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.claxon}
                onValueChange={(value) => handleChange('claxon', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>   
        </View>

        {/* Interior del vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior del Vehículo</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Radio:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.radio}
                onValueChange={(value) => handleChange('radio', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Rejillas clima:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.rejillasClima}
                onValueChange={(value) => handleChange('rejillasClima', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Guantera:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.guantera}
                onValueChange={(value) => handleChange('guantera', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Descansabrazos:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.descansabrazos}
                onValueChange={(value) => handleChange('descansabrazos', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tapicería:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tapiceria}
                onValueChange={(value) => handleChange('tapiceria', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tapetes:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tapetes}
                onValueChange={(value) => handleChange('tapetes', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Encendedor cigarrillos:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.encendedorCigarrillos}
                onValueChange={(value) => handleChange('encendedorCigarrillos', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Espejo retrovisor:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.espejoRetrovisor}
                onValueChange={(value) => handleChange('espejoRetrovisor', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Luz interior:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.luzInterior}
                onValueChange={(value) => handleChange('luzInterior', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Marcadores de tablero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marcadores de Tablero</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Interruptor de luces y direccionales:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.interruptorLucesDireccionales}
                onValueChange={(value) => handleChange('interruptorLucesDireccionales', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>A/C y calefacción:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.acCalefaccion}
                onValueChange={(value) => handleChange('acCalefaccion', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Switch ignición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.switchIgnicion}
                onValueChange={(value) => handleChange('switchIgnicion', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Interruptor de parabrisas:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.interruptorParabrisas}
                onValueChange={(value) => handleChange('interruptorParabrisas', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Velocímetro:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.velocimetro}
                onValueChange={(value) => handleChange('velocimetro', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Medidor de gasolina:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.medidorGasolina}
                onValueChange={(value) => handleChange('medidorGasolina', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Medidor de temperatura:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.medidorTemperatura}
                onValueChange={(value) => handleChange('medidorTemperatura', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Medidor de aceite:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.medidorAceite}
                onValueChange={(value) => handleChange('medidorAceite', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Herramientas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Herramientas</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Herramientas:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.herramientas}
                onValueChange={(value) => handleChange('herramientas', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Gato:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.gato}
                onValueChange={(value) => handleChange('gato', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Crucetas:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.crucetas}
                onValueChange={(value) => handleChange('crucetas', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Palanca gato:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.palancaGato}
                onValueChange={(value) => handleChange('palancaGato', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Triángulos:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.triangulos}
                onValueChange={(value) => handleChange('triangulos', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Extintor:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.extintor}
                onValueChange={(value) => handleChange('extintor', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
        </View>
        
        {/* Documentación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentación</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Manual del vehículo:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.manualVehiculo}
                onValueChange={(value) => handleChange('manualVehiculo', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Póliza de seguro:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.polizaSeguro}
                onValueChange={(value) => handleChange('polizaSeguro', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Placa delantera:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.placaDelantera}
                onValueChange={(value) => handleChange('placaDelantera', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Placa trasera:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.placaTrasera}
                onValueChange={(value) => handleChange('placaTrasera', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Torreta:</Text>
            <View style={styles.switchContainer}>
              <Text>No </Text>
              <Switch
                value={formData.torreta}
                onValueChange={(value) => handleChange('torreta', value)}
              />
              <Text> Sí</Text>
            </View>
          </View>
        </View>
        
        {/* Condiciones mecánicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condiciones Mecánicas</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Sistema de frenos:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sistemaFrenos}
                onValueChange={(value) => handleChange('sistemaFrenos', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Sistema de clutch:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sistemaClutch}
                onValueChange={(value) => handleChange('sistemaClutch', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Sistema de suspensión:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sistemaSuspension}
                onValueChange={(value) => handleChange('sistemaSuspension', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Sistema de motor:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sistemaMotor}
                onValueChange={(value) => handleChange('sistemaMotor', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Sistema de luces:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sistemaLuces}
                onValueChange={(value) => handleChange('sistemaLuces', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Costados del vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Costado Derecho</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.costadoDerecho}
                onValueChange={(value) => handleChange('costadoDerecho', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Vidrios laterales:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.vidriosLateralesDerecho}
                onValueChange={(value) => handleChange('vidriosLateralesDerecho', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Manija:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.manijaDerecho}
                onValueChange={(value) => handleChange('manijaDerecho', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Cerraduras:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.cerradurasDerecho}
                onValueChange={(value) => handleChange('cerradurasDerecho', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Copas ruedas:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.copasRuedasDerecho}
                onValueChange={(value) => handleChange('copasRuedasDerecho', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tapón de gasolina:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.taponGasolina}
                onValueChange={(value) => handleChange('taponGasolina', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Costado Izquierdo</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Condición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.costadoIzquierdo}
                onValueChange={(value) => handleChange('costadoIzquierdo', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Vidrios laterales:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.vidriosLateralesIzquierdo}
                onValueChange={(value) => handleChange('vidriosLateralesIzquierdo', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Manija:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.manijaIzquierdo}
                onValueChange={(value) => handleChange('manijaIzquierdo', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Cerraduras:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.cerradurasIzquierdo}
                onValueChange={(value) => handleChange('cerradurasIzquierdo', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Copas ruedas:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.copasRuedasIzquierdo}
                onValueChange={(value) => handleChange('copasRuedasIzquierdo', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Llaves y accesos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Llaves y Accesos</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Llave de puertas y cajuela:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.puertasCajuela}
                onValueChange={(value) => handleChange('puertasCajuela', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Llave de Ignición:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.ignicion}
                onValueChange={(value) => handleChange('ignicion', value)}
                style={styles.picker}
                dropdownIconColor="#666"
                mode="dropdown"
              >
                {opcionesCondicion.map((opcion) => (
                  <Picker.Item key={opcion.value} label={opcion.label} value={opcion.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {/* Observaciones */}
        <View style={styles.section2}>
          <Text style={styles.sectionTitle}>Observaciones</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.observaciones}
            onChangeText={(text) => handleChange('observaciones', text)}
            placeholder="Escriba aquí cualquier observación adicional"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>
        
        {/* Firmas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firmas</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Entregado por:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                color='#000'
                value={nombre}
                editable={false}
                placeholderTextColor="#000"
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Recibido por:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, formErrors.recibidoPor && styles.inputError]}
                value={formData.recibidoPor}
                onChangeText={(text) => handleChange('recibidoPor', text)}
                placeholder="Nombre de quien recibe"
                placeholderTextColor="#999"
              />
              {formErrors.recibidoPor && <Text style={styles.errorText}>{formErrors.recibidoPor}</Text>}
            </View>
          </View>
        </View>
        
        {/* Botón de guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
          onPress={guardarReporte}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Guardando...' : 'Guardar Reporte'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
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
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section2: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 180
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1E3A8A',
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#4B5563',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  label: {
    width: '40%',
    fontSize: 14,
    color: '#4B5563',
  },
  inputContainer: {
    flex: 1,
    minWidth: '50%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    minWidth: '50%',
    height: 40,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: Platform.select({ ios: 1, android: 0 }),
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: '50%',
  },
  picker: {
    flex: 1,
    height: Platform.select({ ios: 50, android: 50 }),
    width: '100%',
    color: '#333',
    backgroundColor: Platform.select({ ios: 'white', android: '#f5f5f5' }),
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    height: 40,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistroUnidad;