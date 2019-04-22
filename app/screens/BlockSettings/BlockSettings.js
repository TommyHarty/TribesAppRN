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

class BlockSettings extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    type: this.props.navigation.state.params.block.type,

    heading: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.heading : null,
    subHeading: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.subHeading : null,
    body: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.body : null,
    textBackgroundColor: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.backgroundColor : null,
    headingColor: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.headingColor : null,
    subHeadingColor: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.subHeadingColor : null,
    bodyColor: this.props.navigation.state.params.block.text ? this.props.navigation.state.params.block.text.bodyColor : null,

    title: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.title : null,
    description: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.description : null,
    imageBackgroundColor: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.backgroundColor : null,
    titleColor: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.titleColor : null,
    imageBodyColor: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.bodyColor : null,
    imageHeight: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.imageHeight : null,
    imageSource: this.props.navigation.state.params.block.image ? { uri: this.props.navigation.state.params.block.image.file.url } : null,
    imageId: this.props.navigation.state.params.block.image ? this.props.navigation.state.params.block.image.file.id : null,
    newImageId: null,
    loading: false,
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  goHome = () => {
    this.props.navigation.navigate("Home")
  }

  setImageHeight = (option) => {
    this.setState({ imageHeight: option })
  }

  setTextBackgroundColor = (option) => {
    this.setState({ textBackgroundColor: option })
  }

  setTextHeadingColor = (option) => {
    this.setState({ headingColor: option })
  }

  setTextSubHeadingColor = (option) => {
    this.setState({ subHeadingColor: option })
  }

  setTextBodyColor = (option) => {
    this.setState({ bodyColor: option })
  }

  setImageBackgroundColor = (option) => {
    this.setState({ imageBackgroundColor: option })
  }

  setImageTitleColor = (option) => {
    this.setState({ titleColor: option })
  }

  setImageDescriptionColor = (option) => {
    this.setState({ imageBodyColor: option })
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  handleValueChange = (name, value) => {
    this.setState({[name]: value})
  }

  updateText = () => {
    const { updateText, navigation, SectionBlock } = this.props
    updateText({
      variables: {
        id: SectionBlock.text.id,
        heading: this.state.heading,
        subHeading: this.state.subHeading,
        body: this.state.body,
        backgroundColor: this.state.textBackgroundColor || 'FFFFFF',
        headingColor: this.state.headingColor || '000000',
        subHeadingColor: this.state.subHeadingColor || '000000',
        bodyColor: this.state.bodyColor || '000000',
      }
    })
      .then((response) => {
        navigation.navigate("Home")
      })
      .catch(error => {
        console.log(error)
      })
  }

  updateImage = () => {
    const { updateImage, navigation, SectionBlock } = this.props
    updateImage({
      variables: {
        id: SectionBlock.image.id,
        fileId: this.state.newImageId || this.state.imageId,
        title: this.state.title,
        description: this.state.description,
        backgroundColor: this.state.imageBackgroundColor || 'FFFFFF',
        titleColor: this.state.titleColor || '000000',
        bodyColor: this.state.imageBodyColor || '000000',
        imageHeight: this.state.imageHeight || 'Banner',
      }
    })
      .then((response) => {
        navigation.navigate("Home")
      })
      .catch(error => {
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

  deleteSectionBlock = () => {
    const { deleteSectionBlock, navigation, screenProps, SectionBlock } = this.props
    this.setState({ loading: true })
    deleteSectionBlock({
      variables: {
        id: SectionBlock.id,
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

  render() {
    const { loading, SectionBlock, navigation } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    return (
      <View style={{ flex: 1, backgroundColor: '#313131' }}>
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: 35, width: '100%' }}>
        <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.3)' }}>

            <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 10, }}>
              <Text style={{ fontFamily: 'Roboto', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                {SectionBlock.type} Block Settings
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

            {this.state.type === "Text" ? (
              <ScrollView>
                <Input
                  label="Heading"
                  placeholder="Heading..."
                  value={this.state.heading}
                  handleValueChange={this.handleValueChange}
                  multiline={false}
                  name="heading"
                />
                <Input
                  label="Sub heading"
                  placeholder="Sub heading..."
                  value={this.state.subHeading}
                  handleValueChange={this.handleValueChange}
                  multiline={false}
                  name="subHeading"
                />
                <Input
                  label="Body"
                  placeholder="Body..."
                  value={this.state.body}
                  handleValueChange={this.handleValueChange}
                  multiline={false}
                  name="body"
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Background Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBackgroundColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.textBackgroundColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.textBackgroundColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Heading Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setTextHeadingColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextHeadingColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.headingColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.headingColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Sub Heading Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextSubHeadingColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.subHeadingColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.subHeadingColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Body Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setTextBodyColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setTextBodyColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.bodyColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.bodyColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View>
                <View style={{ marginHorizontal: 10, marginVertical: 20, justifyContent: 'space-between', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={this.deleteSectionBlock} style={{ width: 120, backgroundColor: '#777777', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131', fontStyle: 'italic' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                    <TouchableOpacity onPress={this.updateText} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                      <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            ) : null}

            {this.state.type === "Image" ? (
              <ScrollView>
              <View style={{  }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Image
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
                    <Image source={this.state.imageSource} style={[
                      { width: '100%', height: 100 },
                      this.state.imageHeight === 'Banner' && { height: 100 },
                      this.state.imageHeight === 'Landscape' && { height: 180 },
                      this.state.imageHeight === 'Square' && { height: 375 },
                      this.state.imageHeight === 'Portrait' && { height: 500 },
                    ]} />
                  </View>
                )}
              </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Image Height
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity onPress={() => this.setImageHeight("Banner")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageHeight === "Banner" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageHeight === "Banner" && { color: '#313131' }
                    ]}>
                      Banner
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageHeight("Landscape")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageHeight === "Landscape" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageHeight === "Landscape" && { color: '#313131' }
                    ]}>
                      Landscape
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageHeight("Square")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageHeight === "Square" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageHeight === "Square" && { color: '#313131' }
                    ]}>
                      Square
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageHeight("Portrait")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageHeight === "Portrait" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageHeight === "Portrait" && { color: '#313131' }
                    ]}>
                      Portrait
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <Input
                  label="Title"
                  placeholder="Title..."
                  value={this.state.title}
                  handleValueChange={this.handleValueChange}
                  multiline={false}
                  name="title"
                />
                <Input
                  label="Description"
                  placeholder="Description..."
                  value={this.state.description}
                  handleValueChange={this.handleValueChange}
                  multiline={false}
                  name="description"
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Background Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageBackgroundColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBackgroundColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBackgroundColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>



                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Title Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setImageTitleColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageTitleColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.titleColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.titleColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                    Description Colour
                  </Text>
                  <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                    scroll →
                  </Text>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 20 }}>
                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("FFFFFF")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "FFFFFF" && { backgroundColor: '#FFFFFF' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "FFFFFF" && { color: '#313131' }
                    ]}>
                      White
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("000000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "000000" && { backgroundColor: '#000000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "000000" && { color: '#FFFFFF' }
                    ]}>
                      Black
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("777777")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "777777" && { backgroundColor: '#777777' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "777777" && { color: '#FFFFFF' }
                    ]}>
                      Grey
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("FF772A")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "FF772A" && { backgroundColor: '#FF772A' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "FF772A" && { color: '#FFFFFF' }
                    ]}>
                      Orange
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("FF0000")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "FF0000" && { backgroundColor: '#FF0000' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "FF0000" && { color: '#FFFFFF' }
                    ]}>
                      Red
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("4286f4")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "4286f4" && { backgroundColor: '#4286f4' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "4286f4" && { color: '#FFFFFF' }
                    ]}>
                      Blue
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("52c45b")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "52c45b" && { backgroundColor: '#52c45b' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "52c45b" && { color: '#000000' }
                    ]}>
                      Green
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.setImageDescriptionColor("eeff3d")} style={[
                    { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                    this.state.imageBodyColor === "eeff3d" && { backgroundColor: '#eeff3d' }
                  ]}>
                    <Text style={[
                      { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                      this.state.imageBodyColor === "eeff3d" && { color: '#000000' }
                    ]}>
                      Yellow
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={{ marginHorizontal: 10, marginVertical: 20, justifyContent: 'space-between', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={this.deleteSectionBlock} style={{ width: 120, backgroundColor: '#777777', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131', fontStyle: 'italic' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.updateImage} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                      Save
                    </Text>
                  </TouchableOpacity>
              </View>
              </ScrollView>
            ) : null}

          </KeyboardAvoidingView>
      </View>
      </View>
    )
  }
}

const sectionBlockQuery = gql`
  query SectionBlock($id: ID) {
    SectionBlock(id: $id) {
      id
      order
      type
      section {
        id
        tribe {
          id
        }
      }
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
`

const updateText = gql`
  mutation updateText(
    $id: ID!,
    $heading: String,
    $subHeading: String,
    $body: String,
    $backgroundColor: String,
    $headingColor: String,
    $subHeadingColor: String,
    $bodyColor: String,
  ) {
    updateText(
      id: $id,
      heading: $heading,
      subHeading: $subHeading,
      body: $body,
      backgroundColor: $backgroundColor,
      headingColor: $headingColor,
      subHeadingColor: $subHeadingColor,
      bodyColor: $bodyColor,
    ) {
      id
    }
  }
`

const updateImage = gql`
  mutation updateImage(
    $id: ID!,
    $fileId: ID!,
    $title: String,
    $description: String,
    $backgroundColor: String,
    $titleColor: String,
    $bodyColor: String,
    $imageHeight: String,
  ) {
    updateImage(
      id: $id,
      fileId: $fileId,
      title: $title,
      description: $description,
      backgroundColor: $backgroundColor,
      titleColor: $titleColor,
      bodyColor: $bodyColor,
      imageHeight: $imageHeight,
    ) {
      id
    }
  }
`

const deleteSectionBlock = gql`
  mutation deleteSectionBlock($id: ID!) {
    deleteSectionBlock(id: $id) {
      id
    }
  }
`

export default compose(
  graphql(sectionBlockQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ navigation }) => ({
      variables: {
        id: navigation.state.params.blockId
      }
    })
  }),
  graphql(deleteSectionBlock, {
    name: "deleteSectionBlock",
    options: {
      refetchQueries: ["Section"]
    }
  }),
  graphql(updateText, {
    name: "updateText",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(updateImage, {
    name: "updateImage",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
)(BlockSettings)
