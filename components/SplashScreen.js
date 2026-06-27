import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Center content */}
      <View style={styles.contentContainer}>
        {/* Thin horizontal line above logo */}
        <View style={styles.dividerLine} />

        {/* Logo Image */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/splash.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Footer Text */}
      <View style={styles.footerContainer}>
        {/* <Text style={styles.footerText}>EST 2026</Text> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c1039', // Background color #2c1039
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    width: 150,
    height: 1,
    backgroundColor: '#FFFFFF33', // Thin translucent white line
    marginBottom: 48, // Generous spacing above the logo
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 240,
    height: 240,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#8D7B9D', // Balanced lavender text color for contrast against #2c1039
    letterSpacing: 4, // Spread out letters
    textTransform: 'uppercase',
  },
});
