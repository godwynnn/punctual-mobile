import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = 260; // Size of the scanner square bounding box

export default function QRScanner({ onBack, onScanSuccess }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchActive, setTorchActive] = useState(false);

  // Animated Scan Line
  const translateY = useSharedValue(-SCAN_SIZE / 2);

  useEffect(() => {
    if (permission && permission.granted) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(SCAN_SIZE / 2, { duration: 2000 }),
          withTiming(-SCAN_SIZE / 2, { duration: 2000 })
        ),
        -1, // Infinite loops
        true // Reverse direction automatically
      );
    }
  }, [permission]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Barcode / QR Code Scanned handler
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    console.log('Scanned QR:', data);

    if (onScanSuccess) {
      onScanSuccess(data);
    }
  };

  // 1. Loading permission state
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  // 2. Permission Check Screen
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconWrapper}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#6236FF" strokeWidth={2}>
              <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <Path d="M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
            </Svg>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDesc}>
            puntua needs access to your camera to scan QR codes for attendance verification.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} activeOpacity={0.8} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
          {onBack && (
            <TouchableOpacity style={styles.cancelLink} onPress={onBack}>
              <Text style={styles.cancelLinkText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // 3. Scanner Active Screen
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        enableTorch={torchActive}
      />

      {/* Glassmorphism/Dark Mask Overlay */}
      <View style={styles.overlayContainer}>
        <View style={styles.maskRow} />
        
        <View style={styles.reticleRow}>
          <View style={styles.maskSide} />
          
          <View style={styles.reticleBox}>
            {/* Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated Laser Scanning Line */}
            <Animated.View style={[styles.laserLine, animatedLineStyle]} />
          </View>
          
          <View style={styles.maskSide} />
        </View>
        
        <View style={styles.maskRow}>
          {/* Instructions and Controls */}
          <View style={styles.instructionsWrapper}>
            <Text style={styles.instructionsText}>Align QR code inside the frame</Text>
            <Text style={styles.subInstructionsText}>Scanning is automatic and instant</Text>
          </View>

          <View style={styles.controlsRow}>
            {onBack && (
              <TouchableOpacity style={styles.roundControlBtn} activeOpacity={0.8} onPress={onBack}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                  <Path d="M19 12H5M12 19l-7-7 7-7" />
                </Svg>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.roundControlBtn, torchActive && styles.activeControlBtn]} 
              activeOpacity={0.8} 
              onPress={() => setTorchActive(!torchActive)}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={torchActive ? "#6236FF" : "#FFFFFF"} strokeWidth={2}>
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 16,
    color: '#6236FF',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FAF9FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  permissionIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDesc: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#6236FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionBtnText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelLink: {
    marginTop: 20,
  },
  cancelLinkText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  overlayContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  maskRow: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleRow: {
    height: SCAN_SIZE,
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  reticleBox: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#6236FF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    width: SCAN_SIZE - 20,
    height: 2,
    backgroundColor: '#6236FF',
    shadowColor: '#6236FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  instructionsWrapper: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  instructionsText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subInstructionsText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    gap: 20,
  },
  roundControlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControlBtn: {
    backgroundColor: '#FFFFFF',
  },
});
