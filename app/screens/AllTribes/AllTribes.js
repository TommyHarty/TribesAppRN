import React, { Component } from "react"
import { TextInput, ImageBackground, FlatList, View, ActivityIndicator, StatusBar, Image, TouchableOpacity, Text, KeyboardAvoidingView, ScrollView, Dimensions } from "react-native"
import moment from 'moment'

import Loading from '@ui/Loading'
import Input from '@ui/Input'

import icons from '@assets/icons'

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

class AllTribes extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    roleIds: this.props.navigation.state.params.roleIds,
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  goToAllTribes = () => {
    this.props.navigation.navigate("AllTribes")
  }

  joinTribe = (tribeId) => {
    const { createTribeRole, navigation, screenProps } = this.props
    createTribeRole({
      variables: {
        tribeId: tribeId,
        userId: screenProps.user.id,
        role: 'member',
      }
    })
    .then((data) => {
      navigation.navigate("Home")
    })
    .catch(error => {
      console.log(error)
    })
  }

  goToProfileSettings = () => {
    const { screenProps, navigation } = this.props
    navigation.navigate("ProfileSettings", {
      profileId: screenProps.user.profile.id,
      profile: screenProps.user.profile,
    })
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  render() {
    const { loading, data, navigation, screenProps } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    console.log(this.state.roleIds)
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

      <FlatList
        data={data.allTribes}
        renderItem={({ item }) => {
          if (this.state.roleIds.includes(item.id)) {
            return null
          } else {
            return (
              <View>
                <View style={{ margin: 10, padding: 10, backgroundColor: '#444444', borderRadius: 50 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 50, }}>

                    {item.file ? (
                      <ImageBackground style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + 'FFFFFF', backgroundColor: '#000000', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden' }}
                      source={{ uri: item.file.url }} resizeMode='cover'>
                      </ImageBackground>
                    ) : (
                      <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + 'FFFFFF', backgroundColor: '#' + 'FFFFFF', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                      </View>
                    )}

                    <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 52 }}>
                      <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic' }}>
                        {item.tribeRoles.length} {item.tribeRoles.length === 1 ? 'member' : 'members' }
                      </Text>
                    </View>

                  </View>

                  <TouchableOpacity onPress={() => this.joinTribe(item.id)} style={{ borderBottomRightRadius: 100, position: 'absolute', right: 2, bottom: 0, padding: 5, paddingHorizontal: 10, backgroundColor: '#FFFFFF' }}>
                    <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 13, fontStyle: 'italic', color: '#313131', paddingRight: 5, }}>
                      join tribe
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }
        }}
        keyExtractor={item => item.id}
      />

      </View>
    )
  }
}

const tribesQuery = gql`
  query allTribes {
    allTribes {
      id
      title
      file {
        id
        url
      }
      tribeRoles {
        id
      }
    }
  }
`

const createTribeRole = gql`
  mutation createTribeRole(
    $userId: ID!,
    $tribeId: ID!,
    $role: String!,
  ) {
    createTribeRole(
      userId: $userId,
      tribeId: $tribeId,
      role: $role,
    ) {
      id
    }
  }
`

export default compose(
  graphql(tribesQuery),
  graphql(createTribeRole, {
    name: "createTribeRole",
    options: {
      refetchQueries: ["userQuery"]
    }
  }),
)(AllTribes)
