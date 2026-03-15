import { useRef, useState, useCallback } from 'react'
import { SafeAreaView, StyleSheet, StatusBar, BackHandler, Platform, ActivityIndicator, View } from 'react-native'
import { WebView } from 'react-native-webview'
import Constants from 'expo-constants'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

const WEB_APP_URL = Constants.expoConfig?.extra?.webAppUrl || 'https://professoryx.vercel.app'

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const onLoadEnd = useCallback(() => {
    setIsLoading(false)
    SplashScreen.hideAsync()
  }, [])

  // Handle Android back button
  if (Platform.OS === 'android') {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onLoadEnd={onLoadEnd}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
        overScrollMode="never"
        setBuiltInZoomControls={false}
        // Inject dark status bar / viewport styles
        injectedJavaScript={`
          document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#030712');
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
          document.head.appendChild(meta);
          true;
        `}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  webview: {
    flex: 1,
    backgroundColor: '#030712',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
    zIndex: 10,
  },
})
