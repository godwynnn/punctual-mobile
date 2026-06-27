import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  FadeInUp
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';

// Custom SVG Icons for Settings
const UserIcon = ({ color = '#6236FF' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

const BellIcon = ({ color = '#6236FF' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShieldIcon = ({ color = '#6236FF' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HelpIcon = ({ color = '#6236FF' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRight = ({ color = '#8A94A6' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LogoutIcon = ({ color = '#EF4444' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StreakIcon = ({ color = '#FF6B00' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 3.5 2.5 6 1.05 5.25-2.4 9-6 9-2.5 0-4.5-2-4.5-4.5 0-1.577.85-3.5 1.5-4.5 0 2.5 1 4.5 3 5.5z" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BadgeIcon = ({ color = '#10B981' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of puntua?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            dispatch(logoutUser());
          }
        }
      ]
    );
  };

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Alex Smith'
    : 'Alex Smith';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card Header */}
        <Animated.View entering={FadeInUp.springify().damping(12)} style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../assets/avatar.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
            <View style={styles.editBadge}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
                <Path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </Svg>
            </View>
          </View>

          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userRole}>{user?.email ? 'Employee' : 'Senior Mobile Engineer'}</Text>

          <View style={styles.employeeBadge}>
            <Text style={styles.employeeBadgeText}>{user?.employee_id || 'EMP-2026-89'}</Text>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <View style={styles.statIconWrapperOrange}>
              <StreakIcon color="#FF6B00" />
            </View>
            <View>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>12 Days</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statIconWrapperGreen}>
              <BadgeIcon color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Performance</Text>
              <Text style={styles.statValue}>98% On-Time</Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'alex.smith@puntua.com'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+1 (555) 019-2834</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Work Office</Text>
              <Text style={styles.infoValue}>San Francisco HQ</Text>
            </View>
            <View style={[styles.infoRow, styles.noBorder]}>
              <Text style={styles.infoLabel}>Shift Schedule</Text>
              <Text style={styles.infoValue}>09:00 AM - 05:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsGroup}>
            {/* Setting 1 */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <UserIcon color="#6236FF" />
                </View>
                <Text style={styles.settingText}>Personal Details</Text>
              </View>
              <ChevronRight />
            </TouchableOpacity>

            {/* Setting 2 */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <BellIcon color="#6236FF" />
                </View>
                <Text style={styles.settingText}>Notification Preferences</Text>
              </View>
              <ChevronRight />
            </TouchableOpacity>

            {/* Setting 3 */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <ShieldIcon color="#6236FF" />
                </View>
                <Text style={styles.settingText}>Security & Privacy</Text>
              </View>
              <ChevronRight />
            </TouchableOpacity>

            {/* Setting 4 */}
            <TouchableOpacity style={[styles.settingItem, styles.noBorder]} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <HelpIcon color="#6236FF" />
                </View>
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <ChevronRight />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogoutIcon color="#EF4444" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

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
    paddingBottom: 96,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#EBE9FE',
    backgroundColor: '#FAF9FF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6236FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#1E1B4B',
  },
  userRole: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8A94A6',
    marginTop: 4,
  },
  employeeBadge: {
    backgroundColor: '#EBE9FE',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
    marginTop: 14,
  },
  employeeBadgeText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 11,
    color: '#6236FF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconWrapperOrange: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statIconWrapperGreen: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6F9F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    color: '#8A94A6',
  },
  statValue: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#1E1B4B',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 15,
    color: '#1E1B4B',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5FA',
  },
  infoLabel: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8A94A6',
  },
  infoValue: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#1E1B4B',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5FA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#334155',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF1F1',
    borderRadius: 100,
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 15,
    color: '#EF4444',
    marginLeft: 8,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
});
