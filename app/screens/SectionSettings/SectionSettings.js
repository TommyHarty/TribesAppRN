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

class SectionSettings extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    tab: "Blocks",
    sectionTitle: this.props.navigation.state.params.section.title,
    showNewBlock: false,
    blockSelection: "",
    type: "",
    blockStarted: false,

    heading: "",
    subHeading: "",
    body: "",
    textBackgroundColor: "",
    headingColor: "",
    subHeadingColor: "",
    bodyColor: "",

    title: "",
    description: "",
    imageBackgroundColor: "",
    titleColor: "",
    imageBodyColor: "",
    imageHeight: "",
    imageSource: null,
    imageData: null,
    imageId: null,
    loading: false,
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  goHome = () => {
    this.props.navigation.navigate("Home")
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  changeTab = (option) => {
    this.setState({ tab: option })
  }

  selectBlock = (option) => {
    this.setState({ blockSelection: option })
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

  toggleNewBlock = () => {
    this.setState({ showNewBlock: !this.state.showNewBlock })
  }

  handleValueChange = (name, value) => {
    this.setState({[name]: value})
  }

  updateSection = () => {
    const { updateSection, Section, navigation, screenProps } = this.props
    this.setState({ loading: true })
    updateSection({
      variables: {
        id: Section.id,
        title: this.state.sectionTitle || this.props.navigation.state.params.section.title,
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

  startBlock = () => {
    this.setState({ type: this.state.blockSelection, blockStarted: true })
  }

  toggleBlockStarted = () => {
    this.setState({ blockStarted: false })
  }

  newSectionBlock = () => {
    const { createSectionBlock, createText, createImage, Section, navigation, screenProps } = this.props
    this.setState({ loading: true })
    createSectionBlock({
      variables: {
        sectionId: Section.id,
        type: this.state.type,
        order: Section.sectionBlocks.length + 1,
      }
    })
      .then((response) => {
        if(this.state.type === "Text") {
          createText({
            variables: {
              sectionBlockId: response.data.createSectionBlock.id,
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
        if(this.state.type === "Image") {
          createImage({
            variables: {
              fileId: this.state.imageId,
              sectionBlockId: response.data.createSectionBlock.id,
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
      })
      .catch(error => {
        console.log(error)
      })
  }

  changeOrder = (order, blockIDs) => {
    const { updateSectionBlock, Tribe } = this.props
    this.setState({ loading: true })
    setTimeout(() => {
      this.setState({ loading: false })
    }, 3000)
    order.forEach(function(section, i, array){
      updateSectionBlock({
        variables: {
          id: blockIDs[section - 1],
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
      this.setState({ imageId: data.id, loading: false })
    }).catch((error) => {
      console.log(error)
      throw error
    })
  }

  deleteSection = () => {
    const { deleteSection, navigation, screenProps, Section } = this.props
    this.setState({ loading: true })
    deleteSection({
      variables: {
        id: Section.id,
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
    const { loading, Section, navigation } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    let blockIDs = Section.sectionBlocks.map(item => item.id)
    let order = Section.sectionBlocks.map(item => item.order)
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
              <TouchableOpacity style={{ marginVertical: 5, borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.3)', }} onPress={() => this.changeTab("Blocks")}>
                <Text style={[
                  { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#FFFFFF' },
                  this.state.tab === "Blocks" && { fontStyle: 'italic' }
                ]}>
                  Blocks
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginVertical: 5, }} onPress={() => this.changeTab("Section")}>
                <Text style={[
                  { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#FFFFFF' },
                  this.state.tab === "Section" && { fontStyle: 'italic' }
                ]}>
                  Section
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <KeyboardAvoidingView style={this.getHeight(140)} behavior="padding" keyboardVerticalOffset={0}>
            {this.state.tab === "Section" ? (
              <ScrollView>
                <Input
                  label="Section title"
                  placeholder="Title..."
                  value={this.state.sectionTitle}
                  handleValueChange={this.handleValueChange}
                  multiline={false}
                  name="sectionTitle"
                />

                <View style={{ marginHorizontal: 10, marginVertical: 20, justifyContent: 'space-between', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={this.deleteSection} style={{ width: 120, backgroundColor: '#777777', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131', fontStyle: 'italic' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.updateSection} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : null}

            {this.state.tab === "Blocks" ? (
              <View>
                {this.state.blockStarted ? (
                  <View>
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
                          <View style={{ marginRight: 10, marginVertical: 20, flexDirection: 'row', justifyContent: 'flex-end', }}>
                            <TouchableOpacity onPress={this.toggleBlockStarted} style={{ width: 120, backgroundColor: '', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' }}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.newSectionBlock} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
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

                        <View style={{ marginRight: 10, marginVertical: 20, flexDirection: 'row', justifyContent: 'flex-end', }}>
                          <TouchableOpacity onPress={this.toggleBlockStarted} style={{ width: 120, backgroundColor: '', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' }}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.newSectionBlock} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                              Save
                            </Text>
                          </TouchableOpacity>
                      </View>
                      </ScrollView>
                    ) : null}
                  </View>
                ) : (
                  <View>
                    {this.state.showNewBlock ? (
                      <ScrollView>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                          <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginLeft: 30, marginBottom: 8, fontStyle: 'italic', }}>
                            Block Type
                          </Text>
                          <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: '#FFFFFF', marginRight: 20, marginBottom: 8, fontStyle: 'italic', }}>
                            scroll →
                          </Text>
                        </View>

                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 10 }}>
                          <TouchableOpacity onPress={() => this.selectBlock("Text")} style={[
                            { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                            this.state.blockSelection === "Text" && { backgroundColor: '#FFFFFF' }
                          ]}>
                            <Text style={[
                              { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                              this.state.blockSelection === "Text" && { color: '#313131' }
                            ]}>
                              Text Block
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => this.selectBlock("Image")} style={[
                            { width: 120, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, },
                            this.state.blockSelection === "Image" && { backgroundColor: '#FFFFFF' }
                          ]}>
                            <Text style={[
                              { textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' },
                              this.state.blockSelection === "Image" && { color: '#313131' }
                            ]}>
                              Image Block
                            </Text>
                          </TouchableOpacity>
                        </ScrollView>


                        <View>
                          <View style={{ marginRight: 10, marginVertical: 20, flexDirection: 'row', justifyContent: 'flex-end', }}>
                            <TouchableOpacity onPress={this.toggleNewBlock} style={{ width: 120, backgroundColor: '', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#FFFFFF' }}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.startBlock} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                                Select
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ScrollView>
                    ) : (
                      <View>
                        <View style={{ marginHorizontal: 10, marginVertical: 20, justifyContent: 'space-between', flexDirection: 'row' }}>
                          <TouchableOpacity onPress={this.goHome} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                              Save
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.toggleNewBlock} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                              New Block
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={this.getHeight(230)}>
                          <SortableListView
                            style={{ flex: 1 }}
                            data={Section.sectionBlocks}
                            onRowMoved={e => {
                              order.splice(e.to, 0, order.splice(e.from, 1)[0])
                              this.changeOrder(order, blockIDs)
                              this.forceUpdate()
                            }}
                            renderRow={item => (
                              <TouchableHighlight
                                underlayColor={'rgba(255,255,255,0)'}
                                {...this.props.sortHandlers}
                                onPress={() => {
                                 navigation.navigate("BlockSettings", {
                                   blockId: item.id,
                                   block: item,
                                 })
                               }}
                              >
                                <View style={{ padding: 25, paddingHorizontal: 25, marginHorizontal: 10, marginBottom: 10, backgroundColor: '#444444', borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0, }}>
                                  <Text style={{ fontFamily: 'Roboto', fontSize: 15, color: '#FFFFFF', fontWeight: 'bold' }}>
                                    {item.type} Block
                                  </Text>
                                </View>
                              </TouchableHighlight>
                            )}
                          />
                        </View>
                      </View>
                    )}
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

const sectionQuery = gql`
  query Section($id: ID) {
    Section(id: $id) {
      id
      order
      title
      tribe {
        id
      }
      sectionBlocks(orderBy: order_ASC) {
        id
        order
        type
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
  }
`

const updateSectionBlock = gql`
  mutation updateSectionBlock(
    $id: ID!,
    $order: Int!
  ) {
    updateSectionBlock(
      id: $id,
      order: $order)
    {
      id
    }
  }
`

const updateSection = gql`
  mutation updateSection(
    $id: ID!,
    $title: String,
  ) {
    updateSection(
      id: $id,
      title: $title,
    ) {
      id
    }
  }
`

const createSectionBlock = gql`
  mutation createSectionBlock(
    $sectionId: ID!,
    $type: String!,
    $order: Int!,
  ) {
    createSectionBlock(
      sectionId: $sectionId,
      type: $type,
      order: $order,
    ) {
      id
    }
  }
`

const createText = gql`
  mutation createText(
    $sectionBlockId: ID!,
    $heading: String,
    $subHeading: String,
    $body: String,
    $backgroundColor: String,
    $headingColor: String,
    $subHeadingColor: String,
    $bodyColor: String,
  ) {
    createText(
      sectionBlockId: $sectionBlockId,
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

const createImage = gql`
  mutation createImage(
    $fileId: ID!,
    $sectionBlockId: ID!,
    $title: String,
    $description: String,
    $backgroundColor: String,
    $titleColor: String,
    $bodyColor: String,
    $imageHeight: String,
  ) {
    createImage(
      fileId: $fileId,
      sectionBlockId: $sectionBlockId,
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

const deleteSection = gql`
  mutation deleteSection($id: ID!) {
    deleteSection(id: $id) {
      id
    }
  }
`

export default compose(
  graphql(sectionQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ navigation }) => ({
      variables: {
        id: navigation.state.params.sectionId
      }
    })
  }),
  graphql(deleteSection, {
    name: "deleteSection",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(updateSectionBlock, {
    name: "updateSectionBlock",
    options: {
      refetchQueries: ["Section"]
    }
  }),
  graphql(updateSection, {
    name: "updateSection",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(createSectionBlock, {
    name: "createSectionBlock",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(createText, {
    name: "createText",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(createImage, {
    name: "createImage",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
)(SectionSettings)
