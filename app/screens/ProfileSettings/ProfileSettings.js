import React, { Component } from "react"
import { TouchableWithoutFeedback, TouchableHighlight, FlatList, View, ActivityIndicator, StatusBar, Image, TouchableOpacity, Text, KeyboardAvoidingView, ScrollView, Dimensions } from "react-native"
import SortableListView from 'react-native-sortable-listview'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'
import moment from 'moment'

import Loading from '@ui/Loading'
import Input from '@ui/Input'

import icons from '@assets/icons'

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

class ProfileSettings extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    name: this.props.navigation.state.params.profile.name || null,
    tagline: this.props.navigation.state.params.profile.tagline || null,
    imageSource: this.props.navigation.state.params.profile.file ? { uri: this.props.navigation.state.params.profile.file.url } : null,
    imageId: this.props.navigation.state.params.profile.file ? this.props.navigation.state.params.profile.file.id : null,
    newImageId: null,
    loading: false,
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  handleValueChange = (name, value) => {
    this.setState({[name]: value})
  }

  updateProfile = () => {
    const { updateProfile, Profile, navigation, screenProps } = this.props
    this.setState({ loading: true })
    updateProfile({
      variables: {
        id: Profile.id,
        fileId: this.state.newImageId,
        name: this.state.name,
        tagline: this.state.tagline,
      }
    })
      .then(() => {
        navigation.navigate("Home")
      })
      .catch(error => {
        this.setState({ loading: false })
        console.log(error)
      })
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
    const { loading, Section, navigation } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    console.log(this.props)
    return (
      <View style={{ flex: 1, backgroundColor: '#313131' }}>
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: 35, width: '100%' }}>
        <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.3)' }}>

            <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 10, }}>
              <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                Profile Settings
              </Text>
            </View>

          <View>
            <TouchableOpacity onPress={this.goBack} style={{ padding: 10, paddingRight: 0 }}>
            <Text style={{ fontStyle: 'italic', fontFamily: 'Roboto', padding: 0, paddingVertical: 3, fontSize: 13, color: '#FFFFFF' }}>
              back
            </Text>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView style={this.getHeight(92)} behavior="padding" keyboardVerticalOffset={0}>
        <ScrollView>
        <Input
          label="Name"
          placeholder="John Doe..."
          value={this.state.name}
          handleValueChange={this.handleValueChange}
          multiline={false}
          name="name"
        />
        <Input
          label="Tagline"
          placeholder="Tagline..."
          value={this.state.tagline}
          handleValueChange={this.handleValueChange}
          multiline={false}
          name="tagline"
        />

        <View style={{  }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
              Profile Photo
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

        <View style={{ marginRight: 10, marginVertical: 20, flexDirection: 'row', justifyContent: 'flex-end', }}>
          <TouchableOpacity onPress={this.goBack} style={{ width: 120, backgroundColor: '', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.updateProfile} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
              Save
            </Text>
          </TouchableOpacity>
      </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
      </View>
    )
  }
}

const profileQuery = gql`
  query Profile($id: ID) {
    Profile(id: $id) {
      id
      name
      tagline
      file {
        id
        url
      }
    }
  }
`

const updateProfile = gql`
  mutation updateProfile(
    $id: ID!,
    $fileId: ID!,
    $name: String,
    $tagline: String,
  ) {
    updateProfile(
      id: $id,
      fileId: $fileId,
      name: $name,
      tagline: $tagline,
    ) {
      id
    }
  }
`

export default compose(
  graphql(profileQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ navigation }) => ({
      variables: {
        id: navigation.state.params.profileId
      }
    })
  }),
  graphql(updateProfile, {
    name: "updateProfile",
    options: {
      refetchQueries: ["Profile"]
    }
  }),
)(ProfileSettings)
