import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  Platform,
  Animated as RNAnimated
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../store/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

// Custom SVG Icons
const ClipboardIcon = ({ color = '#6236FF' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = ({ color = '#8A94A6', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AttachmentIcon = ({ color = '#6236FF', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function TaskScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken, user } = useSelector((state) => state.auth);

  // Screen layout measurements
  const screenHeight = Dimensions.get('window').height;
  const drawerHeight = screenHeight * 0.8;
  const translateY = useRef(new RNAnimated.Value(drawerHeight)).current;
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // Submission States
  const [status, setStatus] = useState('completed');
  const [notes, setNotes] = useState('');
  const [linkAttach, setLinkAttach] = useState('');
  const [fileAsset, setFileAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Tab state
  const [activeTab, setActiveTab] = useState('All');

  // Fetch employee tasks from backend
  const fetchEmployeeTasks = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/employee_task/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else {
        console.error('Failed to load employee tasks:', data);
      }
    } catch (err) {
      console.error('Error fetching employee tasks:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployeeTasks();
  }, [accessToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployeeTasks();
  };

  // Pan gesture tracking for drag-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start handling gesture if user drags downwards (positive dy)
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateY.flattenOffset();
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          // Dragged down far enough/fast enough, animate to bottom and close
          closeDrawer();
        } else {
          // Bounce back to original open state (0 position)
          RNAnimated.spring(translateY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // slide bottom sheet up
  const openDrawer = () => {
    translateY.setValue(drawerHeight);
    RNAnimated.spring(translateY, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // slide bottom sheet down
  const closeDrawer = () => {
    RNAnimated.timing(translateY, {
      toValue: drawerHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDetailModalVisible(false);
    });
  };

  // Open details for a specific task card
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    const userAssignment = task.assignments?.find(a => a.employee.email === user?.email);
    setStatus(userAssignment ? userAssignment.status : 'completed');
    setNotes(userAssignment ? userAssignment.notes || '' : '');
    setLinkAttach(userAssignment ? userAssignment.link_attach || '' : '');
    setFileAsset(null); // Clear previous selection
    setDetailModalVisible(true);
  };

  // Document picking handler
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      console.log('Picked document:', res);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFileAsset(res.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  // Trigger open animation when modal becomes visible
  useEffect(() => {
    if (detailModalVisible) {
      openDrawer();
    }
  }, [detailModalVisible]);

  // Submit assignment update to backend
  const handleSubmitProgress = async () => {
    if (!selectedTask || !accessToken) return;
    setIsSubmitting(true);
    try {
      let body;
      let headers = {
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      };

      if (fileAsset) {
        body = new FormData();
        body.append('status', status);
        body.append('notes', notes);
        body.append('link_attach', linkAttach);
        
        // Prepare the upload file object for FormData
        body.append('file_attach', {
          uri: fileAsset.uri,
          name: fileAsset.name || 'upload.bin',
          type: fileAsset.mimeType || 'application/octet-stream',
        });
      } else {
        body = JSON.stringify({
          status: status,
          notes: notes,
          link_attach: linkAttach
        });
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${selectedTask.id}/submit_assignment/`, {
        method: 'POST',
        headers: headers,
        body: body
      });

      const resData = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Your progress has been submitted successfully!');
        setDetailModalVisible(false);
        fetchEmployeeTasks();
      } else {
        Alert.alert('Error', resData.error || 'Failed to submit progress update.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while submitting progress.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering task logic
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const userAssignment = task.assignments?.find(a => a.employee.email === user?.email);
      const userStatus = userAssignment ? userAssignment.status : 'pending';
      
      if (activeTab === 'All') return true;
      if (activeTab === 'Pending') return userStatus === 'pending';
      if (activeTab === 'In Progress') return userStatus === 'in_progress';
      if (activeTab === 'Completed') return userStatus === 'completed';
      return true;
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '-';
    }
  };

  const getStatusStyle = (statusVal) => {
    switch (statusVal) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#059669', label: 'Completed' };
      case 'in_progress':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'In Progress' };
      default:
        return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6236FF']} />
        }
      >
        {/* Title Header */}
        <Animated.View entering={FadeInUp.springify().damping(12)} style={styles.header}>
          <View style={styles.titleWrapper}>
            <ClipboardIcon color="#6236FF" />
            <Text style={styles.title}>Tasks & Checklist</Text>
          </View>
          <Text style={styles.subtitle}>Complete your daily checklist to maintain your performance streak.</Text>
        </Animated.View>

        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task Cards List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#6236FF" style={{ marginTop: 40 }} />
        ) : getFilteredTasks().length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks found in this category.</Text>
          </View>
        ) : (
          getFilteredTasks().map((task, index) => {
            const userAssignment = task.assignments?.find(a => a.employee.email === user?.email);
            const userStatus = userAssignment ? userAssignment.status : 'pending';
            const statusConfig = getStatusStyle(userStatus);

            return (
              <Animated.View 
                entering={FadeInUp.delay(index * 100).springify().damping(15)} 
                key={task.id}
              >
                <TouchableOpacity 
                  style={styles.taskCard} 
                  onPress={() => handleOpenDetails(task)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.orgName}>{task.organization_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.taskTitle}>{task.title}</Text>
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.dueDateWrapper}>
                      <CalendarIcon color="#8A94A6" />
                      <Text style={styles.dueDateText}>Due: {formatTime(task.due_date)}</Text>
                    </View>

                    {/* Attachment Indicators */}
                    {(task.file_attach || task.link_attach) && (
                      <View style={styles.attachmentBadge}>
                        <AttachmentIcon color="#6236FF" size={12} />
                        <Text style={styles.attachmentBadgeText}>Doc</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* DETAIL & SUBMISSION MODAL */}
      {selectedTask && (
        <Modal
          visible={detailModalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={closeDrawer}
        >
          <View style={styles.modalOverlay}>
            {/* Clickable backdrop overlay to dismiss sheet */}
            <TouchableOpacity 
              style={styles.backdropPressable}
              activeOpacity={1}
              onPress={closeDrawer}
            />

            {/* Bottom Drawer Content */}
            <RNAnimated.View 
              style={[
                styles.modalContent, 
                { 
                  height: drawerHeight,
                  transform: [{ translateY: translateY }]
                }
              ]}
            >
              {/* Drag handle bar at top of sheet */}
              <View {...panResponder.panHandlers} style={styles.dragHandleWrapper}>
                <View style={styles.dragHandle} />
              </View>

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Task Details</Text>
                <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn}>
                  <CloseIcon />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Task Meta details */}
                <Text style={styles.modalOrg}>{selectedTask.organization_name}</Text>
                <Text style={styles.modalTaskTitle}>{selectedTask.title}</Text>
                
                <View style={styles.modalDueWrapper}>
                  <CalendarIcon color="#8A94A6" size={16} />
                  <Text style={styles.modalDueText}>Due Date: {formatTime(selectedTask.due_date)}</Text>
                </View>

                {/* Task Description */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedTask.description || "No description provided."}
                  </Text>
                </View>

                {/* References Attachments */}
                {(selectedTask.file_attach || selectedTask.link_attach) && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Reference Materials</Text>
                    <View style={styles.attachmentRow}>
                      {selectedTask.file_attach && (
                        <TouchableOpacity 
                          style={[styles.attachBtn, styles.attachBtnFile]}
                          onPress={() => Linking.openURL(selectedTask.file_attach)}
                          activeOpacity={0.7}
                        >
                          <AttachmentIcon color="#059669" size={14} />
                          <Text style={styles.attachBtnTextFile}>Reference File</Text>
                        </TouchableOpacity>
                      )}
                      {selectedTask.link_attach && (
                        <TouchableOpacity 
                          style={[styles.attachBtn, styles.attachBtnUrl]}
                          onPress={() => Linking.openURL(selectedTask.link_attach)}
                          activeOpacity={0.7}
                        >
                          <AttachmentIcon color="#0284C7" size={14} />
                          <Text style={styles.attachBtnTextUrl}>Reference Link</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* Submit / Report Progress Section */}
                <View style={styles.divider} />
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Report Progress</Text>
                  
                  {/* Status selection */}
                  <Text style={styles.inputLabel}>Work Status</Text>
                  <View style={styles.statusPickerRow}>
                    {[
                      { key: 'pending', label: 'Pending' },
                      { key: 'in_progress', label: 'In Progress' },
                      { key: 'completed', label: 'Completed' }
                    ].map(item => (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.statusPickerItem,
                          status === item.key && styles.statusPickerItemActive
                        ]}
                        onPress={() => setStatus(item.key)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.statusPickerItemText,
                          status === item.key && styles.statusPickerItemTextActive
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Remarks Input */}
                  <Text style={styles.inputLabel}>Submission Notes / Remarks</Text>
                  <TextInput
                    style={styles.remarksInput}
                    multiline
                    numberOfLines={3}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Describe your progress or results..."
                    placeholderTextColor="#A3AED0"
                  />

                  {/* Submission File Attach */}
                  <Text style={styles.inputLabel}>File Attachment (Optional)</Text>
                  {fileAsset ? (
                    <View style={styles.selectedFileContainer}>
                      <View style={styles.selectedFileDetails}>
                        <AttachmentIcon color="#059669" size={14} />
                        <Text style={styles.selectedFileName} numberOfLines={1}>
                          {fileAsset.name}
                        </Text>
                        {fileAsset.size && (
                          <Text style={styles.selectedFileSize}>
                            ({Math.round(fileAsset.size / 1024)} KB)
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => setFileAsset(null)} style={styles.removeFileBtn}>
                        <CloseIcon color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.filePickerBtn} onPress={handlePickFile} activeOpacity={0.7}>
                      <AttachmentIcon color="#6236FF" size={14} />
                      <Text style={styles.filePickerBtnText}>Choose Document / File</Text>
                    </TouchableOpacity>
                  )}

                  {/* Submission Link Attach */}
                  <Text style={styles.inputLabel}>Link Attachment (Optional)</Text>
                  <TextInput
                    style={styles.linkInput}
                    value={linkAttach}
                    onChangeText={setLinkAttach}
                    placeholder="https://example.com/your-submission"
                    placeholderTextColor="#A3AED0"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                {/* Submission button */}
                <TouchableOpacity 
                  style={styles.submitBtn} 
                  onPress={handleSubmitProgress}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Progress Update</Text>
                  )}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </RNAnimated.View>
          </View>
        </Modal>
      )}
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
    marginBottom: 20,
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
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#6236FF',
    borderColor: '#6236FF',
  },
  tabText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 12,
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#8A94A6',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orgName: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 11,
    color: '#6236FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: 'Urbanist_800ExtraBold',
    fontSize: 9,
    letterSpacing: 0.3,
  },
  taskTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#1E1B4B',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 12,
    color: '#8A94A6',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  attachmentBadgeText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
    color: '#0284C7',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  dragHandleWrapper: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 20,
    color: '#1E1B4B',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  modalScroll: {
    flex: 1,
  },
  modalOrg: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#6236FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalTaskTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 20,
    color: '#1E1B4B',
    lineHeight: 28,
    marginBottom: 12,
  },
  modalDueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  modalDueText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 13,
    color: '#EF4444',
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#1E1B4B',
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  attachBtnFile: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  attachBtnTextFile: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#059669',
  },
  attachBtnUrl: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  attachBtnTextUrl: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#0284C7',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  inputLabel: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#475569',
    marginTop: 12,
    marginBottom: 6,
  },
  statusPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusPickerItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusPickerItemActive: {
    backgroundColor: '#6236FF',
    borderColor: '#6236FF',
  },
  statusPickerItemText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#475569',
  },
  statusPickerItemTextActive: {
    color: '#FFFFFF',
  },
  remarksInput: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#1E1B4B',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 80,
    textAlignVertical: 'top',
  },
  linkInput: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#1E1B4B',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
  },
  filePickerBtnText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#6236FF',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedFileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  selectedFileName: {
    flex: 1,
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 13,
    color: '#065F46',
  },
  selectedFileSize: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    color: '#047857',
  },
  removeFileBtn: {
    padding: 4,
    borderRadius: 4,
  },
  submitBtn: {
    backgroundColor: '#6236FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
