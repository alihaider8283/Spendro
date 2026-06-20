import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type OnboardingScreenProps = {
  onDone: () => Promise<void> | void;
};

const slides = [
  {
    title: 'Track Every Expense',
    body: 'Log your income and spending in seconds. See exactly where your money goes, day by day.',
    icon: 'wallet-outline' as const,
    color: '#3369F6',
    decorColor: 'rgba(51,105,246,0.1)',
  },
  {
    title: 'Create Smart Budgets',
    body: 'Set monthly budgets by category and get alerts before you overspend — always stay in control.',
    icon: 'pie-chart-outline' as const,
    color: '#7C3AED',
    decorColor: 'rgba(124,58,237,0.1)',
  },
  {
    title: 'Build Better Habits',
    body: 'Understand your spending patterns over time and take small steps toward lasting financial health.',
    icon: 'trending-up-outline' as const,
    color: '#059669',
    decorColor: 'rgba(5,150,105,0.1)',
  },
] as const;

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { width } = useWindowDimensions();

  const activeSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  const illustrationSize = Math.min(width * 0.52, 210);

  // Animation values
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Entrance fade on mount
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [headerOpacity]);

  // Breathing pulse on the rings
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 1.13,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Scale, {
            toValue: 1.07,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Scale, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [ring1Scale, ring2Scale]);

  const animateTransition = useCallback(
    (nextIndex: number) => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: -28,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 0.72,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActiveIndex(nextIndex);
        contentTranslateY.setValue(32);
        iconScale.setValue(0.72);

        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.spring(contentTranslateY, {
            toValue: 0,
            damping: 18,
            stiffness: 200,
            useNativeDriver: true,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            damping: 11,
            stiffness: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [contentOpacity, contentTranslateY, iconScale]
  );

  const completeOnboarding = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onDone();
    } catch {
      setIsSaving(false);
    }
  }, [isSaving, onDone]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      void completeOnboarding();
      return;
    }
    animateTransition(activeIndex + 1);
  }, [activeIndex, animateTransition, completeOnboarding, isLastSlide]);

  const ring1Size = illustrationSize + 56;
  const ring2Size = illustrationSize + 112;

  return (
    <ThemedView style={styles.screen}>
      {/* Background decorative blobs */}
      <View
        style={[styles.bgBlob1, { backgroundColor: activeSlide.decorColor }]}
      />
      <View
        style={[styles.bgBlob2, { backgroundColor: activeSlide.decorColor }]}
      />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={[styles.brandIcon, { backgroundColor: activeSlide.color }]}>
          <Ionicons name="sparkles-outline" size={17} color="#FFFFFF" />
        </View>
        <ThemedText type="default" style={styles.brandText}>Spendro</ThemedText>
        <View style={styles.flex1} />
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          hitSlop={12}
          onPress={() => void completeOnboarding()}
          style={styles.skipButton}
        >
          <ThemedText type="smallBold" style={styles.skipText}>Skip</ThemedText>
        </Pressable>
      </Animated.View>

      {/* Illustration */}
      <View style={styles.illustrationWrap}>
        {/* Outer pulse ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: ring2Size,
              height: ring2Size,
              borderRadius: ring2Size / 2,
              backgroundColor: activeSlide.decorColor,
              transform: [{ scale: ring2Scale }],
            },
          ]}
        />
        {/* Inner pulse ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: ring1Size,
              height: ring1Size,
              borderRadius: ring1Size / 2,
              backgroundColor: activeSlide.decorColor,
              transform: [{ scale: ring1Scale }],
            },
          ]}
        />
        {/* Main icon circle */}
        <Animated.View
          style={[
            styles.iconCircle,
            {
              width: illustrationSize,
              height: illustrationSize,
              borderRadius: illustrationSize / 2,
              backgroundColor: activeSlide.color,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Ionicons
            name={activeSlide.icon}
            size={illustrationSize * 0.42}
            color="#FFFFFF"
          />
        </Animated.View>
      </View>

      {/* Slide copy */}
      <Animated.View
        style={[
          styles.copy,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <ThemedText type="default" style={styles.slideTitle}>
          {activeSlide.title}
        </ThemedText>
        <ThemedText type="default" style={styles.slideBody}>
          {activeSlide.body}
        </ThemedText>
      </Animated.View>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        {/* Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex
                  ? [styles.activeDot, { backgroundColor: activeSlide.color }]
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: activeSlide.color },
            (pressed || isSaving) && styles.nextButtonPressed,
          ]}
        >
          <ThemedText type="smallBold" style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  flex1: {
    flex: 1,
  },

  // Background
  bgBlob1: {
    borderRadius: 999,
    height: 340,
    position: 'absolute',
    right: -100,
    top: -80,
    width: 340,
  },
  bgBlob2: {
    bottom: -120,
    borderRadius: 999,
    height: 300,
    left: -100,
    position: 'absolute',
    width: 300,
  },

  // Header
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingTop: Spacing.five,
  },
  brandIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  brandText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  skipButton: {
    padding: Spacing.two,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 15,
  },

  // Illustration
  illustrationWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  // Copy
  copy: {
    alignItems: 'center',
    paddingBottom: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  slideBody: {
    fontSize: 15,
    lineHeight: 23,
    opacity: 0.55,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingBottom: Spacing.four,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  activeDot: {
    borderRadius: 4,
    width: 28,
  },
  inactiveDot: {
    backgroundColor: '#DADDE3',
    borderRadius: 4,
    width: 8,
  },
  nextButton: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    height: 54,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
