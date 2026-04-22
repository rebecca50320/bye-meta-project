import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import * as SecureStore from 'expo-secure-store';

const NSEC_KEY = 'byemeta-nsec';

/**
 * Returns the stored signer, or generates and stores a new keypair on first launch.
 */
export async function getOrCreateKeypair() {
  const existing = await SecureStore.getItemAsync(NSEC_KEY);
  if (existing) {
    return new NDKPrivateKeySigner(existing);
  }
  const signer = NDKPrivateKeySigner.generate();
  await SecureStore.setItemAsync(NSEC_KEY, signer.nsec);
  return signer;
}

/**
 * Import an existing nsec into secure storage, replacing the current key.
 */
export async function importNsec(nsec) {
  const signer = new NDKPrivateKeySigner(nsec);
  await SecureStore.setItemAsync(NSEC_KEY, nsec);
  return signer;
}

/**
 * Return the raw nsec — only call from the key export screen.
 */
export async function exportNsec() {
  return SecureStore.getItemAsync(NSEC_KEY);
}

/**
 * Wipe identity from secure storage.
 */
export async function deleteIdentity() {
  await SecureStore.deleteItemAsync(NSEC_KEY);
}
