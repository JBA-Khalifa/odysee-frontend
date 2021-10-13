// @flow
import { Lbryio } from 'lbryinc';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken, isSupported } from 'firebase/messaging';
import { browserData } from '$web/src/ua';
import { firebaseConfig, vapidKey } from '$web/src/firebase-config';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const pushSupported: boolean = isSupported();

export const pushSubscribe = async (): Promise<boolean> => {
  try {
    // $FlowIssue[incompatible-type]
    const swRegistration = await navigator.serviceWorker.ready;
    const fcmToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration, vapidKey });

    const type = `web-${window.navigator.userAgentData?.mobile ? 'mobile' : 'desktop'}`;
    const name = `${browserData.browser?.name}-${browserData.os?.name}`;

    await Lbryio.call('cfm', 'add', { token: fcmToken, type, name });

    return true;
  } catch (err) {
    return false;
  }
};

export const pushUnsubscribe = async (): Promise<boolean> => {
  // $FlowIssue[incompatible-type]
  const swRegistration = await navigator.serviceWorker.ready;
  const fcmToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration, vapidKey });
  if (!fcmToken) return true;

  try {
    await deleteToken(messaging);
    // @note: conscious decision not to ignore errors.
    Lbryio.call('cfm', 'remove', { token: fcmToken });
    return true;
  } catch (err) {
    return false;
  }
};

export const pushIsSubscribed = async (): Promise<boolean> => {
  // $FlowIssue[incompatible-type]
  const swRegistration = await navigator.serviceWorker.ready;
  return (await swRegistration.pushManager.getSubscription()) !== null;
};

export const pushCreateNotification = async (data: Object) => {
  // $FlowIssue[incompatible-type]
  navigator.serviceWorker.controller.postMessage({ type: 'BROWSER_NOTIFICATION', data });
};
