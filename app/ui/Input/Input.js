import React from "react"
import { StyleSheet, View, TextInput, Text } from "react-native"

const Input = ({
  label,
  caveat,
  value,
  placeholder,
  handleValueChange,
  multiline,
  rightComponent,
  name,
  onFocus,
}) => (
  <View style={styles.container}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
      {label && <Text style={styles.label}>{label}</Text>}
      {caveat && <Text style={styles.caveat}>{caveat}</Text>}
      {rightComponent}
    </View>

    <TextInput
      style={!multiline ? styles.textInput : [styles.textInput, styles.multilineInput]}
      onChangeText={(value) => handleValueChange(name, value)}
      value={value}
      placeholder={placeholder}
      placeholderTextColor='rgba(255, 255, 255, 0.5)'
      multiline={multiline}
      name={name}
      onFocus={onFocus}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    zIndex: 99,
    marginTop: 18,
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  caveat: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginRight: 20,
    marginBottom: 8,
  },
  textInput: {
    padding: 20,
    paddingHorizontal: 25,
    fontFamily: 'Roboto',
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: '#444444',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0)'
  },
  multilineInput: {
    paddingTop: 20,
  },
})

export default Input
