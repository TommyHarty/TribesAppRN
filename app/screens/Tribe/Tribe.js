import React, { Component } from "react"
import { TextInput, ImageBackground, FlatList, View, ActivityIndicator, StatusBar, Image, TouchableOpacity, Text, KeyboardAvoidingView, ScrollView, Dimensions } from "react-native"
import moment from 'moment'

import Loading from '@ui/Loading'
import Input from '@ui/Input'

import icons from '@assets/icons'

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

class Tribe extends Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    tab: "Feed",
    tabSection: "",
    body: "",
    showPostButton: false,
    role: this.props.navigation.state.params.role,
    tribeRoleId: this.props.navigation.state.params.tribeRoleId,
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  changeTab = (option, isBlock) => {
    if(isBlock) {
      let selectedSection = this.props.Tribe.sections.find(o => o.title === option)
      this.setState({ tab: option, tabSection: selectedSection })
    } else {
      this.setState({ tab: option, tabSection: "" })
    }
  }

  goToTribeSettings = () => {
    const { navigation, Tribe } = this.props
    navigation.navigate("TribeSettings", {
      tribeId: Tribe.id,
      tribe: Tribe,
    })
  }

  getHeight(number) {
    return {
      height: Dimensions.get('window').height - number,
    }
  }

  handleValueChange = (name, value) => {
    this.setState({[name]: value})
    if(value !== "") {
      this.setState({ showPostButton: true })
    } else {
      this.setState({ showPostButton: false })
    }
  }

  newPost = () => {
    const { createPost, Tribe, navigation, screenProps } = this.props
    // this.setState({ loading: true })
    if (this.state.body) {
      createPost({
        variables: {
          body: this.state.body,
          tribeId: Tribe.id,
          userId: screenProps.user.id,
        }
      })
      .then((response) => {
        this.setState({ loading: false, body: "", showPostButton: false })
      })
      .catch(error => {
        console.log(error)
      })
    } else {
      this.setState({ loading: false })
      this.setState({ showIsEmptyError: true })
    }
  }

  leaveTribe = (tribeRoleId) => {
    const { deleteTribeRole, navigation, screenProps, Tribe } = this.props
    this.setState({ loading: true })
    deleteTribeRole({
      variables: {
        id: this.state.tribeRoleId,
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
    const { loading, Tribe, navigation, screenProps } = this.props
    if (loading) return (
      <Loading />
    )
    if (this.state.loading) return (
      <Loading />
    )
    return (
      <View style={{ flex: 1, backgroundColor: '#' + Tribe.design.headerBackgroundColor, }}>
      <StatusBar barStyle={Tribe.design.statusBarColor === 'White' ? "light-content" : "dark-content" } />

      <View style={{ paddingTop: 35, width: '100%' }}>
        <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#' + Tribe.design.headerTextColor + '33' }}>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 75, justifyContent: 'space-between', }}>
            {Tribe.file ? (
              <ImageBackground style={{ width: 75, height: 75, borderWidth: 1, borderColor: '#' + Tribe.design.headerTextColor, backgroundColor: '#000000', borderRadius: 75/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden' }}
              source={{ uri: Tribe.file.url }} resizeMode='cover'>
              </ImageBackground>
            ) : (
              <View style={{ width: 75, height: 75, borderWidth: 1, borderColor: '#' + Tribe.design.headerTextColor, backgroundColor: '#' + Tribe.design.headerTextColor, borderRadius: 75/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
              </View>
            )}
            <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 77 }}>
              <Text style={{ fontFamily: 'Roboto', color: '#' + Tribe.design.headerTextColor, fontSize: 18, fontWeight: 'bold' }}>
                {Tribe.title}
              </Text>
              <Text style={{ fontFamily: 'Roboto', color: '#' + Tribe.design.headerTextColor, fontSize: 13, fontStyle: 'italic' }}>
                {Tribe.tribeRoles.length} {Tribe.tribeRoles.length === 1 ? 'member' : 'members' }
              </Text>

              <FlatList
                style={{ marginTop: 6 }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={Tribe.tribeRoles}
                renderItem={({ item }) => {
                  return (
                    <View>
                      {item.user.profile.file ? (
                        <ImageBackground style={{ marginRight: 3, width: 25, height: 25, borderWidth: 1, borderColor: '#' + Tribe.design.headerTextColor, backgroundColor: '#000000', borderRadius: 25/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden' }}
                        source={{ uri: item.user.profile.file.url }} resizeMode='cover'>
                        </ImageBackground>
                      ) : (
                        <View style={{ marginRight: 3, width: 25, height: 25, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#000000', borderRadius: 25/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                        </View>
                      )}
                    </View>
                  )
                }}
                keyExtractor={item => item.id}
              />
            </View>
          </View>

          <View>
            {this.state.role === "admin" ? (
              <TouchableOpacity onPress={this.goToTribeSettings} style={{ padding: 10, paddingRight: 0 }}>
                <Text style={{ fontStyle: 'italic', fontFamily: 'Roboto', padding: 0, paddingVertical: 3, fontSize: 13, color: '#' + Tribe.design.headerTextColor }}>
                  edit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={this.leaveTribe} style={{ padding: 10, paddingRight: 0 }}>
                <Text style={{ fontStyle: 'italic', fontFamily: 'Roboto', padding: 0, paddingVertical: 3, fontSize: 13, color: '#' + Tribe.design.headerTextColor }}>
                  leave
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{
            borderBottomWidth: 1,
            borderBottomColor: '#' + Tribe.design.headerTextColor + '33',
            width: '100%',
            paddingVertical: 6,
            shadowColor: 'black',
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.07,
            zIndex: 99,
            backgroundColor: '#' + Tribe.headerBackgroundColor,
          }}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={{ marginVertical: 5, borderRightWidth: 1, borderRightColor: '#' + Tribe.design.headerTextColor + '33', }} onPress={() => this.changeTab("Feed", false)}>
                <Text style={[
                  { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#' + Tribe.design.headerTextColor },
                  this.state.tab === "Feed" && { fontStyle: 'italic' }
                ]}>
                  Feed
                </Text>
              </TouchableOpacity>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                data={Tribe.sections}
                renderItem={({ item }) => (
                  <TouchableOpacity style={{ marginVertical: 5, borderRightWidth: 1, borderRightColor: '#' + Tribe.design.headerTextColor + '33', }} onPress={() => this.changeTab(item.title, true)}>
                    <Text style={[
                      { fontFamily: 'Roboto', padding: 20, paddingVertical: 3, fontSize: 18, color: '#' + Tribe.design.headerTextColor },
                      this.state.tab === item.title && { fontStyle: 'italic' }
                    ]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
              />

            </ScrollView>
          </View>

          <View style={{ backgroundColor: '#' + Tribe.design.feedBackgroundColor }}>
          {this.state.tabSection ? (
            <ScrollView style={this.getHeight(181)}>
            <FlatList
              data={this.state.tabSection.sectionBlocks}
              renderItem={({ item }) => (
                <View>
                  {item.text ? (
                    <View style={{ padding: 30, borderBottomWidth: 1, borderBottomColor: '#' + item.text.headingColor + '33', backgroundColor: '#' + item.text.backgroundColor }}>
                      {item.text.heading ? (
                        <Text style={{ fontFamily: 'Roboto', fontSize: 18, color: '#' + item.text.headingColor, fontWeight: 'bold' }}>
                          {item.text.heading}
                        </Text>
                      ) : null}
                      {item.text.subHeading ? (
                        <Text style={{ fontFamily: 'Roboto', fontSize: 18, color: '#' + item.text.subHeadingColor, }}>
                          {item.text.subHeading}
                        </Text>
                      ) : null}
                      {item.text.body ? (
                        <Text style={{ fontFamily: 'Roboto', fontSize: 15, color: '#' + item.text.bodyColor, marginTop: 10 }}>
                          {item.text.body}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  {item.image ? (
                    <View style={{ padding: 0, backgroundColor: '#' + item.image.backgroundColor }}>
                      {item.image.imageHeight === 'Banner' && (
                        <View style={{ backgroundColor: '#' + 'FFFFFF' }}>
                        <ImageBackground style={{ width: '101%', height: 100, }}
                        source={{ uri: item.image.file.url }} resizeMode='cover'>
                        </ImageBackground>
                        </View>
                      )}
                      {item.image.imageHeight === 'Landscape' && (
                        <View style={{ backgroundColor: '#' + 'FFFFFF' }}>
                        <ImageBackground style={{ width: '101%', height: 180, }}
                        source={{ uri: item.image.file.url }} resizeMode='cover'>
                        </ImageBackground>
                        </View>
                      )}
                      {item.image.imageHeight === 'Square' && (
                        <View style={{ backgroundColor: '#' + 'FFFFFF' }}>
                        <ImageBackground style={{ width: '101%', height: 375, }}
                        source={{ uri: item.image.file.url }} resizeMode='cover'>
                        </ImageBackground>
                        </View>
                      )}
                      {item.image.imageHeight === 'Portrait' && (
                        <View style={{ backgroundColor: '#' + 'FFFFFF' }}>
                        <ImageBackground style={{ width: '101%', height: 500, }}
                        source={{ uri: item.image.file.url }} resizeMode='cover'>
                        </ImageBackground>
                        </View>
                      )}

                      {item.image.title || item.image.description ? (
                        <View style={{ padding: 30, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#' + item.image.titleColor + '33' || '#' + item.image.bodyColor + '33', backgroundColor: '#' + item.image.backgroundColor }}>
                          {item.image.title ? (
                            <Text style={{ fontFamily: 'Roboto', fontSize: 18, color: '#' + item.image.titleColor, fontWeight: 'bold' }}>
                              {item.image.title}
                            </Text>
                          ) : null}
                          {item.image.description ? (
                            <Text style={{ fontFamily: 'Roboto', fontSize: 18, color: '#' + item.image.bodyColor, }}>
                              {item.image.description}
                            </Text>
                          ) : null}
                        </View>
                      ) : null}

                    </View>
                  ) : null}
                </View>
              )}
              keyExtractor={item => item.id}
            />
          </ScrollView>
          ) : null}

        {this.state.tab === "Feed" ? (
          <View>
            <View style={{ marginHorizontal: 10, zIndex: 99, marginTop: 18, }}>
              <TextInput
                style={{ padding: 20,
                          paddingTop:20,
                          paddingHorizontal: 25,
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: '#' + Tribe.design.messageBoxTextColor,
                          backgroundColor: Tribe.design.messageBoxBackground === 'Dark' ? '#444444' : '#F1F1F1',
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0)'
                      }}
                onChangeText={(value) => this.handleValueChange("body", value)}
                value={this.state.body}
                placeholder={Tribe.design.messagePlaceholderText}
                placeholderTextColor={`#${Tribe.design.messageBoxTextColor}`}
                multiline={true}
              />
            </View>
            {this.state.showPostButton ? (
              <View style={{ marginRight: 10, marginTop: 10, alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={this.newPost} style={{ width: 120, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 50, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#313131' }}>
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <KeyboardAvoidingView style={this.getHeight(259)} behavior="padding" keyboardVerticalOffset={0}>
              <FlatList
                style={{ marginTop: 20 }}
                data={Tribe.posts}
                renderItem={({ item }) => {
                  return (
                    <View style={{ borderWidth: 1, borderColor: '#' + Tribe.design.postTextColor + '33', marginHorizontal: 10, marginBottom: 10, backgroundColor: '#' + Tribe.design.postBackgroundColor, borderRadius: 25 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 50, padding: 10, }}>

                        {item.user.profile.file ? (
                          <ImageBackground style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + Tribe.design.postTextColor, backgroundColor: '#000000', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, overflow: 'hidden' }}
                          source={{ uri: item.user.profile.file.url }} resizeMode='cover'>
                          </ImageBackground>
                        ) : (
                          <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#' + Tribe.design.postTextColor, backgroundColor: '#000000', borderRadius: 50/2, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, }}>
                          </View>
                        )}

                        <View style={{ flexDirection: 'column', marginLeft: 10, marginTop: 5, height: 52 }}>
                          <Text style={{ fontFamily: 'Roboto', color: '#' + Tribe.design.postTextColor, fontSize: 18, fontWeight: 'bold' }}>
                            {item.user.profile.name || "No username"}
                          </Text>
                          <Text style={{ fontFamily: 'Roboto', color: '#' + Tribe.design.postTextColor, fontSize: 13, fontStyle: 'italic' }}>
                            {moment(item.createdAt).fromNow()}
                          </Text>
                        </View>
                      </View>

                      <View style={{ marginTop: 10, padding: 20, }}>
                        <Text style={{ fontFamily: 'Roboto', color: '#' + Tribe.design.postTextColor, fontSize: 15, }}>
                          {item.body}
                        </Text>
                      </View>
                    </View>
                  )
                }}
                keyExtractor={item => item.id}
              />
            </KeyboardAvoidingView>
          </View>
        ) : null}
        </View>
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
            file {
              id
              url
            }
          }
        }
      }
    }
  }
`

const createPost = gql`
  mutation createPost(
    $body: String,
    $tribeId: ID!,
    $userId: ID!,
  ) {
    createPost(
      body: $body,
      tribeId: $tribeId,
      userId: $userId,
    ) {
      id
    }
  }
`

const deleteTribeRole = gql`
  mutation deleteTribeRole($id: ID!) {
    deleteTribeRole(id: $id) {
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
  graphql(createPost, {
    name: "createPost",
    options: {
      refetchQueries: ["Tribe"]
    }
  }),
  graphql(deleteTribeRole, {
    name: "deleteTribeRole",
    options: {
      refetchQueries: ["userQuery"]
    }
  }),
)(Tribe)
