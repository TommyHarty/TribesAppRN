import React from "react"
import { View, StatusBar } from "react-native"

import ProgressBar from 'react-native-progress/Bar'

const Loading = () => (
  <View style={{ flex: 1, backgroundColor: '#313131', justifyContent: 'center', alignItems: 'center' }}>
  <StatusBar barStyle="light-content" />
    <View style={{ height: 20 }}></View>
    <ProgressBar indeterminate={true} width={170} height={3} color='#FFFFFF' borderWidth={1.5} />
  </View>
)


export default Loading
