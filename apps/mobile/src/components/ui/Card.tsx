import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  children: React.ReactNode;
}

export function Card({ variant = 'default', style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  elevated: {
    borderWidth: 0,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
