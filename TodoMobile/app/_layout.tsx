import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from './theme';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './services/api';
import { TodoProvider } from './contexts/TodoContext';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !refreshToken && !inAuthGroup) {
          router.replace('/login');
        } else if (token && inAuthGroup) {
          router.replace('/(tabs)');
        } else if (!token && refreshToken && !inAuthGroup) {
          try {
            await authService.refreshToken();
            router.replace('/(tabs)');
          } catch (error) {
            console.error('Token refresh failed:', error);
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [segments]);

  return (
    <PaperProvider theme={theme}>
      <TodoProvider>
        <Stack>
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="create"
            options={{
              title: 'Create Todo',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="edit/[id]"
            options={{
              title: 'Edit Todo',
              presentation: 'modal',
            }}
          />
        </Stack>
      </TodoProvider>
    </PaperProvider>
  );
}
