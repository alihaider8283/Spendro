import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface ButtonProps {
  title: string;
  onPress?: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();
  
  const isButtonDisabled = disabled || isLoading;

  // Primary variant colors
  const primaryBg = theme.primary;
  const primaryTextColor = '#ffffff';

  // Outline/social variant colors
  const outlineBorderColor = theme.backgroundSelected;
  const outlineTextColor = theme.text;

  const getButtonStyle = (pressed: boolean) => {
    const baseStyle: ViewStyle = {
      paddingVertical: variant === 'primary' ? 14 : 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: pressed ? 0.8 : 1,
    };

    if (variant === 'primary') {
      return [
        baseStyle,
        {
          backgroundColor: isButtonDisabled ? '#A0A0A0' : primaryBg,
        },
        style,
      ];
    } else {
      return [
        baseStyle,
        {
          borderWidth: 1,
          borderColor: outlineBorderColor,
          backgroundColor: 'transparent',
        },
        style,
      ];
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') {
      return primaryTextColor;
    }
    return outlineTextColor;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isButtonDisabled}
      style={({ pressed }) => getButtonStyle(pressed)}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? primaryTextColor : theme.text} />
      ) : (
        <ThemedText
          style={[
            variant === 'primary' ? styles.primaryText : styles.outlineText,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
