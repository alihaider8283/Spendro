import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ONBOARDING_COMPLETE_KEY = 'spendro:onboarding-complete';
const FIRST_TIME_SETUP_COMPLETE_KEY = 'spendro:first-time-setup-complete';

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

export async function getFirstTimeSetupComplete() {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(FIRST_TIME_SETUP_COMPLETE_KEY) === 'true';
    }

    const value = await AsyncStorage.getItem(FIRST_TIME_SETUP_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Failed to get first-time setup status:', error);
    return false;
  }
}

export async function setFirstTimeSetupComplete() {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(FIRST_TIME_SETUP_COMPLETE_KEY, 'true');
      return;
    }

    await AsyncStorage.setItem(FIRST_TIME_SETUP_COMPLETE_KEY, 'true');
  } catch (error) {
    console.warn('Failed to set first-time setup status:', error);
  }
}
