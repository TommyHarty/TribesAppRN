import React, { Component } from "react"
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Dimensions, Image, ImageBackground, KeyboardAvoidingView } from "react-native"
import LinearGradient from 'react-native-linear-gradient'

import icons from '@assets/icons'

export default class UserForm extends Component {
  state = {
    email: "",
    password: "",
  }

  submitForm = () => {
    const { email, password } = this.state
    this.props.onSubmit({
      email,
      password
    })
  }

  changeScreen = () => {
    this.props.changeScreen()
  }

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset="0">

        <View style={{ flex:1, justifyContent: 'space-between' }}>

          <View style={{ padding: 30, paddingBottom: 0 }}>
            <Text style={{
              fontFamily: 'Roboto',
              fontSize: 21,
              color: 'rgba(255, 255, 255, 1)',
              textAlign: 'center',
              shadowColor: 'black',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 0.35,
              fontStyle: 'italic',
            }}>
              Tribes App
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', zIndex: 149, display: 'none'  }}>
              <TouchableOpacity onPress={this.changeScreen} style={{ padding: 20, paddingBottom: 10, paddingRight: 10 }}>
                <Text style={{ color: 'white', fontFamily: 'Roboto', textAlign: 'left', fontStyle: 'italic', fontSize: 13, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                  {this.props.type === 'Login' ? `Don't have an account?` : `Already have an account?`}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput]}
              value={this.state.email}
              onChangeText={email => this.setState({ email })}
              autoCapitalize='none'
              placeholderTextColor='rgba(255, 255, 255, 0.5)'
              placeholder="Email"
            />
            <TextInput
              style={[styles.textInput]}
              secureTextEntry
              value={this.state.password}
              onChangeText={password => this.setState({ password })}
              placeholderTextColor='rgba(255, 255, 255, 0.5)'
              placeholder="Password"
            />
            <View style={styles.primaryBtnContainer}>
              <TouchableOpacity onPress={this.submitForm}>
                <Text style={styles.primaryBtn}>
                  {this.props.type === 'Register' && `I'm Feeling Tribey`}
                  {this.props.type === 'Login' && `I'm Feeling Tribey`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  topHeading: {
    fontFamily: 'Roboto',
    letterSpacing: 2,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  heading: {
    textAlign: 'center',
    color: 'white',
    fontSize: 25,
    paddingHorizontal: 30,
    opacity: 0.75,
    letterSpacing: 0,
    fontFamily: 'Roboto',
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#777777',
    marginLeft: 20,
    marginBottom: 6,
    paddingTop: 15,
  },
  formContainer: {
    margin: 10,
    // marginTop: -35,
    zIndex: 99,
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
    borderColor: 'rgba(255, 255, 255, 0)',
    marginTop: 10
  },
  primaryBtnContainer: {
    backgroundColor: '#FF772A',
    height: 50,
    marginTop: 10,
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.21,
  },
  primaryBtn: {
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 50,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0,
  },
  imageBG: {
    width: '100%',
    height: 200,
    resizeMode: 'center',
  },
})
