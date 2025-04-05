export const getTokensFromWebView = () => {
    return new Promise((resolve) => {
      // Check if running in a WebView with the Android interface
      if (window.Android && typeof window.Android.getAccessToken === 'function') {
        const accessToken = window.Android.getAccessToken();
        const refreshToken = window.Android.getRefreshToken();
        resolve({ accessToken, refreshToken });
      } else {
        // Fallback if not in WebView (e.g., running in a browser)
        resolve({ accessToken: null, refreshToken: null });
      }
    });
  };