import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { IconButton } from 'react-native-paper';
import { authService } from '../services/api';
import { router } from 'expo-router';

export default function TabsLayout() {
  const theme = useTheme();

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerRight: () => (
          <IconButton
            icon="logout"
            onPress={handleLogout}
            iconColor={theme.colors.text}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Todos',
          tabBarIcon: ({ color }) => (
            <IconButton icon="format-list-checks" iconColor={color} />
          ),
        }}
      />
    </Tabs>
  );
} 