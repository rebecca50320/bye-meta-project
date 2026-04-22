import { getNDK } from './ndk';
import { pubkeysFromList, fetchList } from './social';

/**
 * Fetch and decrypt all incoming NIP-17 gift-wrapped events (kind 1059)
 * that are addressed to the current user.
 * Returns array of decrypted inner NIP-68 events.
 */
export async function fetchFriendPosts() {
  const ndk = getNDK();
  const signer = ndk.signer;
  if (!signer) return [];

  const user = await signer.user();

  // Fetch following list so we can filter unknown senders
  const followingList = await fetchList(30001).catch(() => null);
  const trustedPubkeys = new Set(pubkeysFromList(followingList));

  // Query for gift-wrapped events addressed to us
  const giftWraps = await ndk.fetchEvents({
    kinds: [1059],
    '#p': [user.pubkey],
    limit: 50,
  });

  const posts = [];

  for (const wrap of giftWraps) {
    try {
      // Unwrap: outer gift wrap → inner seal → plaintext event
      const { NDKGiftUnwrap } = await import('@nostr-dev-kit/ndk');
      const inner = await NDKGiftUnwrap.unwrap(ndk, wrap, signer);
      if (!inner) continue;

      // Validate sender is in following list
      if (trustedPubkeys.size > 0 && !trustedPubkeys.has(inner.pubkey)) continue;

      // Only handle NIP-68 picture posts (kind 20)
      if (inner.kind !== 20) continue;

      const photos = inner.tags
        .filter(t => t[0] === 'imeta')
        .map(tag => {
          const parts = Object.fromEntries(tag.slice(1).map(s => s.split(' ')));
          return { url: parts.url, sha256: parts.x };
        });

      posts.push({
        id: inner.id,
        pubkey: inner.pubkey,
        caption: inner.content,
        photos,
        createdAt: inner.created_at,
      });
    } catch {
      // Skip malformed or undecryptable events
    }
  }

  // Sort newest first
  posts.sort((a, b) => b.createdAt - a.createdAt);
  return posts;
}
