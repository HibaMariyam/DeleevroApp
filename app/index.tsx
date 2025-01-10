import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  View,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import Loader from "@/components/Loader";
import {
  handleBackPress,
  handleNavigationStateChange,
  injectedJavaScript,
  userAgent,
} from "@/utils/webviewUtils";
import NetInfo from "@react-native-community/netinfo";
import { useMessageHandler } from "@/context/message-handler";
import OfflinePage from "@/components/OfflinePage";
import { SplashScreen, useNavigation } from "expo-router";
import { registerForPushNotificationsAsync } from "@/components/fcm";
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';


SplashScreen.preventAutoHideAsync();

const isLocal = false;
const baseUrl = isLocal
  ? "http://192.168.31.131:3000/"
  : "https://del.howincloud.com/";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(baseUrl);
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [lastBackPressedTime, setLastBackPressedTime] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const { handleMessage } = useMessageHandler();
  const navigation = useNavigation();
  const backPressCallback = useCallback(
    () =>
      handleBackPress({
        currentUrl,
        canGoBack,
        lastBackPressedTime,
        setLastBackPressedTime,
        webViewRef,
      }),
    [canGoBack, currentUrl, lastBackPressedTime]
  );
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
    return enabled;
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", backPressCallback);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backPressCallback);
    }
  }, [backPressCallback]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    (async () => {
      if (await requestUserPermission()) {
        const token = await messaging().getToken();
        console.log(token);
      }
    })();
  }, []);

  useEffect(() => {
    messaging()
      .getToken()
      .then(
        token => {
          webViewRef.current?.injectJavaScript(
            `window.localStorage.setItem('fcm_token', '${token}');`
          );
          console.log("FCM token:", token);
        },
        error => console.error("Failed to get FCM token:", error)
      );
  }, []);


  useEffect(() => {
    // Listener for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for user interaction with notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    // Cleanup listeners when the component unmounts
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);



  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected!);
    });
  });
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [loading]);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#000" }}
        keyboardVerticalOffset={Constants.statusBarHeight}
      >
        {/* {loading && <Loader />} */}

        {!isConnected ? (
          <OfflinePage />
        ) : (
          <WebView
            ref={webViewRef}
            style={[
              styles.webview,
              isDarkMode ? styles.darkBackground : styles.lightBackground,
            ]}
            source={{ uri: currentUrl }}
            originWhitelist={["*"]}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            geolocationEnabled={true}
            renderLoading={() => <Loader />}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            mixedContentMode="always"
            allowsFullscreenVideo
            userAgent={userAgent}
            scrollEnabled
            bounces={false}
            overScrollMode="never"
            onNavigationStateChange={(navState) =>
              handleNavigationStateChange({
                navState,
                setCanGoBack,
                setCurrentUrl,
              })
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
  darkBackground: { backgroundColor: "#000" },
  lightBackground: { backgroundColor: "#fff" },
});
