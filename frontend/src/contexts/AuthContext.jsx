import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../config';

const STORAGE_KEY = 'endurancehub_auth_v1';

const AuthContext = createContext();


const parseJSON = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

const buildError = (status, data) => {
  const error = new Error(data?.message || 'Request failed');
  error.status = status;
  const detailList = Array.isArray(data?.details)
    ? data.details
    : Array.isArray(data?.errors)
      ? data.errors
      : [];
  error.details = detailList;
  if (data?.hint) {
    error.hint = data.hint;
  }
  error.payload = data;
  return error;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ accessToken: null, refreshToken: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setTokens({
          accessToken: parsed.tokens?.accessToken || null,
          refreshToken: parsed.tokens?.refreshToken || null
        });
      }
    } catch (error) {
      console.error('Failed to restore auth state', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistAuth = useCallback((nextUser, nextTokens) => {
    setUser(nextUser);
    setTokens(nextTokens);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, tokens: nextTokens })
    );
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokens({ accessToken: null, refreshToken: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!tokens.refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });

    if (!response.ok) {
      clearAuth();
      const data = await parseJSON(response);
      throw buildError(response.status, data);
    }

    const data = await parseJSON(response);
    const nextTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || tokens.refreshToken
    };
    persistAuth(user, nextTokens);
    return nextTokens.accessToken;
  }, [tokens.refreshToken, clearAuth, persistAuth, user]);

  const authFetch = useCallback(
    async (path, options = {}, retry = true) => {
      const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
      };
      let body = options.body;

      if (body && typeof body === 'object' && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
      }

      if (tokens.accessToken) {
        headers.Authorization = `Bearer ${tokens.accessToken}`;
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        body
      });

      if (response.status === 401 && retry && tokens.refreshToken) {
        try {
          await refreshAccessToken();
          return authFetch(path, options, false);
        } catch (error) {
          throw error;
        }
      }

      if (!response.ok) {
        const data = await parseJSON(response);
        throw buildError(response.status, data);
      }

      if (response.status === 204) {
        return null;
      }

      return parseJSON(response);
    },
    [tokens.accessToken, tokens.refreshToken, refreshAccessToken]
  );

  const login = useCallback(
    async (credentials) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const data = await parseJSON(response);
        throw buildError(response.status, data);
      }

      const data = await parseJSON(response);
      persistAuth(data.user, data.tokens);
      return data.user;
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await parseJSON(response);
        throw buildError(response.status, data);
      }

      const data = await parseJSON(response);
      persistAuth(data.user, data.tokens);
      return data.user;
    },
    [persistAuth]
  );

  const logout = useCallback(async () => {
    try {
      if (tokens.refreshToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken })
        });
      }
    } catch (error) {
      console.warn('Failed to revoke refresh token', error);
    } finally {
      clearAuth();
    }
  }, [tokens.refreshToken, clearAuth]);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(user && tokens.accessToken),
      loading,
      login,
      register,
      logout,
      authFetch,
      refreshAccessToken
    }),
    [user, tokens, loading, login, register, logout, authFetch, refreshAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};






