import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInRight,
  FadeInLeft,
  Layout
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../store/authSlice';

const { width } = Dimensions.get('window');

// Custom SVG Icons
const FingerprintLogo = ({ color = '#6236FF' }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M2 12a10 10 0 0 1 18-6M5 13a7 7 0 0 1 12-4.5M8 14.5c.5-.8 1.5-1.5 2.5-1.5s2 .7 2.5 1.5M10.5 18a1.5 1.5 0 1 0 3 0" strokeLinecap="round" />
    <Path d="M12 2v2M4.22 4.22l1.42 1.42M19.78 4.22l-1.42 1.42M2 12h2M20 12h2M12 20v2M4.22 19.78l1.42-1.42M19.78 19.78l-1.42-1.42" strokeLinecap="round" />
  </Svg>
);

const BiometricScanGraphic = ({ color = '#6236FF' }) => (
  <Svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    {/* Outer brackets representing scanning focus */}
    <Path d="M4 8V5a2 2 0 0 1 2-2h3M15 3h3a2 2 0 0 1 2 2v3M20 16v3a2 2 0 0 1-2 2h-3M9 21H6a2 2 0 0 1-2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Inner user profile scanning symbol */}
    <Circle cx={12} cy={9} r={3} />
    <Path d="M7 17.5a5 5 0 0 1 10 0" strokeLinecap="round" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.59 5.59 0 0 1-2.42 3.7v3.08h3.9a11.96 11.96 0 0 0 3.57-8.63z" />
    <Path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.9-3.08c-1.08.72-2.47 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.19A11.99 11.99 0 0 0 12 24z" />
    <Path fill="#FBBC05" d="M5.27 14.21A7.18 7.18 0 0 1 4.9 12c0-.77.13-1.52.37-2.21V6.6H1.21A11.98 11.98 0 0 0 0 12c0 2.21.6 4.29 1.66 6.1l3.61-2.89z" />
    <Path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.21 6.6l4.06 3.19c.95-2.85 3.6-4.96 6.73-4.96z" />
  </Svg>
);

const IdIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={4} width={18} height={16} rx={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    <Circle cx={8} cy={15} r={2} />
    <Path d="M14 17h4M14 14h2" strokeLinecap="round" />
  </Svg>
);

const LockIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const UserIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

const EmailIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

const EyeIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx={12} cy={12} r={3} />
  </Svg>
);

