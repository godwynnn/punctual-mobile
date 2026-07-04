import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { 
  FadeInUp,
  Layout 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Custom SVG Icons
const FilterIcon = ({ color = '#6236FF' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockInIcon = ({ color = '#6236FF' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockOutIcon = ({ color = '#8E9AA6' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function HistoryScreen({ activities }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');

  // Filter activities based on selection
  const filteredActivities = activities.filter(activity => {
    if (filter === 'All') return true;
    return activity.status === filter;
  });

  // Calculate statistics
  const totalPunches = activities.length;
  const onTimeCount = activities.filter(a => a.status === 'On Time').length;
  const punctualityRate = totalPunches > 0 ? Math.round((onTimeCount / totalPunches) * 100) : 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity History</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <FilterIcon color="#6236FF" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.bgLightPurple]}>
          <Text style={styles.summaryLabel}>Total Logs</Text>
          <Text style={styles.summaryValue}>{totalPunches}</Text>
        </View>
        <View style={[styles.summaryCard, styles.bgLightGreen]}>
          <Text style={styles.summaryLabel}>Punctuality</Text>
          <Text style={styles.summaryValue}>{punctualityRate}%</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['All', 'On Time', 'Late'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterTab, filter === type && styles.activeFilterTab]}
            onPress={() => setFilter(type)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === type && styles.activeFilterTabText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable list */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 96 + insets.bottom }]} 
        showsVerticalScrollIndicator={false}
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No activities found</Text>
          </View>
        ) : (
          filteredActivities.map((item) => (
            <Animated.View 
              key={item.id} 
              entering={FadeInUp.springify().damping(14)} 
              layout={Layout.springify().damping(14)}
              style={[styles.activityRow, { borderLeftColor: item.border }]}
            >
              <View style={styles.activityLeft}>
                <View style={styles.activityIconBg}>
                  {item.type === 'Clock In' ? (
                    <ClockInIcon color="#6236FF" />
                  ) : (
                    <ClockOutIcon color="#8E9AA6" />
                  )}
                </View>
                <View style={styles.activityTextWrapper}>
                  <Text style={styles.activityTypeText}>{item.type}</Text>
                  <Text style={styles.activityTimeText}>{item.time}</Text>
                </View>
              </View>
              <View style={[
                styles.activityStatusBadge, 
                item.status === 'On Time' ? styles.statusBadgeGreen : styles.statusBadgeRed
              ]}>
                <Text style={[
                  styles.activityStatusText, 
                  item.status === 'On Time' ? styles.statusTextGreen : styles.statusTextRed
                ]}>
                  {item.status}
                </Text>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#1E1B4B',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
  },
  bgLightPurple: {
    backgroundColor: '#EBE9FE',
  },
  bgLightGreen: {
    backgroundColor: '#E6F9F1',
  },
  summaryLabel: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  summaryValue: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 24,
    color: '#1E1B4B',
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EBEFF8',
  },
  activeFilterTab: {
    backgroundColor: '#6236FF',
    borderColor: '#6236FF',
  },
  filterTabText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  activityRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTextWrapper: {
    justifyContent: 'center',
  },
  activityTypeText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#1E1B4B',
  },
  activityTimeText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 2,
  },
  activityStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeGreen: {
    backgroundColor: '#E6F9F1',
  },
  statusBadgeRed: {
    backgroundColor: '#FEE2E2',
  },
  activityStatusText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
  },
  statusTextGreen: {
    color: '#10B981',
  },
  statusTextRed: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#8A94A6',
  },
});
