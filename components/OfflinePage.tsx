import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import LottieView from 'lottie-react-native'

const OfflinePage = () => {
  let animation;

  return (
    <View style={styles.container}>
      <LottieView
        ref={(animation) => { animation = animation; }}
        source={require('../assets/lottie/nonetwork.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <View>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.message}>
          Oops! It seems you're not connected to the internet.
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={() => console.log("Retry clicked")}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  lottieAnimation: {
    width: 500, 
    height: 500,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000', 
    paddingVertical: 12,        
    paddingHorizontal: 25,       
    borderRadius: 15,           
    marginTop: 10,             
  },
  retryButtonText: {
    color: '#fff',          
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
})

export default OfflinePage
