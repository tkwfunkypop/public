import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { MODULES, COURSE } from '../data/courseData';

export default function HomeScreen({ navigation }) {
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

  function renderModule({ item }) {
    const lessonCount = item.lessons.length;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Module', { moduleId: item.id })}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.modNumber}>{item.number}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.modTitle}>{item.title}</Text>
          <Text style={styles.modDesc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.lessonCount}>{lessonCount} レッスン</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={MODULES}
        keyExtractor={(item) => item.id}
        renderItem={renderModule}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.school}>{COURSE.school}</Text>
            <Text style={styles.courseTitle}>{COURSE.title}</Text>
            <View style={styles.meta}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{COURSE.totalModules} モジュール</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{totalLessons} レッスン</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{COURSE.instructor}</Text>
              </View>
            </View>
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

  header: {
    paddingTop: 24,
    paddingBottom: 28,
  },
  school: {
    fontSize: 11,
    color: '#ff3b33',
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ece8e2',
    lineHeight: 30,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(236,232,226,0.07)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.1)',
  },
  pillText: {
    fontSize: 12,
    color: '#7f8088',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,16,18,0.9)',
    borderRadius: 10,
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(236,232,226,0.08)',
  },
  cardLeft: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,51,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,51,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff3b33',
    letterSpacing: 1,
  },
  cardBody: { flex: 1 },
  modTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ece8e2',
    marginBottom: 4,
    lineHeight: 20,
  },
  modDesc: {
    fontSize: 12,
    color: '#7f8088',
    lineHeight: 17,
    marginBottom: 6,
  },
  lessonCount: {
    fontSize: 11,
    color: '#4a4a50',
  },
  arrow: {
    fontSize: 22,
    color: '#3a3a40',
    marginLeft: 8,
  },
});
