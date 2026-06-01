import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AppDatabaseProvider from '@/database/providers/DatabaseProvider';
import BatteryOptimizationProvider from '@/components/BatteryOptimizationProvider';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { SyncProvider } from '@/src/contexts/SyncContext';
import { useExchangeRateSync } from '@/src/hooks/useExchangeRateSync';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  useExchangeRateSync();
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to the login screen if deslogado
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to the main application if logado
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  return (
    <AppDatabaseProvider>
      <SyncProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <BatteryOptimizationProvider />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="subscriptions" options={{ headerShown: false }} />
            <Stack.Screen name="discounts-page/index" options={{ title: 'Cupons' }} />
          </Stack>
        </ThemeProvider>
      </SyncProvider>
    </AppDatabaseProvider>
  );
}
