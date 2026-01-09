import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

export function TextField(props: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholderTextColor="#9ca3af"
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
});
