import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Supabase設定（実際のURLとキーに差し替えてください）
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const stored = await SecureStore.getItemAsync('user_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // セッション復元失敗は無視
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    // ── Supabase実装例（コメントアウトを外して使用）──
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) throw new Error(error.message);
    // const sessionUser = { id: data.user.id, email: data.user.email };
    // await SecureStore.setItemAsync('user_session', JSON.stringify(sessionUser));
    // setUser(sessionUser);

    // ── モック実装（開発用）──
    if (!email || !password) throw new Error('メールアドレスとパスワードを入力してください');
    if (password.length < 6) throw new Error('パスワードは6文字以上です');
    const mockUser = { id: 'mock-user-id', email };
    await SecureStore.setItemAsync('user_session', JSON.stringify(mockUser));
    setUser(mockUser);
  }

  async function signOut() {
    // await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('user_session');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
