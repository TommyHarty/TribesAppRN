import React, { Component } from "react"
import { TouchableWithoutFeedback, ImageBackground, View, ActivityIndicator, StatusBar, Image, TouchableOpacity, Text, KeyboardAvoidingView, ScrollView } from "react-native"
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'

import Loading from '@ui/Loading'
import Input from '@ui/Input'

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

class NewTribe extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    title: "",
    joinText: "",
    loading: false,
    showIsEmptyError: false,
    isEmptyError: "Cannot be empty",
    loading: false,

    imageSource: null,
    imageId: null,
    imageData: null,
    newImageId: null,
  }

  handleValueChange = (name, value) => {
    this.setState({[name]: value})
  }

  newTribe = () => {
    const { createTribe, createTribeRole, createDesign, navigation, screenProps } = this.props
    this.setState({ loading: true })
    if (this.state.title) {
      createTribe({
        variables: {
          fileId: this.state.newImageId,
          title: this.state.title,
          joinText: this.state.joinText || "Request to join +",
        }
      })
        .then((response) => {
          createTribeRole({
            variables: {
              tribeId: response.data.createTribe.id,
              userId: screenProps.user.id,
              role: 'admin',
            }
          })
          createDesign({
            variables: {
              tribeId: response.data.createTribe.id,
            }
          }).then((data) => {
            navigation.navigate("Home")
          })
        })
        .catch(error => {
          console.log(error)
        })
    } else {
      this.setState({ loading: false })
      this.setState({ showIsEmptyError: true })
    }
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  showImageMenu = () => {
    const options = {
      title: 'Select Image',
      takePhotoButtonTitle: 'Take Photo',
      chooseFromLibraryButtonTitle: 'Choose From Library',
      // storageOptions: {
      //   skipBackup: true,
      //   path: 'images',
      // },
      quality: 1,
    }
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else {
        const source = { uri: response.uri }
        this.setState({
          imageSource: source,
          imageData: response,
          loading: true,
        })

        this.storeImage(this.state.imageData)
      }
    })
  }

  storeImage = (imageData) => {
    RNFetchBlob.fetch('POST', '', {
      Authorization: "Bearer access-token",
      'Content-Type': 'multipart/form-data',
    }, [
      { name: 'data', filename: imageData.fileName, type: imageData.contentType, data: imageData.data},
    ]).then((response) => {
      const data = JSON.parse(response.data.toString())
      this.setState({ newImageId: data.id, loading: false })
    }).catch((error) => {
      console.log(error)
      throw error
    })
  }

  render() {
    const { loading, screenProps } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#313131' }} behavior="padding" keyboardVerticalOffset={0}>
      <ScrollView>
      <View style={{ paddingTop: 35, width: '100%' }}>
        <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.3)' }}>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 50, justifyContent: 'space-between', }}>
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
          </View>

          <View style={{ height: 52, justifyContent: 'center' }}>
            <TouchableOpacity onPress={this.goBack} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

        <Input
          label="The title of your tribe"
          placeholder="Jane Doe's Tribe"
          value={this.state.title}
          handleValueChange={this.handleValueChange}
          multiline={false}
          name="title"
        />

        <View style={{  }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
              Tribe Photo
            </Text>
          </View>

          <TouchableWithoutFeedback onPress={this.showImageMenu}>
            <View style={{ padding: 25, paddingHorizontal: 25, marginHorizontal: 10, marginBottom: 0, backgroundColor: '#444444', borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0, }}>
              <Text style={{ fontFamily: 'Roboto', fontSize: 15, color: '#FFFFFF', }}>
                {this.state.imageSource ? 'Change image' : 'Select image'}
              </Text>
            </View>
          </TouchableWithoutFeedback>

          {this.state.imageSource && (
            <View style={{ marginTop: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, overflow: 'hidden' }}>
              <Image source={this.state.imageSource} style={{ height: 375 }} />
            </View>
          )}
        </View>

        <View style={{ marginRight: 10, marginTop: 20, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={this.newTribe} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
              Create Tribe
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const createTribe = gql`
  mutation createTribe(
    $fileId: ID,
    $title: String!,
    $joinText: String!,
  ) {
    createTribe(
      fileId: $fileId,
      title: $title,
      joinText: $joinText,
    ) {
      id
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

const createDesign = gql`
  mutation createDesign(
    $tribeId: ID!,
  ) {
    createDesign(
      tribeId: $tribeId,
    ) {
      id
    }
  }
`


export default compose(
  graphql(createTribe, {
    name: "createTribe",
    options: {
      refetchQueries: ["userQuery"]
    }
  }),
  graphql(createTribeRole, {
    name: "createTribeRole",
    options: {
      refetchQueries: ["userQuery"]
    }
  }),
  graphql(createDesign, {
    name: "createDesign",
    options: {
      refetchQueries: ["userQuery"]
    }
  }),
)(NewTribe)
