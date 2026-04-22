import NDK from '@nostr-dev-kit/ndk-mobile';
import { NDKSessionExpoSecureStore } from '@nostr-dev-kit/ndk-mobile';
import { NDKCacheAdapterSqlite } from '@nostr-dev-kit/ndk-mobile';

export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.primal.net',
];

let ndkInstance = null;

export function getNDK() {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: DEFAULT_RELAYS,
      cacheAdapter: new NDKCacheAdapterSqlite('byemeta-ndk'),
    });
  }
  return ndkInstance;
}

export const sessionStore = new NDKSessionExpoSecureStore();
