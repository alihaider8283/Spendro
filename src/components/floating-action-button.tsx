import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FABProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export function FAB({ onPress, style }: FABProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/expense/add');
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.pressed,
        style,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Add new expense"
    >
      <Ionicons name="add" size={28} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3369F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 99,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
