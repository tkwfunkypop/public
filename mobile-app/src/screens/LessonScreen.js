import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import YoutubeIframe from 'react-native-youtube-iframe';
import { MODULES } from '../data/courseData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = Math.round(SCREEN_WIDTH * (9 / 16));

function YouTubePlayer({ videoId }) {
  const [playing, setPlaying] = useState(false);

  return (
    <YoutubeIframe
      height={VIDEO_HEIGHT}
      width={SCREEN_WIDTH}
      videoId={videoId}
      play={playing}
      onChangeState={(state) => {
        if (state === 'ended') setPlaying(false);
      }}
    />
  );
}

function MP4Player({ videoUrl }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT, backgroundColor: '#000' }}>
      {loading && (
        <View style={playerStyles.loadingOverlay}>
          <ActivityIndicator color="#ff3b33" size="large" />
        </View>
      )}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onLoad={() => setLoading(false)}
      />
    </View>
  );
}

export default function LessonScreen({ route }) {
  const { lessonId, moduleId } = route.params;
  const mod = MODULES.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  if (!mod || !lesson) return null;

  const lessonIndex = mod.lessons.findIndex((l) => l.id === lessonId);
  const isPlaceholder =
    lesson.videoId === 'REPLACE_YOUTUBE_ID' || lesson.videoUrl === 'REPLACE_MP4_URL';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} bounces={false}>
        {/* 動画プレーヤー */}
        <View style={styles.playerArea}>
          {isPlaceholder ? (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>▶</Text>
              <Text style={styles.placeholderText}>動画URLを設定してください</Text>
              <Text style={styles.placeholderHint}>src/data/courseData.js を編集</Text>
            </View>
          ) : lesson.videoType === 'youtube' ? (
            <YouTubePlayer videoId={lesson.videoId} />
          ) : (
            <MP4Player videoUrl={lesson.videoUrl} />
          )}
        </View>

        {/* レッスン情報 */}
        <View style={styles.info}>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>MODULE {mod.number}</Text>
            <Text style={styles.breadcrumbSep}> › </Text>
            <Text style={styles.breadcrumbText}>
              Lesson {String(lessonIndex + 1).padStart(2, '0')}
            </Text>
          </View>

          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{lesson.duration}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {lesson.videoType === 'youtube' ? 'YouTube' : 'MP4'}
              </Text>
            </View>
            {lesson.free && (
              <View style={[styles.badge, styles.badgeFree]}>
                <Text style={[styles.badgeText, { color: '#ff3b33' }]}>無料公開</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* モジュール概要 */}
          <Text style={styles.sectionHead}>このモジュールについて</Text>
          <Text style={styles.moduleDesc}>{mod.description}</Text>

          {/* 同モジュールの他のレッスン */}
          <Text style={[styles.sectionHead, { marginTop: 24 }]}>このモジュールのレッスン</Text>
          {mod.lessons.map((l, i) => (
            <View
              key={l.id}
              style={[styles.otherLesson, l.id === lessonId && styles.otherLessonActive]}
            >
              <Text style={[styles.otherNum, l.id === lessonId && { color: '#ff3b33' }]}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Text
                style={[
                  styles.otherTitle,
                  l.id === lessonId && { color: '#ece8e2', fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {l.title}
              </Text>
              <Text style={styles.otherDuration}>{l.duration}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0b' },
  scroll: { flex: 1 },
  playerArea: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0f',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,59,51,0.2)',
  },
  placeholderIcon: { fontSize: 36, marginBottom: 12 },
  placeholderText: { fontSize: 14, color: '#7f8088', marginBottom: 6 },
  placeholderHint: { fontSize: 11, color: '#3a3a40', fontStyle: 'italic' },

  info: { padding: 20 },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  breadcrumbText: { fontSize: 11, color: '#ff3b33', letterSpacing: 2, fontWeight: '700' },
  breadcrumbSep: { fontSize: 11, color: '#3a3a40' },

  lessonTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ece8e2',
    lineHeight: 28,
    marginBottom: 14,
  },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: 'rgba(236,232,226,0.07)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.1)',
  },
  badgeFree: {
    backgroundColor: 'rgba(255,59,51,0.1)',
    borderColor: 'rgba(255,59,51,0.25)',
  },
  badgeText: { fontSize: 12, color: '#7f8088' },

  divider: {
    height: 1,
    backgroundColor: 'rgba(236,232,226,0.08)',
    marginVertical: 20,
  },
  sectionHead: {
    fontSize: 11,
    color: '#4a4a50',
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: '600',
  },
  moduleDesc: {
    fontSize: 14,
    color: '#7f8088',
    lineHeight: 22,
  },

  otherLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(236,232,226,0.05)',
  },
  otherLessonActive: {
    backgroundColor: 'rgba(255,59,51,0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  otherNum: { fontSize: 11, color: '#3a3a40', width: 26, fontWeight: '700' },
  otherTitle: { flex: 1, fontSize: 13, color: '#7f8088', marginLeft: 4 },
  otherDuration: { fontSize: 11, color: '#4a4a50', marginLeft: 8 },
});

const playerStyles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
});
