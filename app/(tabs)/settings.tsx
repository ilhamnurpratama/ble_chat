import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CHAT_NOTIFY_CHARACTERISTIC_UUID, CHAT_SERVICE_UUID, CHAT_WRITE_CHARACTERISTIC_UUID } from '@/libs/ble';

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>BLE chat settings</Text>
      <Text style={styles.subtitle}>Update the UUIDs to match your peripheral and build a development client to test.</Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Service and characteristics</Text>
        <Row label="Service" value={CHAT_SERVICE_UUID} />
        <Row label="Notify" value={CHAT_NOTIFY_CHARACTERISTIC_UUID} />
        <Row label="Write" value={CHAT_WRITE_CHARACTERISTIC_UUID} />
        <Badge label="Edit constants in libs/ble/constants.ts" tone="warning" style={styles.badge} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>How to run on device</Text>
        <Text style={styles.body}>1. Connect a physical Android/iOS device (BLE is not available in Expo Go).</Text>
        <Text style={styles.body}>2. Run expo prebuild once: npx expo prebuild</Text>
        <Text style={styles.body}>3. Build a dev client: npx expo run:android --device or npx expo run:ios --device</Text>
        <Text style={styles.body}>4. Start the dev server: npm run start, then open with the dev client.</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Mock mode</Text>
        <Text style={styles.body}>Set EXPO_PUBLIC_USE_MOCK_BLE=true in your .env to simulate devices on web or when hardware is unavailable.</Text>
      </Card>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
  },
  card: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    gap: 4,
  },
  rowLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  rowValue: {
    color: '#111827',
    fontFamily: 'monospace',
  },
  badge: {
    marginTop: 6,
  },
  body: {
    color: '#111827',
  },
});
