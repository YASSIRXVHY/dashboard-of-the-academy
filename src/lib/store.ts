import { create } from 'zustand';

export type Page = 'login' | 'dashboard' | 'groups' | 'payments' | 'teachers';

interface AdminInfo {
  id: string;
  name: string;
  username: string;
}

interface AppState {
  currentPage: Page;
  token: string | null;
  admin: AdminInfo | null;
  selectedGroupId: string | null;

  // Navigation
  setPage: (page: Page) => void;
  setSelectedGroupId: (id: string | null) => void;

  // Auth
  login: (token: string, admin: AdminInfo) => void;
  logout: () => void;

  // Computed
  isAuthenticated: () => boolean;
}

const loadAuthFromStorage = (): { token: string | null; admin: AdminInfo | null } => {
  if (typeof window === 'undefined') return { token: null, admin: null };
  const token = localStorage.getItem('aa_token');
  const adminStr = localStorage.getItem('aa_admin');
  if (token && adminStr) {
    try {
      return { token, admin: JSON.parse(adminStr) };
    } catch {
      return { token: null, admin: null };
    }
  }
  return { token: null, admin: null };
};

const saveAuthToStorage = (token: string | null, admin: AdminInfo | null) => {
  if (typeof window === 'undefined') return;
  if (token && admin) {
    localStorage.setItem('aa_token', token);
    localStorage.setItem('aa_admin', JSON.stringify(admin));
  } else {
    localStorage.removeItem('aa_token');
    localStorage.removeItem('aa_admin');
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'login',
  token: null,
  admin: null,
  selectedGroupId: null,

  setPage: (page) => set({ currentPage: page }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  login: (token, admin) => {
    saveAuthToStorage(token, admin);
    set({ token, admin, currentPage: 'dashboard', selectedGroupId: null });
  },

  logout: () => {
    saveAuthToStorage(null, null);
    set({ token: null, admin: null, currentPage: 'login', selectedGroupId: null });
  },

  isAuthenticated: () => {
    const state = get();
    return !!state.token && !!state.admin;
  },
}));

// Initialize auth from localStorage on client side
if (typeof window !== 'undefined') {
  const { token, admin } = loadAuthFromStorage();
  if (token && admin) {
    useAppStore.setState({ token, admin, currentPage: 'dashboard' });
  }
}
