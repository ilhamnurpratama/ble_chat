import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

type BadgeProps = ViewProps & {
  label: string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
};

export function Badge({ label, tone = 'neutral', style, ...rest }: BadgeProps) {
  return (
    <View style={[styles.base, tones[tone], style]} {...rest}>
      <Text style={[styles.text, tone === 'neutral' ? undefined : styles.textOnColor]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  text: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  textOnColor: {
    color: '#ffffff',
  },
});

const tones = StyleSheet.create({
  neutral: {},
  success: { backgroundColor: '#16a34a' },
  danger: { backgroundColor: '#dc2626' },
  warning: { backgroundColor: '#d97706' },
});
