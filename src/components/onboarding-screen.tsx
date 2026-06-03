import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type OnboardingScreenProps = {
  onDone: () => Promise<void> | void;
};

const slides = [
  {
    title: 'Scan Any Receipt Instantly',
    body: 'Point your camera at any receipt and let AI do the rest - auto-categorized in seconds.',
    icon: 'camera-outline',
  },
  {
    title: 'Understand Every Dollar',
    body: 'Track income, expenses, budgets, and category trends from one calm finance dashboard.',
    icon: 'analytics-outline',
  },
  {
    title: 'Get Smarter AI Insights',
    body: 'Spot spending patterns, receive monthly summaries, and get budget recommendations early.',
    icon: 'sparkles-outline',
  },
] as const;

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { width } = useWindowDimensions();
  const activeSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  const illustrationSize = useMemo(() => Math.min(width - 64, 600), [width]);

  const completeOnboarding = useCallback(async () => {
    if (isSaving) {
      return;
    }

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

    setActiveIndex((current) => current + 1);
  }, [completeOnboarding, isLastSlide]);

  return (
    <SafeAreaView style={styles.screen}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.brand}>
          <ThemedView style={styles.brandIcon}>
            <Ionicons name="sparkles-outline" size={27} color="#FFFFFF" />
          </ThemedView>
          <ThemedText type="title" style={styles.brandText}>Spendro</ThemedText>
        </ThemedView>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          hitSlop={12}
          onPress={completeOnboarding}
          style={styles.skipButton}>
          <ThemedText type="smallBold" style={styles.skipText}>Skip</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.body}>
        <ThemedView
          style={[
            styles.illustration,
            {
              width: illustrationSize,
              height: illustrationSize,
            },
          ]}>
          <View style={styles.backgroundCircleTop} />
          <View style={styles.backgroundCircleBottom} />
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptTitleLine} />
              <View style={styles.receiptDot} />
            </View>
            <View style={styles.receiptLineWide} />
            <View style={styles.receiptLineMedium} />
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <View style={styles.receiptLineSmall} />
              <View style={styles.receiptAmountLine} />
            </View>
            <View style={styles.receiptRow}>
              <View style={styles.receiptLineMidSmall} />
              <View style={styles.receiptAmountLine} />
            </View>
            <View style={styles.receiptFooter}>
              <View style={styles.receiptDarkPill} />
              <View style={styles.receiptBluePill} />
            </View>
          </View>
          <View style={styles.cameraBadgeWrap}>
            <View style={styles.cameraBadge}>
              <Ionicons name={activeSlide.icon} size={36} color="#FFFFFF" />
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.copy}>
          <ThemedText type="title" style={styles.title}>{activeSlide.title}</ThemedText>
          <ThemedText type="subtitle" style={styles.bodyText}>{activeSlide.body}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            (pressed || isSaving) && styles.nextButtonPressed,
          ]}>
          <ThemedText type="smallBold" style={styles.nextButtonText}>{isLastSlide ? 'Get Started' : 'Next'}</ThemedText>
          <Ionicons name="arrow-forward" size={26} color="#FFFFFF" />
        </Pressable>

        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              style={[styles.dot, index === activeIndex ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: '#2F7DF6',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  brandText: {
    color: '#080A0F',
    fontSize: 28,
    fontWeight: '800',
  },
  skipButton: {
    padding: Spacing.two,
  },
  skipText: {
    color: '#71717A',
    fontSize: 25,
    fontWeight: '700',
  },
  body: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.five,
  },
  illustration: {
    backgroundColor: '#2F7DF6',
    borderRadius: 48,
    maxHeight: 600,
    maxWidth: 600,
    overflow: 'visible',
  },
  backgroundCircleTop: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 140,
    height: 280,
    position: 'absolute',
    right: -24,
    top: -4,
    width: 280,
  },
  backgroundCircleBottom: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 170,
    bottom: -96,
    height: 340,
    left: -86,
    position: 'absolute',
    width: 340,
  },
  receiptCard: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginTop: '31%',
    padding: Spacing.four,
    width: '53%',
  },
  receiptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  receiptTitleLine: {
    backgroundColor: '#D4D4D8',
    borderRadius: 8,
    height: 14,
    width: '42%',
  },
  receiptDot: {
    backgroundColor: '#2F7DF6',
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  receiptLineWide: {
    backgroundColor: '#F1F1F3',
    borderRadius: 8,
    height: 12,
    marginBottom: 14,
    width: '100%',
  },
  receiptLineMedium: {
    backgroundColor: '#F1F1F3',
    borderRadius: 8,
    height: 12,
    marginBottom: 20,
    width: '66%',
  },
  receiptDivider: {
    borderStyle: 'dashed',
    borderTopColor: '#DADDE3',
    borderTopWidth: 1.5,
    marginBottom: 20,
  },
  receiptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  receiptLineSmall: {
    backgroundColor: '#F1F1F3',
    borderRadius: 8,
    height: 12,
    width: '38%',
  },
  receiptLineMidSmall: {
    backgroundColor: '#F1F1F3',
    borderRadius: 8,
    height: 12,
    width: '45%',
  },
  receiptAmountLine: {
    backgroundColor: '#C4C4C8',
    borderRadius: 8,
    height: 12,
    width: '25%',
  },
  receiptFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  receiptDarkPill: {
    backgroundColor: '#575757',
    borderRadius: 8,
    height: 14,
    width: '32%',
  },
  receiptBluePill: {
    backgroundColor: '#2F7DF6',
    borderRadius: 8,
    height: 14,
    width: '38%',
  },
  cameraBadgeWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    bottom: -22,
    padding: 14,
    position: 'absolute',
    right: -22,
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: '#2F7DF6',
    borderRadius: 22,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  copy: {
    alignItems: 'center',
    marginTop: Spacing.six,
    maxWidth: 620,
  },
  title: {
    color: '#080A0F',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  bodyText: {
    color: '#6F6F7B',
    fontSize: 20,
    lineHeight: 29,
    maxWidth: 620,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: Spacing.four,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: '#2F7DF6',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    height: 64,
    justifyContent: 'center',
    marginBottom: Spacing.five,
  },
  nextButtonPressed: {
    opacity: 0.82,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  dot: {
    height: 14,
  },
  activeDot: {
    backgroundColor: '#2F7DF6',
    borderRadius: 8,
    width: 45,
  },
  inactiveDot: {
    backgroundColor: '#EFEFF1',
    borderRadius: 7,
    width: 14,
  },
});
