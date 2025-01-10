import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Loader() {
    return (
        <View style={styles.loader}>
            <Image source={require('../assets/images/ciboee-splash.png')} style={styles.loaderImage} />
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',

    },
    loaderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        backgroundColor: '#000',

    },
    activityIndicatorContainer: {
        position: 'absolute',
        bottom: '10%',
        alignSelf: 'center',
    },
});
