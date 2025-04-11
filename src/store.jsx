import { create } from 'zustand';
import { supabase } from './supabase';

const useStore = create((set, get) => ({
  favorites: [],
  playlists: {},
  currentPlaylist: null,
  user: null,
  isAuthenticated: false,
  authLoading: true,
  spotifyToken: null,

  initializeAuth: async () => {
    try {
      console.log('Initializing auth...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!session) {
        console.log('No active session found');
        set({ user: null, isAuthenticated: false, authLoading: false });
        return null;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      console.log('User session found:', user);
      set({ user, isAuthenticated: true, authLoading: false });
      return user;
    } catch (error) {
      console.error('Initialize auth error:', error.message);
      set({ user: null, isAuthenticated: false, authLoading: false });
      return null;
    }
  },

  setUser: (user) => {
    console.log('Setting user:', user);
    set({ user, isAuthenticated: !!user, authLoading: false });
  },

  setSpotifyToken: (token) => set({ spotifyToken: token }),

  signup: async (email, password) => {
    try {
      console.log('Signing up:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      console.log('Signup successful:', data.user);
      set({ user: data.user, isAuthenticated: !!data.user, authLoading: false });
      return data;
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      console.log('Logging in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      console.log('Login successful:', data.user);
      set({ user: data.user, isAuthenticated: true, authLoading: false });
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('Logging out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log('Logout successful');
      set({
        user: null,
        isAuthenticated: false,
        favorites: [],
        playlists: {},
        currentPlaylist: null,
        authLoading: false,
        spotifyToken: null,
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  },

  addToFavorites: (track) =>
    set((state) => ({
      favorites: state.favorites.some((t) => t.src === track.src)
        ? state.favorites
        : [...state.favorites, track],
    })),

  removeFromFavorites: (track) =>
    set((state) => ({
      favorites: state.favorites.filter((t) => t.src !== track.src),
    })),

  createPlaylist: (name) =>
    set((state) => ({
      playlists: { ...state.playlists, [name]: [] },
      currentPlaylist: name,
    })),

  addToPlaylist: (track, playlistName) =>
    set((state) => ({
      playlists: {
        ...state.playlists,
        [playlistName]: state.playlists[playlistName]
          ? [...state.playlists[playlistName], track]
          : [track],
      },
    })),

  removeFromPlaylist: (track, playlistName) =>
    set((state) => ({
      playlists: {
        ...state.playlists,
        [playlistName]: state.playlists[playlistName].filter((t) => t.src !== track.src),
      },
    })),

  setCurrentPlaylist: (name) => set({ currentPlaylist: name }),
}));

export default useStore;