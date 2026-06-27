import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  RefreshControl,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  Layout,
  FadeInUp,
  FadeOut
} from 'react-native-reanimated';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';
import QRScanner from './QRScanner';

const { width } = Dimensions.get('window');

// Custom SVG Icons
const BellIcon = ({ color = '#6236FF' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const QrIcon = ({ color = '#6236FF' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 15h3v3h-3zM18 18h3v3h-3zM15 21h3v-3h3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PenIcon = ({ color = '#6236FF' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const KeypadIcon = ({ color = '#6236FF' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx={5} cy={5} r={1.5} fill={color} />
    <Circle cx={12} cy={5} r={1.5} fill={color} />
    <Circle cx={19} cy={5} r={1.5} fill={color} />
    <Circle cx={5} cy={12} r={1.5} fill={color} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
    <Circle cx={19} cy={12} r={1.5} fill={color} />
    <Circle cx={5} cy={19} r={1.5} fill={color} />
    <Circle cx={12} cy={19} r={1.5} fill={color} />
    <Circle cx={19} cy={19} r={1.5} fill={color} />
  </Svg>
);

const ClockInIcon = ({ color = '#10B981' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockOutIcon = ({ color = '#EF4444' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarCheckIcon = ({ color = '#FFFFFF' }) => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrendUpIcon = ({ color = '#10B981' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M23 6l-9.5 9.5-5-5L1 18" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Tab Icons
const HomeTabIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const ScanTabIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HistoryTabIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileTabIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

export default function IndexScreen() {
  const { user } = useSelector((state) => state.auth);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Alex Smith'
    : 'Alex Smith';

  // Seed list with activity history matching the design image
  const [activities, setActivities] = useState([
    { id: '1', type: 'Clock In', time: 'Yesterday, 08:55 AM', status: 'On Time', border: '#6236FF' },
    { id: '2', type: 'Clock Out', time: 'Yesterday, 05:02 PM', status: 'On Time', border: '#8E9AA6' },
    { id: '3', type: 'Clock In', time: 'Monday, 09:15 AM', status: 'Late', border: '#EF4444' },
  ]);

  // Shared value for button scale animation
  const buttonScale = useSharedValue(1);

  // Handle Android hardware back press
  useEffect(() => {
    const backAction = () => {
      if (activeTab !== 'Home') {
        setActiveTab('Home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [activeTab]);

  const handleCheckInToggle = () => {
    // Press animation
    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 5 }),
      withSpring(1, { damping: 5 })
    );

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!isCheckedIn) {
      setIsCheckedIn(true);
      setCheckInTime(formattedTime);

      // Append new check-in to list
      const newActivity = {
        id: Math.random().toString(),
        type: 'Clock In',
        time: `Today, ${formattedTime}`,
        status: now.getHours() < 9 ? 'On Time' : 'Late',
        border: '#6236FF'
      };
      setActivities(prev => [newActivity, ...prev]);
    } else {
      setIsCheckedIn(false);
      setCheckInTime(null);

      // Append check-out to list
      const newActivity = {
        id: Math.random().toString(),
        type: 'Clock Out',
        time: `Today, ${formattedTime}`,
        status: 'On Time',
        border: '#8E9AA6'
      };
      setActivities(prev => [newActivity, ...prev]);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'Home' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6236FF']}
              tintColor="#6236FF"
            />
          }
        >

          {/* Dynamic Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../assets/avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.headerTextWrapper}>
                <Text style={styles.greetingText}>Good morning,</Text>
                <Text style={styles.userNameText}>{fullName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
              <BellIcon color="#6236FF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Current Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>CURRENT STATUS</Text>
            </View>
            <Text style={styles.statusTitle}>
              {isCheckedIn ? 'Clocked In' : 'Not Clocked In'}
            </Text>
            <Text style={styles.statusSubtext}>
              {isCheckedIn
                ? `You clocked in today at ${checkInTime}`
                : 'You should clock in by 09:00 AM'
              }
            </Text>

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                style={[styles.clockButton, isCheckedIn ? styles.clockButtonOut : styles.clockButtonIn]}
                onPress={handleCheckInToggle}
                activeOpacity={0.9}
              >
                <View style={styles.clockButtonContent}>
                  {isCheckedIn ? (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth={2}>
                      <Rect x={4} y={4} width={16} height={16} rx={2} />
                    </Svg>
                  ) : (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#6236FF" stroke="#6236FF" strokeWidth={2}>
                      <Path d="M5 3l14 9-14 9V3z" />
                    </Svg>
                  )}
                  <Text style={[styles.clockButtonText, isCheckedIn ? styles.textRed : styles.textPurple]}>
                    {isCheckedIn ? 'Clock Out Now' : 'Clock In Now'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              {/* Action 1 */}
              <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => setActiveTab('Scan')}>
                <View style={styles.actionIconWrapper}>
                  <QrIcon color="#6236FF" />
                </View>
                <Text style={styles.actionLabel}>Scan QR</Text>
              </TouchableOpacity>

              {/* Action 2 */}
              <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
                <View style={styles.actionIconWrapper}>
                  <PenIcon color="#6236FF" />
                </View>
                <Text style={styles.actionLabel}>Manual</Text>
              </TouchableOpacity>

              {/* Action 3 */}
              <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
                <View style={styles.actionIconWrapper}>
                  <KeypadIcon color="#6236FF" />
                </View>
                <Text style={styles.actionLabel}>Pin Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionContainer}>
            <View style={styles.activityHeaderRow}>
              <Text style={styles.sectionHeader}>Recent Activity</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveTab('History')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Activity List */}
            <View style={styles.activityList}>
              {activities.slice(0, 3).map((item) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.springify().damping(12)}
                  layout={Layout.springify().damping(12)}
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
              ))}
            </View>
          </View>

          {/* Lower Dashboard Stats */}
          <View style={styles.statsRow}>
            {/* Attendance Stats Card */}
            <View style={[styles.statsCard, styles.bgDark]}>
              <View style={styles.statsHeaderRow}>
                <View>
                  <Text style={styles.statsLabelDark}>Attendance</Text>
                  <Text style={styles.statsValueDark}>98%</Text>
                </View>
                <View style={styles.calendarIconWatermark}>
                  <CalendarCheckIcon color="rgba(255, 255, 255, 0.12)" />
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '98%' }]} />
              </View>
            </View>

            {/* Hours Worked Stats Card */}
            <View style={[styles.statsCard, styles.bgLavender]}>
              <Text style={styles.statsLabelPurple}>Hours Worked</Text>
              <Text style={styles.statsValuePurple}>162.5</Text>
              <View style={styles.trendRow}>
                <TrendUpIcon color="#10B981" />
                <Text style={styles.trendText}>+12% this month</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : activeTab === 'History' ? (
        <HistoryScreen activities={activities} />
      ) : activeTab === 'Profile' ? (
        <ProfileScreen />
      ) : activeTab === 'Scan' ? (
        <QRScanner
          onBack={() => setActiveTab('Home')}
          onScanSuccess={(scannedToken) => {
            handleCheckInToggle();
            setActiveTab('Home');
          }}
        />
      ) : (
        <View style={styles.fallbackScreen}>
          <Text style={styles.fallbackTitle}>{activeTab} Screen</Text>
          <Text style={styles.fallbackSubtitle}>Premium modular module coming soon</Text>
        </View>
      )}

      {/* Premium Navigation Footer */}
      {activeTab !== 'Scan' && (
        <View style={styles.tabBar}>
          <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.activeTabBg]}
          onPress={() => setActiveTab('Home')}
          activeOpacity={0.8}
        >
          <HomeTabIcon color={activeTab === 'Home' ? '#6236FF' : '#8A94A6'} />
          {activeTab === 'Home' && <Text style={styles.activeTabText}>Home</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Scan' && styles.activeTabBg]}
          onPress={() => setActiveTab('Scan')}
          activeOpacity={0.8}
        >
          <ScanTabIcon color={activeTab === 'Scan' ? '#6236FF' : '#8A94A6'} />
          {activeTab === 'Scan' && <Text style={styles.activeTabText}>Scan</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'History' && styles.activeTabBg]}
          onPress={() => setActiveTab('History')}
          activeOpacity={0.8}
        >
          <HistoryTabIcon color={activeTab === 'History' ? '#6236FF' : '#8A94A6'} />
          {activeTab === 'History' && <Text style={styles.activeTabText}>History</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Profile' && styles.activeTabBg]}
          onPress={() => setActiveTab('Profile')}
          activeOpacity={0.8}
        >
          <ProfileTabIcon color={activeTab === 'Profile' ? '#6236FF' : '#8A94A6'} />
          {activeTab === 'Profile' && <Text style={styles.activeTabText}>Profile</Text>}
        </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
    paddingBottom: 96, // extra space to avoid overlapping sticky navbar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBE9FE',
  },
  headerTextWrapper: {
    marginLeft: 12,
  },
  greetingText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 12,
    color: '#8A94A6',
  },
  userNameText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 18,
    color: '#1E1B4B',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statusCard: {
    backgroundColor: '#6236FF',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 28,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  statusBadgeText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statusTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  statusSubtext: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  clockButton: {
    width: width - 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  clockButtonIn: {
    shadowColor: '#6236FF',
  },
  clockButtonOut: {
    shadowColor: '#EF4444',
  },
  clockButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockButtonText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 15,
    marginLeft: 8,
  },
  textPurple: {
    color: '#6236FF',
  },
  textRed: {
    color: '#EF4444',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#1E1B4B',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 11,
    color: '#475569',
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#6236FF',
    marginBottom: 16,
  },
  activityList: {
    width: '100%',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    minHeight: 110,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  bgDark: {
    backgroundColor: '#1E2235',
    marginRight: 6,
  },
  bgLavender: {
    backgroundColor: '#EBE9FE',
    marginLeft: 6,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsLabelDark: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  statsValueDark: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 4,
  },
  calendarIconWatermark: {
    opacity: 0.8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    marginTop: 18,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  statsLabelPurple: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    color: '#6236FF',
  },
  statsValuePurple: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#1E1B4B',
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  trendText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
    color: '#10B981',
    marginLeft: 4,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0.3,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    // borderTopRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTabBg: {
    backgroundColor: '#EBE9FE',
  },
  activeTabText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#6236FF',
    marginLeft: 6,
  },
  fallbackScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fallbackTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#1E1B4B',
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#8A94A6',
    textAlign: 'center',
  },
});
