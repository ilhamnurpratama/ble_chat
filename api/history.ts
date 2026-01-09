import type { BleMessage } from '@/libs/ble/types';

const memoryStore: Record<string, BleMessage[]> = {};

export async function loadConversation(deviceId: string) {
  return memoryStore[deviceId] ?? [];
}

export async function saveConversation(deviceId: string, messages: BleMessage[]) {
  memoryStore[deviceId] = messages;
}
