// @flow
import { Lbryio } from 'lbryinc';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { browserData } from '$web/src/ua';
import { firebaseConfig, vapidKey } from '$web/src/firebase-config';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const metaData = () => {
  const isMobile = window.navigator.userAgentData?.mobile || false;
  const browserName = browserData.browser?.name || 'unknown';
  const osName = browserData.os?.name || 'unknown';

  return {
    type: `web-${isMobile ? 'mobile' : 'desktop'}`,
    name: `${browserName}-${osName}`,
  };
};

export const pushSubscribe = async (): Promise<boolean> => {
  try {
    const swRegistration: ?ServiceWorkerRegistration = await navigator.serviceWorker?.ready;
    const fcmToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration, vapidKey });
    await Lbryio.call('cfm', 'add', { token: fcmToken, ...metaData() });
    return true;
  } catch (err) {
    return false;
  }
};

export const pushUnsubscribe = async (): Promise<boolean> => {
  const swRegistration: ?ServiceWorkerRegistration = await navigator.serviceWorker?.ready;
  const fcmToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration, vapidKey });
  if (!fcmToken) return true;

  try {
    await deleteToken(messaging);
    Lbryio.call('cfm', 'remove', { token: fcmToken }); // @note: conscious decision to not handle response/errors.
    return true;
  } catch (err) {
    return false;
  }
};

export const pushIsSubscribed = async (): Promise<boolean> => {
  const swRegistration: ?ServiceWorkerRegistration = await navigator.serviceWorker?.ready;
  return swRegistration && swRegistration.pushManager
    ? (await swRegistration.pushManager.getSubscription()) !== null
    : false;
};
