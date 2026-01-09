import { PermissionsAndroid, Platform } from 'react-native';

export async function requestBlePermissions() {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 31) {
    const scan = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth scan permission',
        message: 'BLE Chat needs to scan for nearby devices.',
        buttonPositive: 'Allow',
      }
    );

    const connect = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Bluetooth connect permission',
        message: 'BLE Chat needs to connect to devices you select.',
        buttonPositive: 'Allow',
      }
    );

    return scan === 'granted' && connect === 'granted';
  }

  const location = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message: 'Location access is required to scan for BLE devices.',
      buttonPositive: 'Allow',
    }
  );

  return location === 'granted';
}
