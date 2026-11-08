/**
 * STRICT MULTI-USER STORAGE ISOLATION & NAMESPACING ENGINE
 * ----------------------------------------------------------------------------
 * Ensures every authenticated user has a 100% isolated localStorage namespace:
 *   `master_english_${user.id}_*`
 *   (including explicit aliases `master_english_${user.id}_progress`
 *    and `master_english_${user.id}_vocab`)
 *
 * Guarantees that Account B NEVER inherits Account A's (or the owner's) profile,
 * level, streak, vocabulary mastery, error bank (Bản Đính Chính), or sessions.
 */

export interface ActiveAuthUserIdentity {
  id: string;
  email: string;
  name: string;
  provider: 'supabase' | 'firebase' | 'local';
}

export const ACTIVE_AUTH_USER_STORAGE_KEY = 'master_english_active_auth_user_v1';
export const VERIFIED_ACCOUNTS_STORAGE_KEY = 'master_english_verified_accounts_v1';
export const AUTH_USER_CHANGED_EVENT = 'master-english-auth-user-changed';
export const OWNER_EMAIL = 'trongthai17072006@gmail.com';

// Global keys that must NEVER be prefixed per user
const GLOBAL_UNSCOPED_KEYS = new Set<string>([
  ACTIVE_AUTH_USER_STORAGE_KEY,
  VERIFIED_ACCOUNTS_STORAGE_KEY,
  'master_english_supabase_auth_v1',
  'master_english_custom_content_v1',
  'master_english_theme_v2',
  'master_english_theme_preference_v2',
  'typing-sound'
]);

// Prefixes of keys that belong to user learning state and MUST be isolated per user.id
const USER_SCOPED_KEY_PREFIXES = [
  'master_english_',
  'leximaster_',
  'ielts_60_',
  'user_writing_logs_',
  'timer_sec_',
  'timer_pos_'
];

type RawStorageMethods = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

let rawStorage: RawStorageMethods | null = null;
let isStoragePatched = false;
let cachedActiveUser: ActiveAuthUserIdentity | null = null;

function getRawStorage(): RawStorageMethods | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  if (!rawStorage) {
    rawStorage = {
      getItem: Storage.prototype.getItem.bind(window.localStorage),
      setItem: Storage.prototype.setItem.bind(window.localStorage),
      removeItem: Storage.prototype.removeItem.bind(window.localStorage)
    };
  }
  return rawStorage;
}

export function sanitizeUserId(rawId: string): string {
  return rawId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function buildDeterministicUserId(email?: string | null, rawUid?: string | null): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail) {
    // Always derive a consistent canonical ID from the email so that logging in via
    // Email/Password, Google OAuth, or Firebase with the same Gmail resolves to the exact same namespace
    return `usr_${sanitizeUserId(cleanEmail)}`;
  }
  if (rawUid && rawUid.trim()) {
    return `uid_${sanitizeUserId(rawUid)}`;
  }
  return 'guest';
}

export function deriveCleanDisplayName(email?: string | null, candidateName?: string | null): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  const trimmedCandidate = (candidateName || '').trim();

  // Never allow a non-owner account to inherit the owner's name
  if (
    cleanEmail !== OWNER_EMAIL &&
    (trimmedCandidate === 'Nguyễn Trọng Thái' ||
      trimmedCandidate === 'Đoàn Trọng Thái' ||
      trimmedCandidate === 'Nguyễn Minh Anh')
  ) {
    return cleanEmail ? cleanEmail.split('@')[0] : 'Học viên mới';
  }

  if (trimmedCandidate) {
    return trimmedCandidate;
  }
  if (cleanEmail) {
    return cleanEmail.split('@')[0];
  }
  return '';
}

