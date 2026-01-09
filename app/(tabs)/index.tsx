import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useBleStore } from '@/state/bleStore';

export default function DevicesScreen() {
  const { devices, scanning, status, connectedDevice, error, startScan, stopScan, connectToDevice, disconnect } = useBleStore();

  useEffect(() => {
    void startScan();
  }, [startScan]);

  const handleToggleScan = () => {
    if (scanning) {
      stopScan();
    } else {
      void startScan();
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby devices</Text>
          <Text style={styles.subtitle}>{status === 'scanning' ? 'Scanning…' : 'Tap scan to refresh the list.'}</Text>
        </View>
        <Button label={scanning ? 'Stop scan' : 'Scan'} onPress={handleToggleScan} variant={scanning ? 'outline' : 'primary'} />
      </View>

      {connectedDevice ? (
        <Card style={styles.connectedCard}>
          <Text style={styles.connectedLabel}>Connected</Text>
          <Text style={styles.connectedName}>{connectedDevice.name}</Text>
          <Text style={styles.connectedMeta}>{connectedDevice.id}</Text>
          <Button label="Disconnect" onPress={() => void disconnect()} variant="outline" />
        </Card>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={scanning} onRefresh={() => void startScan()} />}
        ListEmptyComponent={<Text style={styles.emptyText}>{scanning ? 'Scanning for devices…' : 'No devices found yet.'}</Text>}
        renderItem={({ item }) => {
          const isConnected = connectedDevice?.id === item.id;
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.deviceMeta}>{item.id}</Text>
                </View>
                {isConnected && <Badge label="Connected" tone="success" />}
              </View>
              <View style={styles.row}>
                <Text style={styles.deviceMeta}>{typeof item.rssi === 'number' ? `RSSI ${item.rssi} dBm` : 'RSSI n/a'}</Text>
                <Button
                  label={isConnected ? 'Disconnect' : 'Connect'}
                  onPress={() => (isConnected ? void disconnect() : void connectToDevice(item.id))}
                  variant={isConnected ? 'outline' : 'primary'}
                />
              </View>
            </Card>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    gap: 10,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deviceMeta: {
    color: '#6b7280',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 24,
  },
  errorText: {
    textAlign: 'center',
    color: '#dc2626',
    marginVertical: 10,
  },
  connectedCard: {
    marginBottom: 12,
    gap: 6,
  },
  connectedLabel: {
    color: '#16a34a',
    fontWeight: '700',
  },
  connectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  connectedMeta: {
    color: '#6b7280',
    fontSize: 13,
  },
});
