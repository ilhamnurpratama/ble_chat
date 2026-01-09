# BLE Chat (Expo + React Native)

A Bluetooth Low Energy chat demo built with Expo Router, Zustand state, and a mock BLE layer for web/dev. Devices tab scans and connects, Chat tab exchanges messages, Settings tab documents UUIDs and setup.

## Requirements
- Node 20.19.4+ recommended (current setup works on 20.10.0 but prints engine warnings)
- Expo CLI (`npm i -g expo` optional)
- Android or iOS device for real BLE (Expo Go cannot access BLE APIs)

## Quick start
1) Install deps
```
npm install
```
2) (Optional) Run mock mode for web/no-hardware
```
# .env
EXPO_PUBLIC_USE_MOCK_BLE=true
```
3) Start dev server
```
npm run start
```
4) For real BLE, build a dev client (one-time per platform)
```
npx expo prebuild
npx expo run:android --device
# or
npx expo run:ios --device
```
Then open the project from the dev client app.

## BLE UUIDs
Update these to match your peripheral:
- Service UUID: see [libs/ble/constants.ts](libs/ble/constants.ts)
- Notify characteristic UUID: see [libs/ble/constants.ts](libs/ble/constants.ts)
- Write characteristic UUID: see [libs/ble/constants.ts](libs/ble/constants.ts)
The demo uses the same UUID for notify/write; adjust if your characteristic differs.

## App flows
- Devices: scan, view RSSI, connect/disconnect ([app/(tabs)/index.tsx](app/(tabs)/index.tsx))
- Chat: send/receive messages with the connected device ([app/(tabs)/chat.tsx](app/(tabs)/chat.tsx))
- Settings: shows configured UUIDs and run instructions ([app/(tabs)/settings.tsx](app/(tabs)/settings.tsx))

## Architecture
- BLE adapter: real client + mock switch ([libs/ble/index.ts](libs/ble/index.ts))
- Real BLE implementation: scan/connect/monitor/write ([libs/ble/bleClient.ts](libs/ble/bleClient.ts))
- Mock BLE for web/dev: fake devices + echo ([libs/ble/mockBleClient.ts](libs/ble/mockBleClient.ts))
- State: devices, connection, messages via Zustand ([state/bleStore.ts](state/bleStore.ts))
- In-memory history placeholder ([api/history.ts](api/history.ts))
- UI primitives ([components/ui](components/ui))

## Permissions
- iOS: custom Bluetooth usage strings set in [app.json](app.json)
- Android: BLUETOOTH_SCAN/CONNECT and fine location set in [app.json](app.json)

## Troubleshooting
- Engine warnings on install: upgrade Node to >=20.19.4 to satisfy react-native/metro engine ranges.
- Expo Go limitation: build a dev client (`npx expo run:android --device` or `npx expo run:ios --device`).
- Cannot find devices: ensure UUIDs match your peripheral and Bluetooth/location permissions are granted.
- Need persistence: replace the in-memory history in [api/history.ts](api/history.ts) with AsyncStorage or a backend.

## Scripts
- `npm run start` — start Metro
- `npm run android` — start with Android device/emulator
- `npm run ios` — start with iOS simulator/device
- `npm run web` — run web (uses mock BLE unless you disable it)
