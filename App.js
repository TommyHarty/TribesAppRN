import React, { Component } from "react"
import { ApolloProvider } from "react-apollo"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import { setContext } from "apollo-link-context"

import { getToken } from "./app/loginUtils"

import Navigation from "app/base/Navigation"

import OneSignal from 'react-native-onesignal'
import codePush from 'react-native-code-push'

const authLink = setContext(async (req, { headers }) => {
  const token = await getToken()
  return {
    ...headers,
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  }
})

const httpLink = new HttpLink({
  uri: ""
})

const link = authLink.concat(httpLink)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

class App extends Component {
  constructor(properties) {
    super(properties);
    OneSignal.init("", {kOSSettingsKeyAutoPrompt: false});

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Navigation />
      </ApolloProvider>
    )
  }
}

let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };

export default codePush(codePushOptions)(App)
