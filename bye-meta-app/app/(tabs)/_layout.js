import { Tabs } from 'expo-router';
import { BookOpen, Users } from 'lucide-react-native';
import { colors, typography } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { ...typography.title },
        headerShadowVisible: false,
        headerTintColor: colors.accent,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 6,
          height: 60,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'my week',
          tabBarLabel: 'my week',
          tabBarIcon: ({ color, size }) => <BookOpen size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'friends',
          tabBarLabel: 'friends',
          tabBarIcon: ({ color, size }) => <Users size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
