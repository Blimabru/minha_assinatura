import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarShowLabel: true,
        tabBarStyle: { backgroundColor: colors.backgroundSecondary, borderTopColor: colors.cardBorder },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/discounts-page')}
              style={({ pressed }) => ({
                marginRight: 12,
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 8,
                backgroundColor: '#FF6B00',
              })}
            >
              <FontAwesome name="tags" size={20} color="#fff" />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Assinaturas',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Novo',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color="#fff" />,
          tabBarButton: (props) => (
            <View style={styles.fabContainer}>
              <Pressable
                onPress={() => router.push('/subscriptions/create')}
                style={({ pressed }) => [
                  styles.fab,
                  { opacity: pressed ? 0.85 : 1, backgroundColor: colors.tint },
                ]}
              >
                <FontAwesome name="plus" size={22} color="#fff" />
              </Pressable>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -18,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
