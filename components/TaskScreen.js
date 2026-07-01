import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Custom SVG Icon
const ClipboardIcon = ({ color = '#6236FF' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function TaskScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Header */}
        <Animated.View entering={FadeInUp.springify().damping(12)} style={styles.header}>
          <View style={styles.titleWrapper}>
            <ClipboardIcon color="#6236FF" />
            <Text style={styles.title}>Tasks & Checklist</Text>
          </View>
          <Text style={styles.subtitle}>Complete your daily checklist to maintain your performance streak.</Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 24,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 24,
    color: '#1E1B4B',
  },
  subtitle: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#8A94A6',
    lineHeight: 20,
  },
});
