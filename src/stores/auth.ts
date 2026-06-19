import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type AuthMode = 'guest' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  mode: AuthMode;
}

interface StoredAuthState {
  user: AuthUser | null;
}

const STORAGE_KEY = 'floating-image-bubbles:auth:v1';

function getInitials(value: string) {
  const normalized = value.trim();
  if (!normalized) return 'CHL';

  const [first = '', second = ''] = normalized
    .split(/[\s._-]+/)
    .filter(Boolean);
  const initials = `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  return initials || normalized.slice(0, 2).toUpperCase();
}

function readStoredAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredAuthState;
    return parsed.user ?? null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeStoredAuth(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(readStoredAuth());
  const isAuthenticated = computed(() => user.value?.mode === 'user');
  const isGuest = computed(() => user.value?.mode === 'guest');
  const displayName = computed(() => user.value?.name ?? '未登录');

  function signIn(email: string, password: string, remember = true) {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      throw new Error('请输入账号和密码');
    }

    const name = normalizedEmail.split('@')[0] || 'CHL User';
    const nextUser: AuthUser = {
      id: `local:${normalizedEmail.toLowerCase()}`,
      name,
      email: normalizedEmail,
      avatarInitials: getInitials(name),
      mode: 'user'
    };

    user.value = nextUser;
    writeStoredAuth(remember ? nextUser : null);
  }

  function continueAsGuest() {
    const nextUser: AuthUser = {
      id: 'guest',
      name: '游客',
      email: '',
      avatarInitials: '游',
      mode: 'guest'
    };

    user.value = nextUser;
    writeStoredAuth(nextUser);
  }

  function signOut() {
    user.value = null;
    writeStoredAuth(null);
  }

  return {
    user,
    isAuthenticated,
    isGuest,
    displayName,
    signIn,
    continueAsGuest,
    signOut
  };
});
