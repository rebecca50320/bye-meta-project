import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, typography } from '../src/theme';
import { useNDKInit } from '@nostr-dev-kit/ndk-mobile';
import { getNDK, sessionStore } from '../src/nostr/ndk';
import { getOrCreateKeypair } from '../src/nostr/identity';
import { migrateLegacyLogin } from '@nostr-dev-kit/ndk-mobile';
import { requestPermissions, scheduleSundayReminder } from '../src/notifications';

export default function Layout() {
  const initializeNDK = useNDKInit();

  useEffect(() => {
    async function bootstrap() {
      const ndk = getNDK();
      initializeNDK(ndk);

      await migrateLegacyLogin(sessionStore);

      const signer = await getOrCreateKeypair();
      ndk.signer = signer;

      await ndk.connect();

      const granted = await requestPermissions();
      if (granted) await scheduleSundayReminder();
    }
    bootstrap().catch(console.error);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.accent,
          headerTitleStyle: { ...typography.title },
          headerShadowVisible: false,
        }}
      >
        {/* Tab root — no header, tabs handle their own */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal + stack screens */}
        <Stack.Screen name="new-entry" options={{ presentation: 'modal', title: '' }} />
        <Stack.Screen name="profile" options={{ title: 'profile' }} />
        <Stack.Screen name="import-key" options={{ title: 'import key', presentation: 'modal' }} />
        <Stack.Screen name="friends" options={{ title: 'friends' }} />
      </Stack>
    </>
  );
}
