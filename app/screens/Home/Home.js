import React, { Component } from "react"
import { View, StatusBar, ScrollView, TouchableOpacity, Text, FlatList, ImageBackground } from "react-native"
import Loading from '@ui/Loading'

import { withApollo } from "react-apollo"
import { signOut } from "app/loginUtils"

import OneSignal from 'react-native-onesignal'

class Home extends Component {

  static navigationOptions = {
    header: null,
  }

  signOutUser = () => {
    signOut()
    this.props.client.resetStore()
  }

  componentDidMount() {
    OneSignal.registerForPushNotifications()
  }

  goToNewTribe = () => {
    this.props.navigation.navigate("NewTribe")
  }

  goToAllTribes = () => {
    const { screenProps, navigation } = this.props
    navigation.navigate("AllTribes", {
      roleIds: screenProps.user.tribeRoles.map(element => ( element.tribe.id ))
    })
  }

  goToProfileSettings = () => {
    const { screenProps, navigation } = this.props
    navigation.navigate("ProfileSettings", {
      profileId: screenProps.user.profile.id,
      profile: screenProps.user.profile,
    })
  }

  render() {
    const { screenProps, loading, navigation } = this.props
    if (loading) return (
      <Loading />
    )
    return (
      <View style={{ flex: 1, backgroundColor: '#313131', }}>
        <StatusBar barStyle="light-content" />

        <View style={{ paddingTop: 35, width: '100%', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.3)' }}>
          <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>

            <TouchableOpacity onPress={this.goToProfileSettings} style={{ flexDirection: 'row', alignItems: 'flex-start', height: 50, justifyContent: 'space-between', }}>
              {screenProps.user.profile.file ? (
                <ImageBackground style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#000000', borderRadius: 25, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden', }}
                source={{ uri: screenProps.user.profile.file.url }} resizeMode='cover'>
                </ImageBackground>
              ) : (
                <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#000000', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                </View>
              )}

              <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 52 }}>
                <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                  {screenProps.user.profile.name || "No username"}
                </Text>
                <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
                  {screenProps.user.profile.tagline || "No tagline"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 52, justifyContent: 'center' }}>
              <TouchableOpacity onPress={this.goToNewTribe} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                  Start Tribe
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={this.goToAllTribes} style={{ margin: 10, padding: 10, backgroundColor: '#444444', borderRadius: 50 }}>
          <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 27 }}>
            <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, }}>
              Search Tribes
            </Text>
            <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
            </Text>
          </View>
        </TouchableOpacity>

        <ScrollView>
          <View style={{ flexDirection: 'column', marginLeft: 30, marginTop: 20, }}>
            <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
              My Tribes
            </Text>
          </View>
          <FlatList
            data={screenProps.user.tribeRoles}
            renderItem={({ item }) => {
              if (item.role === 'admin') {
                return (
                  <TouchableOpacity onPress={() => {
                        navigation.navigate("Tribe", {
                          tribeId: item.tribe.id,
                          role: "admin"
                        })
                      }} style={{ margin: 10, padding: 10, backgroundColor: '#444444', borderRadius: 50 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 50, }}>

                      {item.tribe.file ? (
                        <ImageBackground style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + 'FFFFFF', backgroundColor: '#000000', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden' }}
                        source={{ uri: item.tribe.file.url }} resizeMode='cover'>
                        </ImageBackground>
                      ) : (
                        <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + 'FFFFFF', backgroundColor: '#' + 'FFFFFF', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                        </View>
                      )}

                      <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 52 }}>
                        <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                          {item.tribe.title}
                        </Text>
                        <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
                          {item.tribe.tribeRoles.length} {item.tribe.tribeRoles.length === 1 ? 'member' : 'members' }
                        </Text>
                      </View>

                    </View>
                  </TouchableOpacity>
                )
              }
            }}
            keyExtractor={item => item.id}
          />

          <View style={{ flexDirection: 'column', marginLeft: 30, marginTop: 20, }}>
            <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
              Joined Tribes
            </Text>
          </View>
          <FlatList
            data={screenProps.user.tribeRoles}
            renderItem={({ item }) => {
              if (item.role === 'member') {
                return (
                  <TouchableOpacity onPress={() => {
                        navigation.navigate("Tribe", {
                          tribeId: item.tribe.id,
                          tribeRoleId: item.id,
                        })
                      }} style={{ margin: 10, padding: 10, backgroundColor: '#444444', borderRadius: 50 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 50, }}>

                      {item.tribe.file ? (
                        <ImageBackground style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + 'FFFFFF', backgroundColor: '#000000', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden' }}
                        source={{ uri: item.tribe.file.url }} resizeMode='cover'>
                        </ImageBackground>
                      ) : (
                        <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + 'FFFFFF', backgroundColor: '#' + 'FFFFFF', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                        </View>
                      )}

                      <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 52 }}>
                        <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                          {item.tribe.title}
                        </Text>
                        <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
                          {item.tribe.tribeRoles.length} {item.tribe.tribeRoles.length === 1 ? 'member' : 'members' }
                        </Text>
                      </View>

                    </View>
                  </TouchableOpacity>
                )
              }
            }}
            keyExtractor={item => item.id}
          />

          <TouchableOpacity style={{  }} onPress={this.signOutUser}>
            <Text style={{ fontFamily: 'Roboto', fontSize: 13, marginLeft: 30, marginTop: 30, color: '#777777' }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </ScrollView>

      </View>
    )
  }
}

export default withApollo(Home)
