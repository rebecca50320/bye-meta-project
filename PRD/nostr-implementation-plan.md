# BYE-META × Nostr: Implementation Plan

## Stack

- **Framework:** React Native / Expo
- **Nostr SDK:** `@nostr-dev-kit/ndk-mobile`
- **Media:** `@nostr-dev-kit/ndk-blossom` + Blossom server
- **Local storage:** SQLite (via NDK Mobile's built-in cache)
- **Encryption:** NIP-17 (gift wrap) + NIP-44 + NIP-59

---

## Milestones

| Milestone | Description |
|---|---|
| M1 | Local diary — write, store, export. No sharing. |
| M2 | Publishing — post a weekly entry to Nostr (public NIP-68) |
| M3 | Social graph — add friends, manage subscriber lists |
| M4 | Private feed — encrypted post → friend receives & reads |
| M5 | Polish — notifications, key export, delete account |

---

## Layer 1 — Identity & Key Management

> Foundation. Everything else depends on this.

- [ ] **1.1** Generate keypair silently on first app launch (`@nostr-dev-kit/ndk-mobile`)
- [ ] **1.2** Store private key in device secure enclave (iOS Keychain / Android Keystore)
- [ ] **1.3** Encrypted key backup to iCloud / Google Drive (critical for device recovery)
- [ ] **1.4** Key export screen — raw `nsec`, gated behind auth, shown with warning
- [ ] **1.5** Key import flow — lets user bring existing Nostr identity into BYE-META
- [ ] **1.6** NIP-05 identifier (optional) — human-readable ID like `user@byemeta.app`

**NIPs:** NIP-01, NIP-05

---

## Layer 2 — Relay Infrastructure

> Communication backbone.

- [ ] **2.1** NDK Mobile initialization with SQLite cache
- [ ] **2.2** Hardcode default relay list (3–4 reliable public relays)
- [ ] **2.3** Publish user's relay preferences as NIP-65 relay list event
- [ ] **2.4** Relay connection health monitoring — silent retry/failover
- [ ] **2.5** Offline mode — reads from local SQLite when no relay connection

**NIPs:** NIP-65

---

## Layer 3 — Media Storage (Blossom)

> Required before any photo publishing.

- [ ] **3.1** Select and configure default Blossom server (run own or use `nostrmedia.com` for v1)
- [ ] **3.2** Photo upload pipeline: local → Blossom → SHA-256 URL (`@nostr-dev-kit/ndk-blossom`)
- [ ] **3.3** Upload progress + error handling in UI
- [ ] **3.4** Cache downloaded friend photos locally (avoid re-fetching)

**NIPs:** NIP-B7 (Blossom)

---

## Layer 4 — Publishing Weekly Posts

> Core write path.

- [ ] **4.1** Compose weekly entry UI: select 4 photos + write captions
- [ ] **4.2** Trigger Blossom upload for selected photos, collect URLs + hashes
- [ ] **4.3** Build NIP-68 Kind 20 event with `imeta` tags (4 image refs + caption)
- [ ] **4.4** Store event locally in SQLite as canonical source of truth
- [ ] **4.5** Fetch subscriber list from NIP-51 private encrypted list
- [ ] **4.6** Gift-wrap NIP-68 event for each subscriber (NIP-17 + NIP-59 + NIP-44)
- [ ] **4.7** Publish gift-wrapped events to each subscriber's preferred relay (via NIP-65 lookup)
- [ ] **4.8** Track publish state locally (published / pending / failed); support retry

**NIPs:** NIP-68, NIP-51, NIP-17, NIP-59, NIP-44, NIP-65

---

## Layer 5 — Social Graph

> Who can share with whom.

- [ ] **5.1** Profile screen: display your `npub` + QR code
- [ ] **5.2** Add friend flow: paste `npub` or scan QR → look up their profile metadata
- [ ] **5.3** Send subscription request: encrypted NIP-17 message ("I want to follow you")
- [ ] **5.4** Incoming subscription request inbox — approve adds requester to your NIP-51 subscriber list
- [ ] **5.5** Manage subscriber list: view / remove subscribers (NIP-51 encrypted list)
- [ ] **5.6** Manage following list: friends you receive posts from (NIP-51 encrypted list)
- [ ] **5.7** Remove subscriber / unsubscribe from a friend → update NIP-51 list event

**NIPs:** NIP-01, NIP-17, NIP-51

---

## Layer 6 — Feed (Reading Friends' Posts)

> Core read path.

- [ ] **6.1** Query relays for incoming NIP-17 gift-wrapped events (kind 1059, `p` tag = own pubkey)
- [ ] **6.2** Unwrap and decrypt gift-wrapped events (outer gift wrap → inner seal → NIP-68 post)
- [ ] **6.3** Validate decrypted event pubkey against following list
- [ ] **6.4** Store decrypted friend events in local SQLite
- [ ] **6.5** Render friend's 4-photo grid + captions from `imeta` tags
- [ ] **6.6** Weekly feed view: only show the current week's entries (no infinite scroll)
- [ ] **6.7** "No new posts yet" empty state — absence of content is intentional

**NIPs:** NIP-17, NIP-59, NIP-44, NIP-68

---

## Layer 7 — Notifications

> Lightweight, non-addictive.

- [ ] **7.1** Sunday evening local push: "Time to write your weekly entry" (OS-level scheduled, no server)
- [ ] **7.2** "Your friends posted this week" notification — batched, not per-post
- [ ] **7.3** Notification settings screen: toggle each notification type independently

---

## Layer 8 — Data Sovereignty & Export

> The promise to the user. Independent of other layers — can ship any time after Layer 1.

- [ ] **8.1** Export diary archive: all entries as JSON + local photos (no relay dependency)
- [ ] **8.2** Export identity keypair (`nsec`) — gated behind auth
- [ ] **8.3** Delete account: wipe local data + broadcast NIP-09 deletion events to relays

**NIPs:** NIP-09

---

## Dependency Order

```
Layer 1 (Identity)
    └── Layer 2 (Relays)
            └── Layer 3 (Media)
                    └── Layer 4.1–4.4 (Compose + local store)   ← M1
                            └── Layer 4.5–4.8 (Private publish)  ← M2 → M4
Layer 5 (Social Graph) ──────────────────────────────────────── ← M3
    └── Layer 6 (Feed) ─────────────────────────────────────── ← M4
            └── Layer 7 (Notifications) ──────────────────────── ← M5
Layer 8 (Export) — independent, after Layer 1 ────────────────── ← M1 or M5
```

---

## Key NIPs Reference

| NIP | Purpose |
|---|---|
| NIP-01 | Base protocol: keypairs, events, relay communication |
| NIP-05 | Human-readable identifiers (`user@domain.com`) |
| NIP-09 | Event deletion requests |
| NIP-17 | Private direct messages (gift-wrapped, no metadata leak) |
| NIP-44 | Versioned encryption (used inside NIP-17) |
| NIP-51 | Lists (used for private subscriber + following lists) |
| NIP-59 | Gift wrap (outer envelope for NIP-17 hiding sender identity) |
| NIP-65 | Relay list metadata (where to deliver events to a user) |
| NIP-68 | Picture-first posts (Kind 20, multi-image with `imeta` tags) |
| NIP-B7 | Blossom media storage (content-addressed binary file hosting) |
