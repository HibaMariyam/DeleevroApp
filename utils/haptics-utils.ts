// utils/haptics.ts
import * as Haptics from 'expo-haptics';


export const handleHapticFeedback = (hapticMessage: HapticEvent) => {
    switch (hapticMessage.data.hapticType) {
        case 'selection':
            Haptics.selectionAsync();
            break;
        case 'notification':
            handleNotificationFeedback(hapticMessage.data.style as NotificationStyle);
            break;
        case 'impact':
            handleImpactFeedback(hapticMessage.data.style as ImpactStyle);
            break;
        default:
            console.log('Unknown haptic type:', hapticMessage.data.hapticType);
    }
};

const handleNotificationFeedback = (style?: NotificationStyle) => {
    switch (style) {
        case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
        case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
        default:
            console.log('Unknown notification style:', style);
    }
};

const handleImpactFeedback = (style?: ImpactStyle) => {
    switch (style) {
        case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
        case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        case 'rigid':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            break;
        case 'soft':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            break;
        default:
            console.log('Unknown impact style:', style);
    }
};
