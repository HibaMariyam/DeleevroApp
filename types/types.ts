// General event type
type GeneralEvent<T = any> = {
    type: string;
    data: T;
  };
  
 

  type HapticEvent = GeneralEvent<{
    hapticType: 'selection' | 'notification' | 'impact';
    style?: string; 
  }>;
  


type NotificationStyle = 'success' | 'error' | 'warning';
type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

