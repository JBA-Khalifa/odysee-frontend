// @flow
import { useEffect, useState, useMemo } from 'react';
import { pushSubscribe, pushUnsubscribe, pushIsSubscribed } from '$web/src/pushNotifications';
import { isSupported } from 'firebase/messaging';

export default () => {
  const [pushPermission, setPushPermission] = useState(window.Notification.permission);
  const [subscribed, setSubscribed] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    pushIsSubscribed().then((isSubscribed: boolean) => setSubscribed(isSubscribed));
    isSupported().then((supported: boolean) => setPushSupported(supported));
  }, []);

  useMemo(() => setPushEnabled(pushPermission === 'granted' && subscribed), [pushPermission, subscribed]);

  const subscribe = async () => {
    if (await pushSubscribe()) {
      setSubscribed(true);
      setPushPermission(window.Notification.permission);
    }
  };

  const unsubscribe = async () => {
    if (await pushUnsubscribe()) {
      setSubscribed(false);
    }
  };

  const pushToggle = async () => {
    return !pushEnabled ? subscribe() : unsubscribe();
  };

  return {
    pushSupported,
    pushEnabled,
    pushPermission,
    pushToggle,
  };
};
