// src/utils/webviewUtils.ts
import WebView, { WebViewNavigation } from "react-native-webview";

import { Platform, BackHandler, ToastAndroid } from "react-native";
import React from "react";
import Constants from "expo-constants";

export type NavigationStateHandlerProps = {
  navState: WebViewNavigation;
  setCanGoBack: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUrl: React.Dispatch<React.SetStateAction<string>>;
};

export type BackPressHandlerProps = {
  currentUrl: string;
  canGoBack: boolean;
  lastBackPressedTime: number;
  setLastBackPressedTime: React.Dispatch<React.SetStateAction<number>>;
  webViewRef: React.RefObject<WebView>;
};

export const handleBackPress = ({
  currentUrl,
  canGoBack,
  lastBackPressedTime,
  setLastBackPressedTime,
  webViewRef,
}: BackPressHandlerProps): boolean => {
  const currentTime = Date.now();

  if (currentUrl.endsWith("/") || currentUrl.endsWith("/login")) {
    if (lastBackPressedTime && currentTime - lastBackPressedTime < 2000) {
      BackHandler.exitApp();
    } else {
      ToastAndroid.show("Press back again to exit the app", ToastAndroid.SHORT);
      setLastBackPressedTime(currentTime);
    }
    return true;
  } else if (canGoBack && webViewRef.current) {
    webViewRef.current.goBack();
    return true;
  }
  return false;
};

export const handleNavigationStateChange = ({
  navState,
  setCanGoBack,
  setCurrentUrl,
}: NavigationStateHandlerProps): void => {
  setCanGoBack(navState.canGoBack);
  setCurrentUrl(navState.url);
};

export const injectedJavaScript = `
  (function() {
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);

      document.addEventListener('contextmenu', function(event) {
          event.preventDefault();
      });
      
  })();

  (function() {
        var statusBarHeight = ${Constants.statusBarHeight};
        
        // Create utility classes for padding
        var style = document.createElement('style');
        style.innerHTML = \`
            .p-status-t{
                padding-top: \${statusBarHeight}px;
            }
            .p-status-b{
                padding-bottom: \${statusBarHeight}px;
            }
        \`;
        document.head.appendChild(style);
    })();

  (function() {
      var oldLog = console.log;
      console.log = function(message) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console_log', level: 'log', data: message }));
          oldLog.apply(console, arguments);
      };
  })();

  true;
`;

export const userAgent = Platform.select({
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Mobile Safari/537.36",
  default:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
});
