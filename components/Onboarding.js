import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  interpolateColor,
  useAnimatedRef
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Onboarding({ onComplete }) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useAnimatedRef();

  // Scroll handler that maps ScrollView offsets to our Reanimated scrollX shared value
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNextPress = () => {
    if (currentPage < 2) {
      scrollViewRef.current?.scrollTo({ x: (currentPage + 1) * width, animated: true });
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handleBackPress = () => {
    if (currentPage > 0) {
      scrollViewRef.current?.scrollTo({ x: (currentPage - 1) * width, animated: true });
      setCurrentPage(currentPage - 1);
    }
  };

  const handleScrollEnd = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  // Reanimated style for the Next Button sliding translation (left to right)
  const animatedButtonContainerStyle = useAnimatedStyle(() => {
    const leftOffset = interpolate(
      scrollX.value,
      [0, width, 2 * width],
      [32, width - 60 - 32, width - 60 - 32], // slides from left (32) to right (width - button_width - right_padding)
      'clamp'
    );
    return {
      left: leftOffset,
    };
  });

  // Helper component to render animated indicator dots
  const AnimatedDot = ({ index }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const dotWidth = interpolate(
        scrollX.value,
        [(index - 1) * width, index * width, (index + 1) * width],
        [8, 24, 8],
        'clamp'
      );

      const dotColor = interpolateColor(
        scrollX.value,
        [(index - 1) * width, index * width, (index + 1) * width],
        ['#CBD5E1', '#6366F1', '#CBD5E1'] // Morph from slate-gray to brand-indigo
      );

      return {
        width: dotWidth,
        backgroundColor: dotColor,
      };
    });

    return <Animated.View style={[styles.indicatorDot, animatedDotStyle]} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        {/* Left Back Arrow Button (only on pages 2 & 3) */}
        {currentPage > 0 ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth={2.5}>
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // Placeholder for balance
        )}

        {/* Right Skip Button (only on pages 1 & 2) */}
        {currentPage < 2 ? (
          <TouchableOpacity onPress={onComplete} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onComplete} style={styles.closeButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth={2.5}>
              <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Swipeable Paging ScrollView */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        bounces={false}
        style={styles.scrollView}
      >
        {/* Slide 1 */}
        <View style={styles.slide}>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../assets/onboarding1.jpg')}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textWrapper}>
            <Text style={styles.titleText}>Track Your Work Hours Effortlessly</Text>
            <Text style={styles.descriptionText}>
              Clock in and out with a single tap. Our system accurately logs your attendance and syncs with HR in real-time.
            </Text>
          </View>
        </View>

        {/* Slide 2 */}
        <View style={styles.slide}>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../assets/onboarding2.jpg')}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textWrapper}>
            <Text style={styles.titleText}>Manage Tasks Efficiently</Text>
            <Text style={styles.descriptionText}>
              Organize, track, and complete your assigned tasks effectively with real-time updates and seamless status syncs.
            </Text>
          </View>
        </View>

        {/* Slide 3 */}
        <View style={styles.slide}>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../assets/onboarding3.png')}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textWrapper}>
            <Text style={styles.titleText}>Productive Around the Clock</Text>
            <Text style={styles.descriptionText}>
              Maximize your efficiency at any time. Monitor shifts, complete checklists, and optimize your work schedule.
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating sliding Next Button */}
      <View style={styles.buttonWrapper}>
        <Animated.View style={[styles.nextButtonContainer, animatedButtonContainerStyle]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextPress} activeOpacity={0.85}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
              <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Animated Indicators Footer */}
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          <AnimatedDot index={0} />
          <AnimatedDot index={1} />
          <AnimatedDot index={2} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    height: 56,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  skipText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: '#6366F1',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
  },
  illustrationWrapper: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  onboardingImage: {
    width: width * 0.85,
    height: '100%',
  },
  textWrapper: {
    flex: 3,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  titleText: {
    fontFamily: 'Urbanist_900Black',
    fontSize: 28,
    color: '#1E1B4B',
    lineHeight: 36,
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  buttonWrapper: {
    height: 76,
    position: 'relative',
    width: width,
  },
  nextButtonContainer: {
    position: 'absolute',
    bottom: 8,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  footer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  /* Screen 1: Custom Diagram Illustration */
  diagramContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPurpleCard: {
    width: 170,
    height: 170,
    backgroundColor: '#6366F1',
    borderRadius: 36,
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF24',
    borderRadius: 14,
    height: 28,
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  listLineLong: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFFB3',
  },
  listLineShort: {
    width: '50%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFFB3',
  },
  badge: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  clockBadge: {
    top: 0,
    right: 0,
  },
  profileBadge: {
    bottom: 0,
    left: 0,
  },

  /* Screen 2: Image Card Mockup */
  imageCardContainer: {
    width: 220,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowBackdrop: {
    position: 'absolute',
    width: 200,
    height: 220,
    backgroundColor: '#E2E8F0',
    borderRadius: 28,
    transform: [{ rotate: '-6deg' }],
  },
  imageCardDark: {
    width: 200,
    height: 220,
    backgroundColor: '#0F172A',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  mockupImage: {
    width: '100%',
    height: '100%',
  },

  /* Screen 3: 3D Avatar Illustration */
  avatarContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFrame: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E0E7FF',
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 2,
  },
  badgeTopRight: {
    top: 10,
    right: 10,
  },
  badgeBottomLeft: {
    bottom: 10,
    left: 10,
  },
});
