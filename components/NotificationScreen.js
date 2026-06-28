import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from '../store/notificationSlice';
import { API_BASE_URL } from '../store/authSlice';
import Svg, { Path } from 'react-native-svg';

const BackArrowIcon = ({ color = '#111827' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function NotificationScreen({ onBack }) {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { list, isLoading } = useSelector((state) => state.notifications);
  const [actionInProgress, setActionInProgress] = useState({});

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(markAllRead());
  }, [dispatch]);

  const handleAcceptInvite = async (orgId, notifId) => {
    try {
      setActionInProgress(prev => ({ ...prev, [notifId]: 'accepting' }));
      const response = await fetch(`${API_BASE_URL}/api/main/invitations/${orgId}/accept/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }
      Alert.alert('Success', data.message);
      dispatch(fetchNotifications());
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionInProgress(prev => ({ ...prev, [notifId]: null }));
    }
  };

  const handleDeclineInvite = async (orgId, notifId) => {
    try {
      setActionInProgress(prev => ({ ...prev, [notifId]: 'declining' }));
      const response = await fetch(`${API_BASE_URL}/api/main/invitations/${orgId}/decline/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }
      Alert.alert('Declined', data.message);
      dispatch(fetchNotifications());
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionInProgress(prev => ({ ...prev, [notifId]: null }));
    }
  };

  const renderItem = ({ item }) => {
    const isInvite = item.notification_type === 'invitation' && item.organization_id;
    const progress = actionInProgress[item.id];

    return (
      <View style={styles.notificationCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={styles.cardMsg}>{item.message}</Text>

        {isInvite && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => handleAcceptInvite(item.organization_id, item.id)}
              disabled={!!progress}
              style={[styles.btnAccept, progress && styles.btnDisabled]}
              activeOpacity={0.8}
            >
              {progress === 'accepting' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Accept Invite</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeclineInvite(item.organization_id, item.id)}
              disabled={!!progress}
              style={[styles.btnDecline, progress && styles.btnDisabled]}
              activeOpacity={0.8}
            >
              {progress === 'declining' ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.declineText}>Decline</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header navbar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnBack} onPress={onBack} activeOpacity={0.7}>
          <BackArrowIcon color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6236FF" />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  btnBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 18,
    color: '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 15,
    color: '#94A3B8',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
  },
  cardMsg: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  btnAccept: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDecline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  declineText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#EF4444',
  },
});
