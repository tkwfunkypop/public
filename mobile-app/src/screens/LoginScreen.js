import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      Alert.alert('ログイン失敗', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0a0a0b', '#12080b', '#0a0a0b']} style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* ロゴ・タイトル */}
        <View style={styles.header}>
          <Text style={styles.empire}>高橋帝国</Text>
          <Text style={styles.tagline}>会員専用コンテンツ</Text>
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            placeholderTextColor="#4a4a50"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 20 }]}>パスワード</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#4a4a50"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#160606" />
              : <Text style={styles.btnText}>ログイン</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          アカウントをお持ちでない方は購入ページからご登録ください
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  empire: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ece8e2',
    letterSpacing: 4,
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    color: '#7f8088',
    letterSpacing: 2,
  },
  form: {
    backgroundColor: 'rgba(16,16,18,0.9)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.1)',
  },
  label: {
    fontSize: 12,
    color: '#7f8088',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.12)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#ece8e2',
  },
  btn: {
    marginTop: 28,
    backgroundColor: '#ff3b33',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#ff3b33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#160606',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  note: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 12,
    color: '#4a4a50',
    lineHeight: 18,
  },
});
