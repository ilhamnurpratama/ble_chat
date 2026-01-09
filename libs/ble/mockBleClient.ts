import type { BleAdapter, BleDevice, MessageListener } from './types';

const mockDevices: BleDevice[] = [
  { id: 'mock-alpha', name: 'Mock Beacon Alpha', rssi: -55 },
  { id: 'mock-beta', name: 'Mock Beacon Beta', rssi: -63 },
  { id: 'mock-gamma', name: 'Mock Beacon Gamma', rssi: -72 },
];

class MockBleClient implements BleAdapter {
  private connected: BleDevice | null = null;
  private scanning = false;
  private listener?: MessageListener;
  private heartbeat?: ReturnType<typeof setInterval>;

  isScanning() {
    return this.scanning;
  }

  getConnectedDevice() {
    return this.connected;
  }

  async startScan(onDeviceFound: (device: BleDevice) => void) {
    this.scanning = true;

    mockDevices.forEach((device, index) => {
      setTimeout(() => {
        if (this.scanning) {
          onDeviceFound(device);
        }
      }, index * 400);
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    this.scanning = false;
  }

  stopScan() {
    this.scanning = false;
  }

  async connect(deviceId: string): Promise<BleDevice> {
    const device = mockDevices.find((item) => item.id === deviceId) ?? mockDevices[0];
    this.connected = device;
    this.startHeartbeat();
    return device;
  }

  async disconnect() {
    this.stopHeartbeat();
    this.connected = null;
  }

  onMessage(listener: MessageListener) {
    this.listener = listener;
    return () => {
      this.listener = undefined;
    };
  }

  async sendMessage(text: string) {
    if (!this.connected || !this.listener) return;

    setTimeout(() => {
      if (this.connected && this.listener) {
        this.listener({ text: `Echo: ${text}`, deviceId: this.connected.id, timestamp: Date.now() });
      }
    }, 300);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    if (!this.connected) return;

    this.heartbeat = setInterval(() => {
      if (this.connected && this.listener) {
        this.listener({
          text: `${this.connected.name} ping @ ${new Date().toLocaleTimeString()}`,
          deviceId: this.connected.id,
          timestamp: Date.now(),
        });
      }
    }, 6000);
  }

  private stopHeartbeat() {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
    }

    this.heartbeat = undefined;
  }
}

export const mockBleClient: BleAdapter = new MockBleClient();
