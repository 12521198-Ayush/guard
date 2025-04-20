export const getTokensFromWebView = () => {
  return new Promise((resolve) => {
    // Android path
    if (window.Android && typeof window.Android.getAccessToken === 'function') {
      const accessToken = window.Android.getAccessToken();
      const refreshToken = window.Android.getRefreshToken();
      resolve({ accessToken, refreshToken });
    }
    // iOS path
    else if (window.webkit && window.webkit.messageHandlers) {
      let accessToken = null;
      let refreshToken = null;

      // Define handlers that will be called by the Swift code
      window.onReceiveAccessToken = function(token) {
        accessToken = token;
        if (refreshToken !== null) {
          resolve({ accessToken, refreshToken });
        }
      };

      window.onReceiveRefreshToken = function(token) {
        refreshToken = token;
        if (accessToken !== null) {
          resolve({ accessToken, refreshToken });
        }
      };

      // Trigger native iOS token fetch
      window.webkit.messageHandlers.getAccessToken.postMessage(null);
      window.webkit.messageHandlers.getRefreshToken.postMessage(null);
    }
    // Fallback for browsers or unsupported environments
    else {
      resolve({ accessToken: null, refreshToken: null });
    }
  });
};
