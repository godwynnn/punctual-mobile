import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For local development:
// 10.0.2.2:8000 points to localhost from the Android emulator.
// localhost:8000 points to localhost from iOS simulator.
// Replace with your local machine's IP (e.g. 192.168.x.x) if testing on a physical device.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');
console.log("API_BASE_URL", process.env.EXPO_PUBLIC_API_URL)
// Async Thunk: Load credentials stored in Async Storage on app startup
export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await AsyncStorage.getItem('@access_token');
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      const userDataString = await AsyncStorage.getItem('@user_data');

      if (accessToken && userDataString) {
        const user = JSON.parse(userDataString);
        return { accessToken, refreshToken, user };
      }
      return null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: User Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Store in Async Storage
      await AsyncStorage.setItem('@access_token', data.access);
      await AsyncStorage.setItem('@refresh_token', data.refresh);
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));

      return {
        accessToken: data.access,
        refreshToken: data.refresh,
        user: data.user,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: User Register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ fullName, employeeId, email, password }, { rejectWithValue }) => {
    try {
      // Split full name into first and last name if possible
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          employee_id: employeeId || '',
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // DRF serializer errors formatting helper
        let errorMsg = 'Registration failed';
        if (data.email) errorMsg = `Email: ${data.email[0]}`;
        else if (data.employee_id) errorMsg = `Employee ID: ${data.employee_id[0]}`;
        else if (data.password) errorMsg = `Password: ${data.password[0]}`;
        else if (data.error) errorMsg = data.error;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: User Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const refreshToken = auth.refreshToken;

      // Clean local storage first to keep UI responsive
      await AsyncStorage.removeItem('@access_token');
      await AsyncStorage.removeItem('@refresh_token');
      await AsyncStorage.removeItem('@user_data');

      // Call backend logout view to blacklist the refresh token
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/users/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Bypass-Tunnel-Reminder': 'true',
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      }

      return null;
    } catch (err) {
      // Return success anyway since local credentials are gone
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    isStartupLoading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadStoredAuth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isStartupLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isStartupLoading = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isStartupLoading = false;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
