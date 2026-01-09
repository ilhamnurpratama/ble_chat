export type BleDevice = {
  id: string;
  name: string;
  rssi?: number | null;
};

export type BleMessage = {
  id: string;
  from: 'device' | 'me';
  text: string;
  timestamp: number;
};

export type MessageListener = (payload: {
  text: string;
  deviceId: string;
  timestamp: number;
}) => void;

export type BleAdapter = {
  startScan: (onDeviceFound: (device: BleDevice) => void) => Promise<void>;
  stopScan: () => void;
  connect: (deviceId: string) => Promise<BleDevice>;
  disconnect: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  onMessage: (listener: MessageListener) => () => void;
  getConnectedDevice: () => BleDevice | null;
  isScanning: () => boolean;
};
