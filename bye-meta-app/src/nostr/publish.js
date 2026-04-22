import { NDKEvent } from '@nostr-dev-kit/ndk';
import { getNDK } from './ndk';
import { uploadPhotos } from './blossom';
import { saveEntry, updateEntryNostrId } from '../db/store';

/**
 * Build a NIP-68 Kind 20 event from 4 uploaded photos + caption.
 * photoData: [{ url, sha256 }]
 */
function buildNip68Event(ndk, photoData, caption) {
  const event = new NDKEvent(ndk);
  event.kind = 20;
  event.content = caption;
  event.tags = photoData.map(({ url, sha256 }) => [
    'imeta',
    `url ${url}`,
    `x ${sha256}`,
    `m image/jpeg`,
  ]);
  return event;
}

/**
 * Full publish flow:
 * 1. Upload photos to Blossom
 * 2. Build NIP-68 event
 * 3. Store entry locally
 * 4. Return the signed event (caller decides whether to broadcast)
 */
export async function createAndStoreEntry({ photoUris, caption, onProgress }) {
  const ndk = getNDK();
  if (!ndk.signer) throw new Error('No signer');

  // Upload photos (Layer 3)
  const photoData = await uploadPhotos(photoUris, onProgress);
  const remoteUrls = photoData.map(p => p.url);

  // Build + sign event
  const event = buildNip68Event(ndk, photoData, caption);
  await event.sign(ndk.signer);

  // Store locally (Layer 4.4)
  const entryId = await saveEntry(caption, remoteUrls, event.id);

  return { event, entryId };
}

/**
 * Publish a signed NDKEvent to the connected relays.
 */
export async function publishEvent(event) {
  await event.publish();
}
