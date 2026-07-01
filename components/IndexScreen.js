import React, { useState, useCallback, useEffect } from 'react';
import { fetch as streamFetch } from 'expo/fetch';
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
  BackHandler,
  Alert,
  Platform,
  AppState
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { API_BASE_URL, fetchUserProfile } from '../store/authSlice';
import { addNotification, fetchNotifications } from '../store/notificationSlice';
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
import NotificationScreen from './NotificationScreen';
import TaskScreen from './TaskScreen';

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

const TaskTabIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
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
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [refreshing, setRefreshing] = useState(false);
  const [isClockActionLoading, setIsClockActionLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);

  // Sync isCheckedIn state with backend user profile data on load/update
  useEffect(() => {
    if (user && user.employee && user.employee.today_attendance) {
      const today = user.employee.today_attendance;
      if (today.check_in && !today.check_out) {
        setIsCheckedIn(true);
        setCheckInTime(today.check_in);
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    } else {
      setIsCheckedIn(false);
      setCheckInTime(null);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchUserProfile()).unwrap(),
      dispatch(fetchNotifications()).unwrap()
    ]).catch(err => {
      console.error('Refresh error:', err);
    }).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  const formatTime12h = (timeString) => {
    if (!timeString) return '09:00 AM';
    const parts = timeString.split(':');
    if (parts.length < 2) return timeString;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${minutes} ${ampm}`;
  };

  let targetCheckInTime = '09:00 AM';
  if (user && user.employee) {
    if (user.employee.shift && user.employee.shift.start_time) {
      targetCheckInTime = formatTime12h(user.employee.shift.start_time);
    } else if (user.employee.organization && user.employee.organization.start_time) {
      targetCheckInTime = formatTime12h(user.employee.organization.start_time);
    }
  }

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Alex Smith'
    : 'Alex Smith';

  // Seed list with activity history matching the design image
  const [activities, setActivities] = useState([]);

  const fetchAttendanceHistory = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/history/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true'
        }
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        const formatted = data.map(item => {
          const dateStr = item.date;
          
          let checkInTimeStr = '';
          if (item.check_in) {
            const checkInLocal = new Date(item.check_in);
            checkInTimeStr = checkInLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          let checkOutTimeStr = '';
          if (item.check_out) {
            const checkOutLocal = new Date(item.check_out);
            checkOutTimeStr = checkOutLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          const events = [];
          if (item.check_in) {
            events.push({
              id: `${item.id}-in`,
              type: item.method === 'qr' ? 'Clock In (QR)' : 'Clock In',
              time: `${dateStr}, ${checkInTimeStr}`,
              status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
              border: item.status === 'late' ? '#EF4444' : '#6236FF'
            });
          }
          if (item.check_out) {
            events.push({
              id: `${item.id}-out`,
              type: item.method === 'qr' ? 'Clock Out (QR)' : 'Clock Out',
              time: `${dateStr}, ${checkOutTimeStr}`,
              status: 'On Time',
              border: '#8E9AA6'
            });
          }
          return events;
        }).flat();
        
        setActivities(formatted);
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    }
  };

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

  // Fetch attendance history when access token is available
  useEffect(() => {
    if (accessToken) {
      fetchAttendanceHistory();
    }
  }, [accessToken]);

  // 1. Stable SSE connection effect using Expo Fetch ReadableStream reader
  useEffect(() => {
    const token = accessToken;
    if (!token) return;

    let isMounted = true;
    let reconnectTimeout = null;
    let reader = null;

    const connectSSE = async () => {
      const sseUrl = `${API_BASE_URL}/api/main/notifications/stream/?token=${token}`;
      // console.log(sseUrl)
      try {
        const response = await streamFetch(sseUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
          },
        });

        if (!response.body) {
          throw new Error('Response body is not readable');
        }

        reader = response.body.getReader();
        let buffer = '';

        while (isMounted) {
          const { value, done } = await reader.read();
          if (done) break;

          if (value) {
            let chunk = '';
            if (typeof TextDecoder !== 'undefined') {
              chunk = new TextDecoder('utf-8').decode(value);
            } else {
              for (let i = 0; i < value.length; i++) {
                chunk += String.fromCharCode(value[i]);
              }
            }

            buffer += chunk;
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';

            for (const part of parts) {
              const trimmed = part.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith('data:')) {
                try {
                  const dataStr = trimmed.substring(5).trim();
                  const data = JSON.parse(dataStr);
                  if (data.status === 'connected') {
                    console.log('Mobile SSE connected via fetch stream.');
                    continue;
                  }
                  dispatch(addNotification(data));
                } catch (err) {
                  console.error('Failed to parse mobile SSE payload', err);
                }
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Mobile SSE connection error via fetch. Reconnecting in 10s...', err);
          reconnectTimeout = setTimeout(connectSSE, 10000);
        }
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
      if (reader) {
        try {
          reader.cancel();
        } catch (e) { }
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [accessToken, dispatch]);

  // 2. Fetch notifications once on mount/token change
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchNotifications());
    }
  }, [accessToken, dispatch]);

  // 3. Request location permissions, check location services, and watch position on mount
  useEffect(() => {
    let subscription = null;
    let isMounted = true;

    const checkAndRequestLocation = async () => {
      try {
        // Check if device location services are enabled
        const providerStatus = await Location.getProviderStatusAsync();
        if (!providerStatus.locationServicesEnabled) {
          if (Platform.OS === 'android') {
            try {
              await Location.enableNetworkProviderAsync();
            } catch (err) {
              console.warn('User declined to enable location provider services:', err);
            }
          } else {
            Alert.alert(
              'Location Services Off',
              'Please enable location services (GPS) in your device settings to use clock-in/out features.'
            );
          }
        }

        // Request foreground permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          if (isMounted) {
            // 1. Instantly get last known position (takes milliseconds)
            try {
              const lastKnown = await Location.getLastKnownPositionAsync({});
              if (lastKnown && lastKnown.coords && isMounted) {
                const lat = parseFloat(lastKnown.coords.latitude);
                const lng = parseFloat(lastKnown.coords.longitude);
                setCurrentCoords({ latitude: lat, longitude: lng });
              }
            } catch (err) {
              console.warn('Error fetching last known position:', err);
            }

            // 2. Fetch a fast current position with Balanced accuracy as a quick backup
            try {
              const quickLoc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 3000
              });
              if (quickLoc && quickLoc.coords && isMounted) {
                const lat = parseFloat(quickLoc.coords.latitude);
                const lng = parseFloat(quickLoc.coords.longitude);
                setCurrentCoords({ latitude: lat, longitude: lng });
              }
            } catch (err) {
              console.warn('Error fetching quick balanced position:', err);
            }

            // 3. Start high-accuracy watch in the background to refine coordinates
            subscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,   // Update every 5 seconds
                distanceInterval: 2,   // Or when moving more than 2 meters
              },
              (location) => {
                if (isMounted && location.coords) {
                  const lat = parseFloat(location.coords.latitude);
                  const lng = parseFloat(location.coords.longitude);
                  setCurrentCoords({ latitude: lat, longitude: lng });
                }
              }
            );
          }
        } else {
          Alert.alert(
            'Permission Required',
            'Location permission is required to verify your location. Please grant it in your app settings.'
          );
        }
      } catch (error) {
        console.error('Error verifying location services/permissions on login:', error);
      }
    };

    // Periodic check (every 4 seconds) to detect if location services/permission are disabled live on screen
    const intervalId = setInterval(async () => {
      try {
        const providerStatus = await Location.getProviderStatusAsync();
        const { status } = await Location.getForegroundPermissionsAsync();
        if (!providerStatus.locationServicesEnabled || status !== 'granted') {
          setCurrentCoords(null);
        }
      } catch (err) {
        setCurrentCoords(null);
      }
    }, 4000);

    // App state listener to catch toggles immediately when returning to the app from settings
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        try {
          const providerStatus = await Location.getProviderStatusAsync();
          const { status } = await Location.getForegroundPermissionsAsync();
          if (!providerStatus.locationServicesEnabled || status !== 'granted') {
            setCurrentCoords(null);
          } else {
            // Re-trigger acquisition if they re-enabled it
            checkAndRequestLocation();
          }
        } catch (err) {
          setCurrentCoords(null);
        }
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    if (accessToken) {
      checkAndRequestLocation();
    }

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
      if (subscription) {
        subscription.remove();
      }
    };
  }, [accessToken]);

  const handleCheckInToggle = async () => {
    if (isClockActionLoading) return;

    // Press animation
    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 5 }),
      withSpring(1, { damping: 5 })
    );

    try {
      setIsClockActionLoading(true);

      let lat = null;
      let lng = null;

      if (currentCoords) {
        lat = currentCoords.latitude;
        lng = currentCoords.longitude;
      } else {
        // Fallback if coordinates are not cached yet
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission Denied',
            'You must grant location permissions to perform a check-in/out.'
          );
          setIsClockActionLoading(false);
          return;
        }

        let location = null;
        try {
          // 1. Try last known first (instant)
          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown && lastKnown.coords) {
            location = lastKnown;
          }
        } catch (err) {
          console.warn('Error getting last known in fallback:', err);
        }

        if (!location) {
          try {
            // 2. Try balanced accuracy next (fast 3s timeout)
            location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 3000
            });
          } catch (err) {
            // 3. Final fallback to high accuracy with short timeout
            try {
              location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 4000
              });
            } catch (fallbackErr) {
              Alert.alert(
                'Location Error',
                'Unable to retrieve your current location. Please check your GPS signal and settings.'
              );
              setIsClockActionLoading(false);
              return;
            }
          }
        }

        lat = parseFloat(location.coords.latitude);
        lng = parseFloat(location.coords.longitude);
        setCurrentCoords({ latitude: lat, longitude: lng });
      }

      console.log(lat, lng)

      // 3. Fire API request to backend manual clock endpoint
      const response = await fetch(`${API_BASE_URL}/api/employee/manual-clock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit attendance.');
      }

      // 4. Update UI states based on returned action (clock_in vs clock_out)
      if (data.action === 'clock_in') {
        setIsCheckedIn(true);
        setCheckInTime(data.time);

        const newActivity = {
          id: Math.random().toString(),
          type: 'Clock In',
          time: `Today, ${data.time}`,
          status: data.status_label || 'On Time',
          border: '#6236FF'
        };
        setActivities(prev => [newActivity, ...prev]);
        Alert.alert('Checked In', data.message || 'Clocked in successfully.');
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);

        const newActivity = {
          id: Math.random().toString(),
          type: 'Clock Out',
          time: `Today, ${data.time}`,
          status: 'On Time',
          border: '#8E9AA6'
        };
        setActivities(prev => [newActivity, ...prev]);
        Alert.alert('Checked Out', data.message || 'Clocked out successfully.');
      }

      // Pull latest user profile to keep data consistent
      dispatch(fetchUserProfile());
      fetchAttendanceHistory();

    } catch (err) {
      Alert.alert('Attendance Failed', err.message);
    } finally {
      setIsClockActionLoading(false);
    }
  };

  const handleQrClockIn = async (scannedToken) => {
    if (isClockActionLoading) return;
    try {
      setIsClockActionLoading(true);

      let lat = null;
      let lng = null;

      if (currentCoords) {
        lat = currentCoords.latitude;
        lng = currentCoords.longitude;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission Denied',
            'You must grant location permissions to perform QR clock-in/out.'
          );
          setIsClockActionLoading(false);
          return;
        }

        let location = null;
        try {
          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown && lastKnown.coords) {
            location = lastKnown;
          }
        } catch (err) {
          console.warn('Error getting last known in fallback:', err);
        }

        if (!location) {
          try {
            location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 3000
            });
          } catch (err) {
            try {
              location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 4000
              });
            } catch (fallbackErr) {
              Alert.alert(
                'Location Error',
                'Unable to retrieve your current location. Please check your GPS signal and settings.'
              );
              setIsClockActionLoading(false);
              return;
            }
          }
        }

        lat = parseFloat(location.coords.latitude);
        lng = parseFloat(location.coords.longitude);
        setCurrentCoords({ latitude: lat, longitude: lng });
      }

      let tokenValue = scannedToken;
      // If it is a URL, extract the token from the end of the path
      if (tokenValue.includes('/api/employee/qr-clock/')) {
        const parts = tokenValue.split('/api/employee/qr-clock/');
        if (parts.length > 1) {
          tokenValue = parts[1].replace(/\//g, ''); // Remove trailing/nested slashes
        }
      }

      const targetUrl = `${API_BASE_URL}/api/employee/qr-clock/${tokenValue}/`;

      console.log('Sending QR Clock to:', targetUrl, 'coords:', lat, lng);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit QR attendance.');
      }

      if (data.action === 'clock_in') {
        setIsCheckedIn(true);
        setCheckInTime(data.time);

        const newActivity = {
          id: Math.random().toString(),
          type: 'Clock In (QR)',
          time: `Today, ${data.time}`,
          status: data.status_label || 'On Time',
          border: '#10B981'
        };
        setActivities(prev => [newActivity, ...prev]);
        Alert.alert('Checked In (QR)', data.message || 'Clocked in successfully.');
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);

        const newActivity = {
          id: Math.random().toString(),
          type: 'Clock Out (QR)',
          time: `Today, ${data.time}`,
          status: 'On Time',
          border: '#8E9AA6'
        };
        setActivities(prev => [newActivity, ...prev]);
        Alert.alert('Checked Out (QR)', data.message || 'Clocked out successfully.');
      }

      dispatch(fetchUserProfile());
      fetchAttendanceHistory();

    } catch (err) {
      console.error('QR Clock Error:', err);
      Alert.alert('Attendance Error', err.message || 'An error occurred during QR verification.');
    } finally {
      setIsClockActionLoading(false);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {(activeTab === 'Home' || activeTab === 'Task') && (
        <View style={[styles.header, { paddingHorizontal: 24, paddingTop: 16, marginBottom: 12 }]}>
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
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            onPress={() => setActiveTab('Notifications')}
          >
            <BellIcon color="#6236FF" />
            {unreadCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'Home' ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
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
                : `You should clock in by ${targetCheckInTime}`
              }
            </Text>

            {currentCoords ? (
              <View style={styles.gpsStatusWrapper}>
                <View style={styles.gpsDotActive} />
                <Text style={styles.gpsStatusText}>GPS Active</Text>
              </View>
            ) : (
              <View style={styles.gpsStatusWrapper}>
                <View style={styles.gpsDotInactive} />
                <Text style={styles.gpsStatusText}>Acquiring GPS...</Text>
              </View>
            )}

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                style={[
                  styles.clockButton,
                  isCheckedIn ? styles.clockButtonOut : styles.clockButtonIn,
                  (!currentCoords || isClockActionLoading) && { opacity: 0.5 }
                ]}
                onPress={handleCheckInToggle}
                activeOpacity={0.9}
                disabled={isClockActionLoading || !currentCoords}
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
                    {isClockActionLoading ? 'Locating...' : (isCheckedIn ? 'Clock Out Now' : 'Clock In Now')}
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
              <TouchableOpacity
                style={[styles.actionCard, !currentCoords && { opacity: 0.5 }]}
                activeOpacity={0.8}
                onPress={() => setActiveTab('Scan')}
                disabled={!currentCoords}
              >
                <View style={styles.actionIconWrapper}>
                  <QrIcon color="#6236FF" />
                </View>
                <Text style={styles.actionLabel}>Scan QR</Text>
              </TouchableOpacity>

              {/* Action 2 */}
              <TouchableOpacity
                style={[styles.actionCard, !currentCoords && { opacity: 0.5 }]}
                activeOpacity={0.8}
                disabled={!currentCoords}
              >
                <View style={styles.actionIconWrapper}>
                  <PenIcon color="#6236FF" />
                </View>
                <Text style={styles.actionLabel}>Manual</Text>
              </TouchableOpacity>

              {/* Action 3 */}
              <TouchableOpacity
                style={[styles.actionCard, !currentCoords && { opacity: 0.5 }]}
                activeOpacity={0.8}
                disabled={!currentCoords}
              >
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
      ) : activeTab === 'Task' ? (
        <TaskScreen />
      ) : activeTab === 'Scan' ? (
        <QRScanner
          onBack={() => setActiveTab('Home')}
          onScanSuccess={(scannedToken) => {
            handleQrClockIn(scannedToken);
            setActiveTab('Home');
          }}
        />
      ) : activeTab === 'Notifications' ? (
        <NotificationScreen onBack={() => setActiveTab('Home')} />
      ) : (
        <View style={styles.fallbackScreen}>
          <Text style={styles.fallbackTitle}>{activeTab} Screen</Text>
          <Text style={styles.fallbackSubtitle}>Premium modular module coming soon</Text>
        </View>
      )}

      {/* Premium Navigation Footer */}
      {activeTab !== 'Scan' && activeTab !== 'Notifications' && (
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
            style={[styles.tabItem, activeTab === 'Task' && styles.activeTabBg, !currentCoords && { opacity: 0.4 }]}
            onPress={() => setActiveTab('Task')}
            activeOpacity={0.8}
            disabled={!currentCoords}
          >
            <TaskTabIcon color={activeTab === 'Task' ? '#6236FF' : '#8A94A6'} />
            {activeTab === 'Task' && <Text style={styles.activeTabText}>Task</Text>}
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
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Urbanist_800ExtraBold',
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
    marginBottom: 12,
    textAlign: 'center',
  },
  gpsStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  gpsDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  gpsDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  gpsStatusText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
