import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { MODULES } from '../data/courseData';

function LockIcon() {
  return <Text style={{ fontSize: 13, color: '#4a4a50' }}>🔒</Text>;
}

function PlayIcon() {
  return (
    <View style={lessonStyles.playBtn}>
      <Text style={{ fontSize: 10, color: '#160606' }}>▶</Text>
    </View>
  );
}

export default function ModuleScreen({ route, navigation }) {
  const { moduleId } = route.params;
  const mod = MODULES.find((m) => m.id === moduleId);

  if (!mod) return null;

  function renderLesson({ item, index }) {
    return (
      <TouchableOpacity
        style={lessonStyles.row}
        onPress={() => navigation.navigate('Lesson', { lessonId: item.id, moduleId })}
        activeOpacity={0.75}
      >
        <Text style={lessonStyles.num}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={lessonStyles.info}>
          <Text style={lessonStyles.title}>{item.title}</Text>
          <View style={lessonStyles.meta}>
            <Text style={lessonStyles.duration}>{item.duration}</Text>
            {item.free && (
              <View style={lessonStyles.freeBadge}>
                <Text style={lessonStyles.freeText}>無料公開</Text>
              </View>
            )}
            <Text style={lessonStyles.videoType}>
              {item.videoType === 'youtube' ? 'YouTube' : 'MP4'}
            </Text>
          </View>
        </View>
        {item.free ? <PlayIcon /> : <LockIcon />}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={mod.lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.modNum}>MODULE {mod.number}</Text>
            <Text style={styles.modTitle}>{mod.title}</Text>
            <Text style={styles.modDesc}>{mod.description}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>レッスン一覧</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0b' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { paddingTop: 20, paddingBottom: 8 },
  modNum: {
    fontSize: 11,
    color: '#ff3b33',
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
  },
  modTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ece8e2',
    lineHeight: 28,
    marginBottom: 12,
  },
  modDesc: {
    fontSize: 14,
    color: '#7f8088',
    lineHeight: 22,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(236,232,226,0.08)',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#4a4a50',
    letterSpacing: 2,
    marginBottom: 12,
  },
});

const lessonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,16,18,0.9)',
    borderRadius: 10,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.07)',
  },
  num: {
    fontSize: 12,
    color: '#3a3a40',
    fontWeight: '700',
    width: 28,
    letterSpacing: 1,
  },
  info: { flex: 1, marginLeft: 4 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ece8e2',
    marginBottom: 5,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: { fontSize: 12, color: '#7f8088' },
  freeBadge: {
    backgroundColor: 'rgba(255,59,51,0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeText: { fontSize: 10, color: '#ff3b33', fontWeight: '700' },
  videoType: { fontSize: 11, color: '#4a4a50' },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff3b33',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
