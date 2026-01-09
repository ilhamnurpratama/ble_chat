import { Platform } from 'react-native';

import { CHAT_NOTIFY_CHARACTERISTIC_UUID, CHAT_SERVICE_UUID, CHAT_WRITE_CHARACTERISTIC_UUID } from './constants';
import { mockBleClient } from './mockBleClient';
import type { BleAdapter } from './types';

const shouldMock = Platform.OS === 'web' || process.env.EXPO_PUBLIC_USE_MOCK_BLE === 'true';

// Avoid importing the native BleManager on web by loading lazily.
const bleClient = shouldMock ? null : require('./bleClient').bleClient as BleAdapter;

export const bleAdapter: BleAdapter = shouldMock ? mockBleClient : (bleClient as BleAdapter);
export type { BleAdapter } from './types';
export { CHAT_NOTIFY_CHARACTERISTIC_UUID, CHAT_SERVICE_UUID, CHAT_WRITE_CHARACTERISTIC_UUID };

