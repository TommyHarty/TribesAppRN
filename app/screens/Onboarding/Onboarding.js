import React, { Component } from "react"
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Image } from "react-native"
import LinearGradient from 'react-native-linear-gradient'
import { withApollo } from "react-apollo"

import NewUser from "./NewUser"
import LoginUser from "./LoginUser"

class Onboarding extends Component {
  state = {
    mode: 'register'
  }

  setToLogin = () => {
    this.setState({ mode: 'login' })
  }

  setToRegister = () => {
    this.setState({ mode: 'register' })
  }

  render() {
    return (
      <LinearGradient style={styles.container} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={['#313131', '#313131']}>
        <StatusBar hidden barStyle="dark-content" />
        {this.state.mode === 'register' && (
          <NewUser setToLogin={this.setToLogin} {...this.props} />
        )}
        {this.state.mode === 'login' && (
          <LoginUser setToRegister={this.setToRegister} {...this.props} />
        )}
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff772a'
  },
  heading: {
    textAlign: 'center',
    color: 'white',
    fontSize: 25,
    paddingHorizontal: 30,
    opacity: 0.75,
    letterSpacing: 2,
    fontFamily: 'Roboto',
  },
  primaryBtnContainer: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 50,
    width: 180,
    height: 50,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
  },
  primaryBtn: {
    fontFamily: 'Roboto',
    letterSpacing: 2,
    fontSize: 15,
    lineHeight: 50,
    fontWeight: 'bold',
    color: '#FC4242',
    textAlign: 'center',
  },
  secondaryBtn: {
    fontFamily: 'Roboto',
    letterSpacing: 2,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 25,
  }
})

export default withApollo(Onboarding)