export function getActiveAuthUser(): ActiveAuthUserIdentity | null {
  if (cachedActiveUser) return cachedActiveUser;
  const raw = getRawStorage();
  if (!raw) return null;
  try {
    const stored = raw.getItem(ACTIVE_AUTH_USER_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ActiveAuthUserIdentity;
    if (parsed && parsed.id && parsed.email) {
      cachedActiveUser = {
        id: buildDeterministicUserId(parsed.email, parsed.id),
        email: parsed.email.trim().toLowerCase(),
        name: deriveCleanDisplayName(parsed.email, parsed.name),
        provider: parsed.provider || 'local'
      };
      return cachedActiveUser;
    }
  } catch {
    // Ignore malformed JSON
  }
  return null;
}

export function getActiveAuthUserId(): string {
  const user = getActiveAuthUser();
  return user?.id || 'guest';
}

export function isKeyUserScoped(key: string): boolean {
  if (!key || GLOBAL_UNSCOPED_KEYS.has(key)) return false;
  if (key.startsWith('sb-') || key.startsWith('firebase:')) return false;
  if (key.startsWith('master_english_usr_') || key.startsWith('master_english_uid_') || key.startsWith('master_english_guest_')) {
    return false;
  }
  return USER_SCOPED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function getScopedStorageKey(baseKey: string, explicitUserId?: string): string {
  if (!isKeyUserScoped(baseKey)) {
    return baseKey;
  }
  const userId = explicitUserId || getActiveAuthUserId();
  return `master_english_${userId}_${baseKey}`;
}

/**
 * Sets the currently active authenticated user, initializes their isolated namespace,
 * and notifies all contexts/components to immediately flush and reload state.
 */
export function setActiveAuthUser(
  userInput: {
    id?: string | null;
    email: string;
    name?: string | null;
    provider?: 'supabase' | 'firebase' | 'local';
  }
): ActiveAuthUserIdentity {
  const raw = getRawStorage();
  const cleanEmail = userInput.email.trim().toLowerCase();
  const canonicalId = buildDeterministicUserId(cleanEmail, userInput.id);
  const cleanName = deriveCleanDisplayName(cleanEmail, userInput.name);

  const prevUser = getActiveAuthUser();
  const nextUser: ActiveAuthUserIdentity = {
    id: canonicalId,
    email: cleanEmail,
    name: cleanName,
    provider: userInput.provider || 'local'
  };

  cachedActiveUser = nextUser;

  if (raw) {
    try {
      raw.setItem(ACTIVE_AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));

      // Ensure the user's scoped profile has their own clean name & email (never owner's data)
      const scopedProfileKey = `master_english_${canonicalId}_master_english_user_profile_v2`;
      const existingProfileRaw = raw.getItem(scopedProfileKey);
      if (existingProfileRaw) {
        try {
          const parsedProfile = JSON.parse(existingProfileRaw);
          const updatedProfile = {
            ...parsedProfile,
            email: cleanEmail,
            name: deriveCleanDisplayName(cleanEmail, parsedProfile.name || cleanName)
          };
          raw.setItem(scopedProfileKey, JSON.stringify(updatedProfile));
        } catch {}
      } else {
        const freshProfile = {
          name: cleanName,
          email: cleanEmail,
          gender: '',
          dob: '',
          location: '',
          studentCategory: '',
          currentLevel: 'Upper-Intermediate (Band 7.0)',
          examTarget: 'IELTS Academic',
          targetBand: 'BAND 7.0+',
          wordsPerSessionGoal: 15,
          dailyStudyMinutesGoal: 45,
          avatarPose: 'welcome-heart',
          customAvatarUrl: '',
          membership: 'MASTER English Lifetime Pro'
        };
        raw.setItem(scopedProfileKey, JSON.stringify(freshProfile));
      }

      // Also set scoped report recipient strictly to this user's own email
      const scopedRecipientKey = `master_english_${canonicalId}_master_english_report_recipient_v1`;
      raw.setItem(scopedRecipientKey, cleanEmail);
    } catch (err) {
      console.error('[UserStorageScope] Failed to persist active auth user:', err);
    }
  }

  if (
    typeof window !== 'undefined' &&
    (!prevUser ||
      prevUser.id !== nextUser.id ||
      prevUser.email !== nextUser.email ||
      prevUser.name !== nextUser.name)
  ) {
    window.dispatchEvent(
      new CustomEvent(AUTH_USER_CHANGED_EVENT, {
        detail: nextUser
      })
    );
  }

  return nextUser;
}

/**
 * Clears the active authenticated user on Sign Out and resets scope to 'guest',
 * ensuring zero leftover state in memory or guest storage.
 */
export function clearActiveAuthUser(): void {
  const raw = getRawStorage();
  const prevUser = cachedActiveUser;
  cachedActiveUser = null;

  if (raw) {
    try {
      raw.removeItem(ACTIVE_AUTH_USER_STORAGE_KEY);
    } catch {}
  }

  if (typeof window !== 'undefined' && prevUser !== null) {
    window.dispatchEvent(
      new CustomEvent(AUTH_USER_CHANGED_EVENT, {
        detail: null
      })
    );
  }
}

/**
 * Installs transparent localStorage key namespacing so every read/write/remove
 * to user data keys is strictly isolated under `master_english_${user.id}_*`.
 */
export function installUserStorageIsolationPatch(): void {
  if (isStoragePatched || typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  const raw = getRawStorage();
  if (!raw) return;

  isStoragePatched = true;

  Storage.prototype.getItem = function (key: string): string | null {
    if (this !== window.localStorage) {
      return raw.getItem.call(this, key);
    }
    const scopedKey = getScopedStorageKey(key);
    const val = raw.getItem(scopedKey);
    if (val !== null) {
      return val;
    }

    // One-time migration ONLY for the owner account (trongthai17072006@gmail.com)
    // New or different accounts NEVER read from legacy unscoped keys!
    const activeUser = getActiveAuthUser();
    if (activeUser && activeUser.email === OWNER_EMAIL && scopedKey !== key) {
      const legacyVal = raw.getItem(key);
      if (legacyVal !== null) {
        try {
          raw.setItem(scopedKey, legacyVal);
        } catch {}
        return legacyVal;
      }
    }

    return null;
  };

  Storage.prototype.setItem = function (key: string, value: string): void {
    if (this !== window.localStorage) {
      return raw.setItem.call(this, key, value);
    }
    const scopedKey = getScopedStorageKey(key);
    raw.setItem(scopedKey, value);

    // Maintain explicit canonical aliases requested for inspection:
    // `master_english_${user.id}_progress` and `master_english_${user.id}_vocab`
    const userId = getActiveAuthUserId();
    if (key === 'master_english_milestone_store_v1' || key === 'ielts_60_day_challenge_state_v1') {
      try {
        raw.setItem(`master_english_${userId}_progress`, value);
      } catch {}
    } else if (key === 'master_english_word_progress_v2' || key === 'leximaster_mastered_words_v1') {
      try {
        raw.setItem(`master_english_${userId}_vocab`, value);
      } catch {}
    }
  };

  Storage.prototype.removeItem = function (key: string): void {
    if (this !== window.localStorage) {
      return raw.removeItem.call(this, key);
    }
    const scopedKey = getScopedStorageKey(key);
    raw.removeItem(scopedKey);
  };
}

// Auto-install immediately when module is imported
installUserStorageIsolationPatch();
