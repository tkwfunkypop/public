import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>受講生</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHead}>講座情報</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>コース</Text>
            <Text style={styles.rowValue}>AE Short Course</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>スクール</Text>
            <Text style={styles.rowValue}>高橋帝国</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0b' },
  container: { flex: 1, alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,59,51,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,59,51,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#ff3b33' },
  email: { fontSize: 16, color: '#ece8e2', fontWeight: '600', marginBottom: 4 },
  role: { fontSize: 12, color: '#7f8088', letterSpacing: 2, marginBottom: 36 },

  section: {
    width: '100%',
    backgroundColor: 'rgba(16,16,18,0.9)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.08)',
    marginBottom: 32,
  },
  sectionHead: {
    fontSize: 11,
    color: '#4a4a50',
    letterSpacing: 2,
    marginBottom: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(236,232,226,0.06)',
  },
  rowLabel: { fontSize: 14, color: '#7f8088' },
  rowValue: { fontSize: 14, color: '#ece8e2', fontWeight: '600' },

  logoutBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,59,51,0.3)',
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, color: '#ff3b33', fontWeight: '600' },
});
