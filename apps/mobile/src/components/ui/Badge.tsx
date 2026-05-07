import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const variantColors = {
  success: { bg: colors.success, text: '#2D6A4F' },
  warning: { bg: colors.warning, text: '#8B5E3C' },
  error: { bg: colors.error, text: '#8B3A3A' },
  info: { bg: colors.primaryLight, text: colors.primaryDark },
  neutral: { bg: colors.surfaceAlt, text: colors.textSecondary },
};

export function Badge({ text, variant = 'neutral' }: BadgeProps) {
  const colorSet = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colorSet.bg }]}>
      <Text style={[styles.text, { color: colorSet.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
