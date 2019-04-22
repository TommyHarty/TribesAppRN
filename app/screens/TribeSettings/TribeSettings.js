import React, { Component } from "react"
import { TouchableWithoutFeedback, TouchableHighlight, FlatList, View, ActivityIndicator, StatusBar, Image, TouchableOpacity, Text, KeyboardAvoidingView, ScrollView, Dimensions } from "react-native"
import moment from 'moment'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'
import SortableListView from 'react-native-sortable-listview'

import Loading from '@ui/Loading'
import Input from '@ui/Input'

import icons from '@assets/icons'

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

class TribeSettings extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    tab: "Sections",

    title: this.props.navigation.state.params.tribe.title,
    joinText: this.props.navigation.state.params.tribe.joinText,
    imageSource: this.props.navigation.state.params.tribe.file ? { uri: this.props.navigation.state.params.tribe.file.url } : null,
    imageId: this.props.navigation.state.params.tribe.file ? this.props.navigation.state.params.tribe.file.id : null,
    newImageId: null,

    statusBarColor: this.props.navigation.state.params.tribe.design.statusBarColor,
    headerBackgroundColor: this.props.navigation.state.params.tribe.design.headerBackgroundColor,
    headerTextColor: this.props.navigation.state.params.tribe.design.headerTextColor,
    messageBoxBackground: this.props.navigation.state.params.tribe.design.messageBoxBackground,
    messageBoxTextColor: this.props.navigation.state.params.tribe.design.messageBoxTextColor,
    messagePlaceholderText: this.props.navigation.state.params.tribe.design.messagePlaceholderText,
    iconColor: this.props.navigation.state.params.tribe.design.iconColor,
    feedBackgroundColor: this.props.navigation.state.params.tribe.design.feedBackgroundColor,
    postBackgroundColor: this.props.navigation.state.params.tribe.design.postBackgroundColor,
    postTextColor: this.props.navigation.state.params.tribe.design.postTextColor,

    showNewSection: false,
    sectionTitle: "",
    loading: false,
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  goHome = () => {
    this.props.navigation.navigate("Home")
  }

  setHeaderBackgroundColor = (option) => {
    this.setState({ headerBackgroundColor: option })
  }

  setHeaderTextColor = (option) => {
    this.setState({ headerTextColor: option })
  }

  setMessageBoxTextColor = (option) => {
    this.setState({ messageBoxTextColor: option })
  }

  setFeedBackgroundColor = (option) => {
    this.setState({ feedBackgroundColor: option })
  }

  setPostBackgroundColor = (option) => {
    this.setState({ postBackgroundColor: option })
  }

  setPostTextColor = (option) => {
    this.setState({ postTextColor: option })
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  changeTab = (option) => {
    this.setState({ tab: option })
  }

  toggleNewSection = () => {
    this.setState({ showNewSection: !this.state.showNewSection })
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  handleValueChange = (name, value) => {
    this.setState({[name]: value})
  }

  setStatusBarColor = (option) => {
    this.setState({ statusBarColor: option })
  }

  setMessageBoxBackgroundColor = (option) => {
    this.setState({ messageBoxBackground: option })
  }

  updateTribe = () => {
    const { updateTribe, Tribe, navigation, screenProps } = this.props
    this.setState({ loading: true })
    updateTribe({
      variables: {
        id: Tribe.id,
        fileId: this.state.newImageId,
        title: this.state.title || this.props.navigation.state.params.tribe.title,
        joinText: this.state.joinText || this.props.navigation.state.params.tribe.joinText,
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

  updateDesign = () => {
    const { updateDesign, Tribe, navigation, screenProps } = this.props
    this.setState({ loading: true })
    updateDesign({
      variables: {
        id: Tribe.design.id,
        statusBarColor: this.state.statusBarColor || 'White',
        headerBackgroundColor: this.state.headerBackgroundColor || '313131',
        headerTextColor: this.state.headerTextColor || 'FFFFFF',
        messageBoxBackground: this.state.messageBoxBackground || 'Light',
        messageBoxTextColor: this.state.messageBoxTextColor || '313131',
        messagePlaceholderText: this.state.messagePlaceholderText,
        iconColor: this.state.iconColor || 'FFFFFF',
        feedBackgroundColor: this.state.feedBackgroundColor || '313131',
        postBackgroundColor: this.state.postBackgroundColor || 'FFFFFF',
        postTextColor: this.state.postTextColor || '313131',
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

  newSection = () => {
    const { createSection, Tribe, navigation, screenProps } = this.props
    this.setState({ loading: true })
    if (this.state.sectionTitle) {
      createSection({
        variables: {
          tribeId: Tribe.id,
          title: this.state.sectionTitle,
          order: Tribe.sections.length + 1,
        }
      })
        .then((response) => {
          navigation.navigate("Tribe", {
            tribeId: Tribe.id,
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

  changeOrder = (order, sectionIDs) => {
    const { updateSection, Tribe } = this.props
    this.setState({ loading: true })
    setTimeout(() => {
      this.setState({ loading: false })
    }, 3000)
    order.forEach(function(section, i, array){
      console.log(section, i)
      updateSection({
        variables: {
          id: sectionIDs[section - 1],
          order: i + 1,
        }
      }).then(() => {
        i = i++
      })
      .catch(error => {
        console.log(error);
      })
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
    const { loading, Tribe, navigation } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    let sectionIDs = Tribe.sections.map(item => item.id)
    let order = Tribe.sections.map(item => item.order)
    return (
      <View style={{ flex: 1, backgroundColor: '#313131' }}>
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: 35, width: '100%' }}>
        <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.3)' }}>

            <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 10, }}>
              <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                Settings
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

        <View style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.3)',
            width: '100%',
            paddingVertical: 6,
            shadowColor: 'black',
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.07,
            zIndex: 99,
          }}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={{ marginVertical: 5, borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.3)', }} onPress={() => this.changeTab("Sections")}>
                <Text style={[
                  { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#FFFFFF' },
                  this.state.tab === "Sections" && { fontStyle: 'italic' }
                ]}>
                  Sections
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginVertical: 5, borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.3)', }} onPress={() => this.changeTab("Tribe")}>
                <Text style={[
                  { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#FFFFFF' },
                  this.state.tab === "Tribe" && { fontStyle: 'italic' }
                ]}>
                  Tribe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginVertical: 5, borderRightWidth: 0, borderRightColor: 'rgba(255, 255, 255, 0.3)', }} onPress={() => this.changeTab("Design")}>
                <Text style={[
                  { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#FFFFFF' },
                  this.state.tab === "Design" && { fontStyle: 'italic' }
                ]}>
                  Design
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <KeyboardAvoidingView style={this.getHeight(140)} behavior="padding" keyboardVerticalOffset={0}>
            {this.state.tab === "Tribe" ? (
              <ScrollView>
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
                <View style={{ marginRight: 10, marginVertical: 20, alignItems: 'flex-end' }}>
                  <TouchableOpacity onPress={this.updateTribe} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
            ) : null}

            {this.state.tab === "Design" ? (
              <ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                  Status Bar Colour
                </Text>
              </View>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                <TouchableOpacity onPress={() => this.setStatusBarColor("White")} style={[
                  { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                  this.state.statusBarColor === "White" && { backgroundColor: '#FFFFFF' }
                ]}>
                  <Text style={[
                    { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                    this.state.statusBarColor === "White" && { color: '#313131' }
                  ]}>
                    White
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.setStatusBarColor("Black")} style={[
                  { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                  this.state.statusBarColor === "Black" && { backgroundColor: '#FFFFFF' }
                ]}>
                  <Text style={[
                    { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                    this.state.statusBarColor === "Black" && { color: '#313131' }
                  ]}>
                    Black
                  </Text>
                </TouchableOpacity>
              </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Message Box Background Colour
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setMessageBoxBackgroundColor("Light")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxBackground === "Light" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxBackground === "Light" && { color: '#313131' }
                    ]}>
                      Light
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxBackgroundColor("Dark")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxBackground === "Dark" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxBackground === "Dark" && { color: '#313131' }
                    ]}>
                      Dark
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Header Background Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderBackgroundColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerBackgroundColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerBackgroundColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Header Text Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setHeaderTextColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setHeaderTextColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headerTextColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headerTextColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>




                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    New Post Box Text Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setMessageBoxTextColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.messageBoxTextColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.messageBoxTextColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>




                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Feed Background Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setFeedBackgroundColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.feedBackgroundColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.feedBackgroundColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>




                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Post Background Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostBackgroundColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postBackgroundColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postBackgroundColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>



                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Post Text Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setPostTextColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setPostTextColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.postTextColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.postTextColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ marginRight: 10, marginVertical: 20, alignItems: 'flex-end' }}>
                  <TouchableOpacity onPress={this.updateDesign} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : null}

            {this.state.tab === "Sections" ? (
              <View>
                {this.state.showNewSection ? (
                  <View>
                    <Input
                      label="Section title"
                      placeholder="Title..."
                      value={this.state.sectionTitle}
                      handleValueChange={this.handleValueChange}
                      multiline={false}
                      name="sectionTitle"
                    />

                    <View>
                      <View style={{ marginRight: 10, marginVertical: 20, flexDirection: 'row', justifyContent: 'flex-end', }}>
                        <TouchableOpacity onPress={this.toggleNewSection} style={{ width: 120, backgroundColor: '', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.newSection} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                            Save
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={{ marginHorizontal: 10, marginVertical: 20, justifyContent: 'space-between', flexDirection: 'row' }}>
                      <TouchableOpacity onPress={this.goHome} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                          Save
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.toggleNewSection} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                          New Section
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={this.getHeight(230)}>
                      <SortableListView
                        style={{ flex: 1 }}
                        data={Tribe.sections}
                        onRowMoved={e => {
                          order.splice(e.to, 0, order.splice(e.from, 1)[0])
                          this.changeOrder(order, sectionIDs)
                          this.forceUpdate()
                        }}
                        renderRow={item => (
                          <TouchableHighlight
                            underlayColor={'rgba(255,255,255,0)'}
                            {...this.props.sortHandlers}
                            onPress={() => {
                             navigation.navigate("SectionSettings", {
                               sectionId: item.id,
                               section: item,
                             })
                           }}
                          >
                            <View style={{ padding: 25, paddingHorizontal: 25, marginHorizontal: 10, marginBottom: 10, backgroundColor: '#444444', borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0, }}>
                              <Text style={{ fontFamily: 'Roboto', fontSize: 15, color: '#FFFFFF', fontWeight: 'bold' }}>
                                {item.title}
                              </Text>
                            </View>
                          </TouchableHighlight>
                        )}
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </KeyboardAvoidingView>
      </View>
      </View>
    )
  }
}

const tribeQuery = gql`
  query Tribe($id: ID) {
    Tribe(id: $id) {
      id
      title
      joinText
      showFeed
      feedTitle
      file {
        id
        url
      }
      design {
        id
        statusBarColor
        headerBackgroundColor
        headerTextColor
        messageBoxBackground
        messageBoxTextColor
        messagePlaceholderText
        iconColor
        feedBackgroundColor
        postBackgroundColor
        postTextColor
      }
      sections(orderBy: order_ASC) {
        id
        order
        title
        sectionBlocks(orderBy: order_ASC) {
          id
          text {
            id
            heading
            subHeading
            body
            backgroundColor
            headingColor
            subHeadingColor
            bodyColor
          }
          image {
            id
            imageHeight
            title
            description
            backgroundColor
            titleColor
            bodyColor
            file {
              id
              url
            }
          }
        }
      }
      tribeRoles {
        id
        user {
          id
          profile {
            id
            name
            tagline
            file {
              id
              url
            }
          }
        }
      }
      posts(orderBy: createdAt_DESC) {
        id
        body
        createdAt
        file {
          id
          url
        }
        user {
          id
          profile {
            id
            name
          }
        }
      }
    }
  }
`

const updateTribe = gql`
  mutation updateTribe(
    $id: ID!,
    $fileId: ID!,
    $title: String!,
    $joinText: String!,
  ) {
    updateTribe(
      id: $id,
      fileId: $fileId,
      title: $title,
      joinText: $joinText,
    ) {
      id
    }
  }
`

const updateDesign = gql`
  mutation updateDesign(
    $id: ID!,
    $statusBarColor: String!,
    $headerBackgroundColor: String!,
    $headerTextColor: String!,
    $messageBoxBackground: String!,
    $messageBoxTextColor: String!,
    $messagePlaceholderText: String,
    $iconColor: String!,
    $feedBackgroundColor: String!,
    $postBackgroundColor: String!,
    $postTextColor: String!,
  ) {
    updateDesign(
      id: $id,
      statusBarColor: $statusBarColor,
      headerBackgroundColor: $headerBackgroundColor,
      headerTextColor: $headerTextColor,
      messageBoxBackground: $messageBoxBackground,
      messageBoxTextColor: $messageBoxTextColor,
      messagePlaceholderText: $messagePlaceholderText,
      iconColor: $iconColor,
      feedBackgroundColor: $feedBackgroundColor,
      postBackgroundColor: $postBackgroundColor,
      postTextColor: $postTextColor,
    ) {
      id
    }
  }
`

const createSection = gql`
  mutation createSection(
    $tribeId: ID!,
    $title: String!,
    $order: Int!,
  ) {
    createSection(
      tribeId: $tribeId,
      title: $title,
      order: $order,
    ) {
      id
    }
  }
`

const updateSection = gql`
  mutation updateSection(
    $id: ID!,
    $order: Int!
  ) {
    updateSection(
      id: $id,
      order: $order)
    {
      id
    }
  }
`


export default compose(
  graphql(tribeQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ navigation }) => ({
      variables: {
        id: navigation.state.params.tribeId
      }
    })
  }),
  graphql(updateTribe, {
    name: "updateTribe",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(updateDesign, {
    name: "updateDesign",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(updateSection, {
    name: "updateSection",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(createSection, {
    name: "createSection",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
)(TribeSettings)
