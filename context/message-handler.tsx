// src/contexts/MessageHandlerContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ToastAndroid, Linking, Platform, Keyboard } from "react-native";
import * as Location from "expo-location";
import { handleHapticFeedback } from "@/utils/haptics-utils";
import { useCameraPermissions } from "expo-camera";
import { OneSignal } from "react-native-onesignal";

type MessageHandlerContextType = {
  handleMessage: (event: { nativeEvent: { data: string } }) => void;
};

const MessageHandlerContext = createContext<
  MessageHandlerContextType | undefined
>(undefined);

export const MessageHandlerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  const [permission, requestPermission] = useCameraPermissions();



  const openAppScheme = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`App not installed or URL invalid: ${url}`);
        openInBrowser(url);
      }
    } catch (error) {
      console.error(`Failed to open app scheme URL: ${url}`, error);
    }
  };

  const openInBrowser = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error(`Cannot open URL even in browser: ${url}`);
      }
    } catch (error) {
      console.error(`Failed to open URL in browser: ${url}`, error);
    }
  };





  useEffect(() => {
    if (Platform.OS === "android") {

    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);
  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      const message = JSON.parse(event.nativeEvent.data) as GeneralEvent;
      console.log("Received message:", message);

      switch (message.type) {
        case "haptic":
          handleHapticFeedback(message);
          break;
        case "console_log":
          console.log(message.data);
          break;
        case "alert":
          alert(message.data);
          break;
        case "keyboard_unfocus":
          Keyboard.dismiss();
          console.log("Keyboard dismissed");
          break;
        case "contact_support":
          const phoneNumber =
            Platform.OS === "android"
              ? `tel:${message.data}`
              : `tel:${message.data}`;
          Linking.openURL(phoneNumber);
          break;
        case "request_location":
          getCurrentLocation();
          break;
        case "request_camera_permission":
          requestPermission();
          break;

        case "onesignal_login":
          OneSignal.login(message.data);
          break;

        case "onsignal_logout":
          OneSignal.logout();
          break;

        case "open_app_scheme":
          openAppScheme(message.data);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    },
    []
  );

  return (
    <MessageHandlerContext.Provider value={{ handleMessage }}>
      {children}
    </MessageHandlerContext.Provider>
  );
};

export const useMessageHandler = () => {
  const context = useContext(MessageHandlerContext);
  if (!context) {
    throw new Error(
      "useMessageHandler must be used within a MessageHandlerProvider"
    );
  }
  return context;
};


