import React, { useMemo, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useBleStore } from '@/state/bleStore';

export default function ChatScreen() {
  const { messages, connectedDevice, sendMessage, status } = useBleStore();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => a.timestamp - b.timestamp), [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    void sendMessage(text);
    setDraft('');
  };

  const renderBubble = ({ item }: any) => {
    const isMe = item.from === 'me';
    return (
      <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : undefined]}>
        <Card style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleDevice]}>
          <Text style={styles.bubbleSender}>{isMe ? 'Me' : connectedDevice?.name ?? 'Device'}</Text>
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Text style={styles.bubbleMeta}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
        </Card>
      </View>
    );
  };

  if (!connectedDevice) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No device connected</Text>
        <Text style={styles.emptySubtitle}>Go to the Devices tab, connect, then return here to chat.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{connectedDevice.name}</Text>
          <Text style={styles.subtitle}>{connectedDevice.id}</Text>
        </View>
        <Badge label={status === 'connected' ? 'Live' : status} tone="success" />
      </View>

      <FlatList
        ref={listRef}
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderBubble}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.composer}>
        <TextField
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          multiline
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Button label="Send" onPress={handleSend} disabled={!draft.trim()} />
      </View>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  listContent: {
    gap: 8,
    paddingBottom: 20,
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
  },
  bubbleMe: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  bubbleDevice: {
    backgroundColor: '#ffffff',
  },
  bubbleSender: {
    fontWeight: '700',
    fontSize: 12,
    color: '#111827',
    marginBottom: 4,
  },
  bubbleText: {
    color: '#111827',
    fontSize: 15,
    marginBottom: 4,
  },
  bubbleMeta: {
    color: '#9ca3af',
    fontSize: 11,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 16 : 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
});
