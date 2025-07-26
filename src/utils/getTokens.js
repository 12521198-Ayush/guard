export const getTokensFromWebView = () => {
  return new Promise((resolve) => {
    // Android path
    if (
      window.Android &&
      typeof window.Android.getAccessToken === 'function' &&
      typeof window.Android.getRefreshToken === 'function' &&
      typeof window.Android.getFCMId === 'function'
    ) {
      const accessToken = window.Android.getAccessToken();
      const refreshToken = window.Android.getRefreshToken();
      const fcm_token = window.Android.getFCMId();
      resolve({ accessToken, refreshToken, fcm_token });
    }

    // iOS path
    else if (window.webkit && window.webkit.messageHandlers) {
      let accessToken = null;
      let refreshToken = null;
      let fcm_token = null;

      // Helper to check if all are received
      const tryResolve = () => {
        if (accessToken !== null && refreshToken !== null && fcm_token !== null) {
          resolve({ accessToken, refreshToken, fcm_token });
        }
      };

      window.onReceiveAccessToken = function (token) {
        accessToken = token;
        tryResolve();
      };

      window.onReceiveRefreshToken = function (token) {
        refreshToken = token;
        tryResolve();
      };

      window.onReceiveFcmToken = function (token) {
        fcm_token = token;
        tryResolve();
      };

      window.webkit.messageHandlers.getAccessToken.postMessage(null);
      window.webkit.messageHandlers.getRefreshToken.postMessage(null);
      window.webkit.messageHandlers.getFCMId.postMessage(null);
    }

    else {
      resolve({ accessToken: null, refreshToken: null, fcm_token: null });
    }
  });
};
