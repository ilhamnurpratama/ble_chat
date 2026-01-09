import { Buffer } from 'buffer';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';

import {
    CHAT_NOTIFY_CHARACTERISTIC_UUID,
    CHAT_SERVICE_UUID,
    CHAT_WRITE_CHARACTERISTIC_UUID,
    SCAN_DURATION_MS,
} from './constants';
import { requestBlePermissions } from './permissions';
import type { BleAdapter, BleDevice, MessageListener } from './types';

const globalWithBuffer = globalThis as typeof globalThis & { Buffer?: typeof Buffer };

if (typeof globalWithBuffer.Buffer === 'undefined') {
  globalWithBuffer.Buffer = Buffer;
}

class BleChatClient implements BleAdapter {
  private manager = new BleManager();
  private connectedDevice: Device | null = null;
  private monitorSub?: Subscription;
  private scanning = false;

  isScanning() {
    return this.scanning;
  }

  getConnectedDevice(): BleDevice | null {
    if (!this.connectedDevice) return null;

    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.name ?? 'Unknown',
      rssi: this.connectedDevice.rssi,
    };
  }

  async startScan(onDeviceFound: (device: BleDevice) => void) {
    const permitted = await requestBlePermissions();
    if (!permitted) {
      throw new Error('Bluetooth permission not granted');
    }

    this.stopScan();
    this.scanning = true;

    return new Promise<void>((resolve, reject) => {
      const seen = new Set<string>();

      this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
        if (error) {
          this.stopScan();
          reject(error);
          return;
        }

        if (device && !seen.has(device.id)) {
          seen.add(device.id);
          onDeviceFound({
            id: device.id,
            name: device.name ?? 'Unknown',
            rssi: device.rssi,
          });
        }
      });

      setTimeout(() => {
        this.stopScan();
        resolve();
      }, SCAN_DURATION_MS);
    });
  }

  stopScan() {
    if (this.scanning) {
      this.manager.stopDeviceScan();
      this.scanning = false;
    }
  }

  async connect(deviceId: string): Promise<BleDevice> {
    const permitted = await requestBlePermissions();
    if (!permitted) {
      throw new Error('Bluetooth permission not granted');
    }

    const device = await this.manager.connectToDevice(deviceId, { timeout: 15000 });
    const discovered = await device.discoverAllServicesAndCharacteristics();
    this.connectedDevice = discovered;

    return {
      id: discovered.id,
      name: discovered.name ?? 'Unknown',
      rssi: discovered.rssi,
    };
  }

  async disconnect() {
    this.monitorSub?.remove();
    this.monitorSub = undefined;

    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      } catch (error) {
        // Ignore cancellation errors because disconnect is best-effort.
      }
    }

    this.connectedDevice = null;
  }

  onMessage(listener: MessageListener) {
    if (!this.connectedDevice) {
      return () => undefined;
    }

    this.monitorSub?.remove();
    this.monitorSub = this.manager.monitorCharacteristicForDevice(
      this.connectedDevice.id,
      CHAT_SERVICE_UUID,
      CHAT_NOTIFY_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error || !characteristic?.value || !this.connectedDevice) {
          return;
        }

        const text = Buffer.from(characteristic.value, 'base64').toString('utf-8');
        listener({ text, deviceId: this.connectedDevice.id, timestamp: Date.now() });
      }
    );

    return () => this.monitorSub?.remove();
  }

  async sendMessage(text: string) {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    const encoded = Buffer.from(text, 'utf-8').toString('base64');
    await this.manager.writeCharacteristicWithResponseForDevice(
      this.connectedDevice.id,
      CHAT_SERVICE_UUID,
      CHAT_WRITE_CHARACTERISTIC_UUID,
      encoded
    );
  }
}

export const bleClient: BleAdapter = new BleChatClient();