const EyeOffIcon = ({ color = '#8A94A6' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" strokeLinecap="round" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#10B981' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" />
    <Path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState('login'); // 'login' or 'register'

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('alex.smith@puntua.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  // Clear errors when view changes
  useEffect(() => {
    dispatch(clearError());
  }, [view, dispatch]);

  // Alert popup when Redux reports API errors
  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      Alert.alert("Validation Error", "Please enter a valid work email.");
      return;
    }
    if (!loginPassword) {
      Alert.alert("Validation Error", "Please enter your password.");
      return;
    }
    dispatch(loginUser({
      email: loginEmail.trim(),
      password: loginPassword
    }));
  };

  const handleRegister = () => {
    if (!regFirstName.trim()) {
      Alert.alert("Validation Error", "Please enter your first name.");
      return;
    }
    if (!regLastName.trim()) {
      Alert.alert("Validation Error", "Please enter your last name.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      Alert.alert("Validation Error", "Please enter a valid work email.");
      return;
    }
    if (regPassword.length < 8) {
      Alert.alert("Validation Error", "Password must be at least 8 characters (backend policy).");
      return;
    }

    dispatch(registerUser({
      fullName: `${regFirstName.trim()} ${regLastName.trim()}`,
      email: regEmail.trim(),
      password: regPassword
    })).unwrap()
      .then(() => {
        Alert.alert(
          "Account Created",
          "Your registration was successful! You can now log in.",
          [
            {
              text: "Log In Now",
              onPress: () => {
                setLoginEmail(regEmail.trim());
                setLoginPassword(regPassword);
                setView('login');
              }
            }
          ]
        );
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 96 + insets.bottom }]} showsVerticalScrollIndicator={false}>

          {/* Brand Header */}
          <View style={styles.brandHeader}>
            {/* <View style={styles.brandLogoBg}> */}
            <Image
              source={require('../assets/logo_2.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            {/* </View> */}
            <Text style={styles.brandName}>punctuahr</Text>
          </View>

          {/* Card Container */}
          <View style={styles.cardContainer}>
            {view === 'login' ? (
              <Animated.View entering={FadeInLeft.duration(300)} layout={Layout}>
                {/* Scan Biometrics Overlay */}
                <View style={styles.scanGraphicWrapper}>
                  <View style={styles.scanGraphicCircle}>
                    <BiometricScanGraphic color="#6236FF" />
                  </View>
                </View>

                <Text style={styles.titleText}>Welcome Back</Text>
                <Text style={styles.subtitleText}>Sign in to access your employee portal</Text>

                {/* Input 1: Email */}
                <Text style={styles.fieldLabel}>Work Email</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <EmailIcon color="#8A94A6" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your work email"
                    placeholderTextColor="#A0AAB9"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Input 2: Password */}
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <LockIcon color="#8A94A6" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#A0AAB9"
                    secureTextEntry={!showPassword}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleContainer}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? <EyeOffIcon color="#8A94A6" /> : <EyeIcon color="#8A94A6" />}
                  </TouchableOpacity>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Login</Text>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                        <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInRight.duration(300)} layout={Layout}>
                <Text style={styles.titleText}>Create Account</Text>
                {/* <Text style={styles.subtitleText}>Step into the Luminous ecosystem today.</Text> */}

                {/* Input 1: First Name */}
                <Text style={styles.fieldLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <UserIcon color="#8A94A6" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="John"
                    placeholderTextColor="#A0AAB9"
                    value={regFirstName}
                    onChangeText={setRegFirstName}
                  />
                </View>

                {/* Input 2: Last Name */}
                <Text style={styles.fieldLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <UserIcon color="#8A94A6" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Doe"
                    placeholderTextColor="#A0AAB9"
                    value={regLastName}
                    onChangeText={setRegLastName}
                  />
                </View>

                {/* Input 3: Email */}
                <Text style={styles.fieldLabel}>Work Email</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <EmailIcon color="#8A94A6" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="john@company.com"
                    placeholderTextColor="#A0AAB9"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={regEmail}
                    onChangeText={setRegEmail}
                  />
                </View>

                {/* Input 4: Password */}
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <LockIcon color="#8A94A6" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••••••"
                    placeholderTextColor="#A0AAB9"
                    secureTextEntry={!showRegPassword}
                    value={regPassword}
                    onChangeText={setRegPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleContainer}
                    onPress={() => setShowRegPassword(!showRegPassword)}
                    activeOpacity={0.7}
                  >
                    {showRegPassword ? <EyeOffIcon color="#8A94A6" /> : <EyeIcon color="#8A94A6" />}
                  </TouchableOpacity>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRegister}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Register</Text>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
                        <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
              <GoogleIcon />
              <Text style={styles.googleButtonText}>
                {view === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </Text>
            </TouchableOpacity>

            {/* Switch view text links */}
            <View style={styles.bottomSwitchRow}>
              <Text style={styles.bottomSwitchText}>
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setView(view === 'login' ? 'register' : 'login')}>
                <Text style={styles.bottomSwitchAction}>
                  {view === 'login' ? 'Register' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>

            {view === 'register' && (
              <View style={styles.encryptionRow}>
                <View style={styles.encryptionItem}>
                  <ShieldCheckIcon color="#10B981" />
                  <Text style={styles.encryptionText}>SECURE SIGNUP</Text>
                </View>
                <View style={styles.encryptionItem}>
                  <ShieldCheckIcon color="#10B981" />
                  <Text style={styles.encryptionText}>DATA ENCRYPTED</Text>
                </View>
              </View>
            )}
          </View>

          {/* Footer Navigation bar links (Login view) */}
          {view === 'login' && (
            <View style={styles.footerLinks}>
              <TouchableOpacity><Text style={styles.footerLinkText}>Support</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLinkText}>Privacy Policy</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLinkText}>Terms of Service</Text></TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Navigation Active Tab Bar */}
      <View style={[styles.footerTabBar, { height: 76 + insets.bottom, paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.footerTabItem, view === 'login' && styles.activeTabBg]}
          onPress={() => setView('login')}
          activeOpacity={0.8}
        >
          <UserIcon color={view === 'login' ? '#6236FF' : '#8A94A6'} />
          <Text style={[styles.footerTabText, view === 'login' && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerTabItem, view === 'register' && styles.activeTabBg]}
          onPress={() => setView('register')}
          activeOpacity={0.8}
        >
          <View style={styles.registerTabIconRow}>
            <UserIcon color={view === 'register' ? '#6236FF' : '#8A94A6'} />
            <Text style={[styles.plusBadge, { color: view === 'register' ? '#6236FF' : '#8A94A6' }]}>+</Text>
          </View>
          <Text style={[styles.footerTabText, view === 'register' && styles.activeTabText]}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 96,
  },
  brandHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  brandLogoBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoImage: {
    width: 60,
    height: 48,
    borderRadius: 12,
  },
  brandName: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#6236FF',
    marginTop: 8,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  scanGraphicWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanGraphicCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FAF9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE9FE',
  },
  titleText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 26,
    color: '#1E1B4B',
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8A94A6',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#6236FF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F6FC',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EBE9FE',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#1E1B4B',
    height: '100%',
  },
  eyeToggleContainer: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#6236FF',
    borderRadius: 100,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEFF8',
  },
  dividerText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8A94A6',
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    height: 52,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButtonText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#334155',
    marginLeft: 10,
  },
  bottomSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomSwitchText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8A94A6',
  },
  bottomSwitchAction: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#6236FF',
  },
  encryptionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  encryptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  encryptionText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
    color: '#8A94A6',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerLinkText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 12,
    color: '#8A94A6',
    marginHorizontal: 10,
  },
  footerTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
  footerTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabBg: {
    backgroundColor: '#EBE9FE',
  },
  footerTabText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#8A94A6',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#6236FF',
  },
  registerTabIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusBadge: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    marginLeft: 1,
    marginTop: -4,
  },
});
