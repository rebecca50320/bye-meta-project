import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { getNDK } from './ndk';

// NIP-51 list kinds used by bye-meta
const KIND_SUBSCRIBERS = 30000; // people who receive your posts (private encrypted)
const KIND_FOLLOWING = 30001;   // people whose posts you receive (private encrypted)

/**
 * Fetch a NIP-51 private list event for the current user.
 * Returns the NDKEvent or null if not found.
 */
export async function fetchList(kind) {
  const ndk = getNDK();
  const user = await ndk.signer?.user();
  if (!user) throw new Error('Not signed in');

  const events = await ndk.fetchEvents({
    kinds: [kind],
    authors: [user.pubkey],
    limit: 1,
  });
  return events.size > 0 ? [...events][0] : null;
}

/**
 * Return array of pubkeys from a NIP-51 list event's 'p' tags.
 */
export function pubkeysFromList(event) {
  if (!event) return [];
  return event.tags.filter(t => t[0] === 'p').map(t => t[1]);
}

/**
 * Publish an updated NIP-51 list with the new set of pubkeys.
 */
async function publishList(kind, pubkeys) {
  const ndk = getNDK();
  const event = new NDKEvent(ndk);
  event.kind = kind;
  event.content = '';
  event.tags = pubkeys.map(pk => ['p', pk]);
  await event.sign(ndk.signer);
  await event.publish();
  return event;
}

/**
 * Add a pubkey to the subscriber list (people you send posts to).
 */
export async function addSubscriber(pubkey) {
  const existing = await fetchList(KIND_SUBSCRIBERS);
  const current = pubkeysFromList(existing);
  if (current.includes(pubkey)) return;
  return publishList(KIND_SUBSCRIBERS, [...current, pubkey]);
}

/**
 * Remove a pubkey from the subscriber list.
 */
export async function removeSubscriber(pubkey) {
  const existing = await fetchList(KIND_SUBSCRIBERS);
  const current = pubkeysFromList(existing).filter(pk => pk !== pubkey);
  return publishList(KIND_SUBSCRIBERS, current);
}

/**
 * Add a pubkey to the following list (people whose posts you receive).
 */
export async function addFollowing(pubkey) {
  const existing = await fetchList(KIND_FOLLOWING);
  const current = pubkeysFromList(existing);
  if (current.includes(pubkey)) return;
  return publishList(KIND_FOLLOWING, [...current, pubkey]);
}

/**
 * Remove from following list.
 */
export async function removeFollowing(pubkey) {
  const existing = await fetchList(KIND_FOLLOWING);
  const current = pubkeysFromList(existing).filter(pk => pk !== pubkey);
  return publishList(KIND_FOLLOWING, current);
}

/**
 * Send a NIP-17 subscription request DM to a user.
 * Kind 14 sealed inside kind 1059 gift wrap.
 */
export async function sendSubscriptionRequest(recipientPubkey) {
  const ndk = getNDK();
  const recipient = ndk.getUser({ pubkey: recipientPubkey });
  const dm = new NDKEvent(ndk);
  dm.kind = 14;
  dm.content = 'I want to follow you on BYE-META.';
  dm.tags = [['p', recipientPubkey]];
  await dm.sign(ndk.signer);

  // Gift-wrap (NIP-59)
  const { NDKGiftWrap } = await import('@nostr-dev-kit/ndk');
  const wrapped = await NDKGiftWrap.wrap(ndk, dm, [recipient]);
  for (const w of wrapped) await w.publish();
}

/**
 * Fetch profile metadata for a pubkey.
 */
export async function fetchProfile(pubkey) {
  const ndk = getNDK();
  const user = ndk.getUser({ pubkey });
  await user.fetchProfile();
  return user.profile;
}
