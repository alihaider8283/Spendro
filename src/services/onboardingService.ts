import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ONBOARDING_COMPLETE_KEY = 'spendro:onboarding-complete';

export async function getOnboardingComplete() {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    }

    // Use AsyncStorage for development, falls back gracefully if unavailable
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Failed to get onboarding status:', error);
    return false;
  }
}

export async function setOnboardingComplete() {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      return;
    }

    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.warn('Failed to set onboarding status:', error);
  }
}
