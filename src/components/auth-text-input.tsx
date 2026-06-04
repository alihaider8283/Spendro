import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';

interface AuthTextInputProps extends Omit<ComponentProps<typeof TextInput>, 'style'> {
  label: string;
  iconName: ComponentProps<typeof Ionicons>['name'];
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  helperText?: string;
  error?: string;
}

export function AuthTextInput({
  label,
  iconName,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  helperText,
  error,
  ...props
}: AuthTextInputProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.formGroup}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedView style={[styles.inputContainer, { borderColor: error ? '#EF4444' : colors.backgroundElement }]}>
        <Ionicons name={iconName} size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        {showPasswordToggle && (
          <Pressable onPress={onTogglePassword} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </ThemedView>
      {error ? (
        <ThemedText type="small" style={[styles.helperText, { color: '#EF4444' }]}>
          {error}
        </ThemedText>
      ) : helperText ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.helperText}>
          {helperText}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 8,
  },
  helperText: {
    marginTop: 4,
  },
});
