import * as FileSystem from 'expo-file-system';
import { getNDK } from './ndk';

// Default Blossom server — swap in self-hosted URL for production
const BLOSSOM_SERVER = 'https://nostrmedia.com';

/**
 * Upload a single local photo URI to Blossom.
 * Returns { url, sha256 } on success.
 */
export async function uploadPhoto(localUri) {
  const ndk = getNDK();
  const signer = ndk.signer;
  if (!signer) throw new Error('No signer — identity not initialized');

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', binary);
  const sha256 = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Build Blossom auth event (kind 24242)
  const { NDKEvent } = await import('@nostr-dev-kit/ndk');
  const authEvent = new NDKEvent(ndk);
  authEvent.kind = 24242;
  authEvent.content = 'Upload photo';
  authEvent.tags = [
    ['t', 'upload'],
    ['x', sha256],
    ['expiration', String(Math.floor(Date.now() / 1000) + 60)],
  ];
  await authEvent.sign(signer);
  const authHeader = btoa(JSON.stringify(authEvent.rawEvent()));

  // Upload
  const mimeType = localUri.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const response = await FileSystem.uploadAsync(`${BLOSSOM_SERVER}/upload`, localUri, {
    httpMethod: 'PUT',
    headers: {
      'Authorization': `Nostr ${authHeader}`,
      'Content-Type': mimeType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Blossom upload failed: ${response.status} ${response.body}`);
  }

  const body = JSON.parse(response.body);
  return { url: body.url, sha256: body.sha256 ?? sha256 };
}

/**
 * Upload all 4 photos, returning array of { url, sha256 }.
 * Calls onProgress(completed, total) after each upload.
 */
export async function uploadPhotos(localUris, onProgress) {
  const results = [];
  for (let i = 0; i < localUris.length; i++) {
    const result = await uploadPhoto(localUris[i]);
    results.push(result);
    onProgress?.(i + 1, localUris.length);
  }
  return results;
}
