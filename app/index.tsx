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
import { LogLevel, NotificationClickEvent, OneSignal } from 'react-native-onesignal';
import { SplashScreen, useNavigation } from "expo-router";


OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.initialize("");

// Also need enable notifications to complete OneSignal setup
OneSignal.Notifications.requestPermission(true);

SplashScreen.preventAutoHideAsync();

const isLocal = false;
const baseUrl = isLocal
  ? " http://192.168.31.176:5188/"
  : "https://deleevro.howincloud.com";

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




  OneSignal.Notifications.addEventListener('click', (event: NotificationClickEvent) => {
    console.log('OneSignal: notification clicked:', event);
    const additionalData = event?.notification?.additionalData;
    const path = (additionalData && 'path' in additionalData) ? (additionalData.path as string) : '';
    console.log('notification path:', path);
    if (path && webViewRef.current) {
      const newUrl = `${baseUrl}${path}`;
      setCurrentUrl(newUrl);
    }
  });


  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", backPressCallback);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backPressCallback);
    }
  }, [backPressCallback]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected!);
    });
  });

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [loading]);

  return (
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
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
  darkBackground: { backgroundColor: "#000" },
  lightBackground: { backgroundColor: "#fff" },
});
