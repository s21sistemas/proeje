import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Platform, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from "../database/firebaseConfig";
import { collection, addDoc } from 'firebase/firestore';

const RegistroUnidad = ({ route }) => {
  const { nombre, numeroEmpleado, datosCompletos} = route.params || {};
  
  const [formData, setFormData] = useState({
    // Información general
    supervisor: nombre || '',
    numeroEmpleado: numeroEmpleado || '',
    fecha: new Date().toISOString().split('T')[0],
    licenciaManejo: '',
    tarjetaCombustible: '',
    
    // Datos del vehículo
    kilometrajeInicial: '',
    kilometrajeFinal: '',
    unidadLimpia: false,
    placas: '',
    tarjetaCirculacion: '',
    
    // Llantas
    llantaDelanteraDerecha: { marca: '', condicion: '' },
    llantaDelanteraIzquierda: { marca: '', condicion: '' },
    llantaTraseraDerecha: { marca: '', condicion: '' },
    llantaTraseraIzquierda: { marca: '', condicion: '' },
    llantaExtra: { marca: '', condicion: '' },
    
    // Niveles de motor
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
    
    // Interior del vehículo
    radio: '',
    rejillasClima: '',
    guantera: '',
    descansabrazos: '',
    tapiceria: '',
    tapetes: '',
    encendedorCigarrillos: '',
    espejoRetrovisor: '',
    luzInterior: '',
    
    // Marcadores de tablero
    interruptorLucesDireccionales: '',
    acCalefaccion: '',
    switchIgnicion: '',
    interruptorParabrisas: '',
    velocimetro: '',
    medidorGasolina: '',
    medidorTemperatura: '',
    medidorAceite: '',
    
    // Herramientas
    herramientas: false,
    gato: '',
    crucetas: '',
    palancaGato: '',
    triangulos: '',
    extintor: '',
    manualVehiculo: '',
    
    // Documentación
    polizaSeguro: '',
    placaDelantera: '',
    placaTrasera: '',
    torreta: '',
    
    // Condiciones mecánicas
    sistemaFrenos: '',
    sistemaClutch: '',
    sistemaSuspension: '',
    sistemaMotor: '',
    sistemaLuces: '',
    
    // Costado derecho
    costadoDerecho: '',
    vidriosLateralesDerecho: '',
    manijaDerecho: '',
    cerradurasDerecho: '',
    copasRuedasDerecho: '',
    taponGasolina: '',
    
    // Costado izquierdo
    costadoIzquierdo: '',
    vidriosLateralesIzquierdo: '',
    manijaIzquierdo: '',
    cerradurasIzquierdo: '',
    copasRuedasIzquierdo: '',
    
    // Llaves y accesos
    llaves: false,
    puertasCajuela: '',
    ignicion: '',
    
    // Observaciones
    observaciones: '',
    
    // Firmas
    entregadoPor:'',
    recibidoPor: ''

  });

  const opcionesCondicion = [
    { label: 'Seleccionar', value: '' },
    { label: 'Buena', value: 'B' },
    { label: 'Regular', value: 'R' },
    { label: 'Mala', value: 'M' }
  ];

  const opcionesSiNo = [
    { label: 'Seleccionar', value: '' },
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' }
  ];

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const guardarReporte = async () => {
    try {
      await addDoc(collection(db, "reportes_patrullas"), formData);
      alert('Reporte guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
      alert('Ocurrió un error al guardar el reporte');
    }
  };

  return (
      <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
        <ScrollView style={styles.container}>
          <Text style={styles.header}>CHECK LIST AUTO</Text>
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
              <TextInput
                style={styles.input}
                value={formData.supervisor}
                onChangeText={(text) => handleChange('supervisor', text)}
                placeholder="Nombre del supervisor"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <TextInput
                style={styles.input}
                value={formData.fecha}
                onChangeText={(text) => handleChange('fecha', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Licencia de manejo:</Text>
              <TextInput
                style={styles.input}
                value={formData.licenciaManejo}
                onChangeText={(text) => handleChange('licenciaManejo', text)}
                placeholder="Número de licencia"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Tarjeta de combustible:</Text>
              <TextInput
                style={styles.input}
                value={formData.tarjetaCombustible}
                onChangeText={(text) => handleChange('tarjetaCombustible', text)}
                placeholder="Número de tarjeta"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          {/* Datos del vehículo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del Vehículo</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Kilometraje inicial:</Text>
              <TextInput
                style={styles.input}
                value={formData.kilometrajeInicial}
                onChangeText={(text) => handleChange('kilometrajeInicial', text)}
                keyboardType="numeric"
                placeholder="Km"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Kilometraje final:</Text>
              <TextInput
                style={styles.input}
                value={formData.kilometrajeFinal}
                onChangeText={(text) => handleChange('kilometrajeFinal', text)}
                keyboardType="numeric"
                placeholder="Km"
                placeholderTextColor="#999"
              />
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
              <TextInput
                style={styles.input}
                value={formData.placas}
                onChangeText={(text) => handleChange('placas', text)}
                placeholder="Número de placas"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Tarjeta de circulación:</Text>
              <TextInput
                style={styles.input}
                value={formData.tarjetaCirculacion}
                onChangeText={(text) => handleChange('tarjetaCirculacion', text)}
                placeholder="Número de tarjeta"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          {/* Llantas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Llantas</Text>
            
            <Text style={styles.subsectionTitle}>Delantera derecha</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Marca:</Text>
              <TextInput
                style={styles.input}
                value={formData.llantaDelanteraDerecha.marca}
                onChangeText={(text) => handleNestedChange('llantaDelanteraDerecha', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Condición:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.llantaDelanteraDerecha.condicion}
                  onValueChange={(value) => handleNestedChange('llantaDelanteraDerecha', 'condicion', value)}
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
            
            <Text style={styles.subsectionTitle}>Delantera izquierda</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Marca:</Text>
              <TextInput
                style={styles.input}
                value={formData.llantaDelanteraIzquierda.marca}
                onChangeText={(text) => handleNestedChange('llantaDelanteraIzquierda', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Condición:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.llantaDelanteraIzquierda.condicion}
                  onValueChange={(value) => handleNestedChange('llantaDelanteraIzquierda', 'condicion', value)}
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
            
            <Text style={styles.subsectionTitle}>Trasera derecha</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Marca:</Text>
              <TextInput
                style={styles.input}
                value={formData.llantaTraseraDerecha.marca}
                onChangeText={(text) => handleNestedChange('llantaTraseraDerecha', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Condición:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.llantaTraseraDerecha.condicion}
                  onValueChange={(value) => handleNestedChange('llantaTraseraDerecha', 'condicion', value)}
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
            
            <Text style={styles.subsectionTitle}>Trasera izquierda</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Marca:</Text>
              <TextInput
                style={styles.input}
                value={formData.llantaTraseraIzquierda.marca}
                onChangeText={(text) => handleNestedChange('llantaTraseraIzquierda', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Condición:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.llantaTraseraIzquierda.condicion}
                  onValueChange={(value) => handleNestedChange('llantaTraseraIzquierda', 'condicion', value)}
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
            
            <Text style={styles.subsectionTitle}>Llanta extra</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Marca:</Text>
              <TextInput
                style={styles.input}
                value={formData.llantaExtra.marca}
                onChangeText={(text) => handleNestedChange('llantaExtra', 'marca', text)}
                placeholder="Marca"
                placeholderTextColor="#999"
              />
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
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interior del Motor</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Batería marca:</Text>
              <TextInput
                style={styles.input}
                value={formData.bateriaMarca}
                onChangeText={(text) => handleChange('bateriaMarca', text)}
                placeholder="Marca de la batería"
                placeholderTextColor="#999"
              />
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
              <TextInput
                style={styles.input}
                color='#000'
                value={nombre}
                editable={false}
                placeholderTextColor="#000"
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Recibido por:</Text>
              <TextInput
                style={styles.input}
                value={formData.recibidoPor}
                onChangeText={(text) => handleChange('recibidoPor', text)}
                placeholder="Nombre de quien recibe"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          {/* Botón de guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={guardarReporte}>
            <Text style={styles.saveButtonText}>Guardar Reporte</Text>
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
    height:180
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
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistroUnidad;