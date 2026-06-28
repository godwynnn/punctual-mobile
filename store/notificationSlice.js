import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from './authSlice';

// Fetch active notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      if (!token) return [];

      const response = await fetch(`${API_BASE_URL}/api/main/notifications/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch notifications');
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Mark all as read
export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/main/notifications/read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to mark notifications read');
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.list.some(n => n.id === action.payload.id);
      if (!exists) {
        state.list.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.filter(n => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list = state.list.map(n => ({ ...n, is_read: true }));
        state.unreadCount = 0;
      });
  }
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
