import { loadConversation, saveConversation } from '@/api/history';
import { bleAdapter } from '@/libs/ble';
import type { BleDevice, BleMessage } from '@/libs/ble/types';
import { create } from 'zustand';

export type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'error';

type BleState = {
  devices: BleDevice[];
  messages: BleMessage[];
  connectedDevice: BleDevice | null;
  scanning: boolean;
  status: ConnectionStatus;
  error?: string;
};

type BleActions = {
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
};

const listenerRef: { current?: () => void } = {};

const persistMessages = (deviceId: string, messages: BleMessage[]) => {
  void saveConversation(deviceId, messages);
};

export const useBleStore = create<BleState & BleActions>((set, get) => ({
  devices: [],
  messages: [],
  connectedDevice: null,
  scanning: false,
  status: 'idle',
  error: undefined,

  startScan: async () => {
    set({ scanning: true, status: 'scanning', error: undefined, devices: [] });

    try {
      await bleAdapter.startScan((device) => {
        set((state) => {
          const exists = state.devices.some((item) => item.id === device.id);
          if (exists) return state;
          return { ...state, devices: [...state.devices, device] };
        });
      });

      set((state) => ({
        scanning: false,
        status: state.connectedDevice ? 'connected' : 'idle',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to scan for devices';
      set({ scanning: false, status: 'error', error: message });
    }
  },

  stopScan: () => {
    bleAdapter.stopScan();
    set((state) => ({ scanning: false, status: state.connectedDevice ? 'connected' : 'idle' }));
  },

  connectToDevice: async (deviceId: string) => {
    set({ status: 'connecting', error: undefined });

    try {
      const device = await bleAdapter.connect(deviceId);
      const history = await loadConversation(device.id);

      listenerRef.current?.();
      listenerRef.current = bleAdapter.onMessage(({ text, timestamp }) => {
        set((state) => {
          const incoming: BleMessage = {
            id: `${device.id}-incoming-${timestamp}`,
            from: 'device',
            text,
            timestamp,
          };
          const nextMessages = [...state.messages, incoming];
          persistMessages(device.id, nextMessages);
          return { messages: nextMessages };
        });
      });

      set({ connectedDevice: device, messages: history, status: 'connected' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to connect';
      set({ status: 'error', error: message, connectedDevice: null });
    }
  },

  disconnect: async () => {
    listenerRef.current?.();
    listenerRef.current = undefined;
    await bleAdapter.disconnect();
    set({ connectedDevice: null, status: 'idle' });
  },

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    const device = get().connectedDevice;
    if (!device || !trimmed) return;

    const outgoing: BleMessage = {
      id: `${device.id}-me-${Date.now()}`,
      from: 'me',
      text: trimmed,
      timestamp: Date.now(),
    };

    set((state) => {
      const messages = [...state.messages, outgoing];
      persistMessages(device.id, messages);
      return { messages };
    });

    try {
      await bleAdapter.sendMessage(trimmed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: message, status: 'connected' });
    }
  },

  clearError: () => set({ error: undefined }),
}));
