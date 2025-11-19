import { useDrivers } from '@/contexts/DriverContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function IndexScreen() {
  const { isLoading, currentUser, isAdmin } = useDrivers();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isAdmin) {
    return <Redirect href="/admin" />;
  }

  if (currentUser) {
    return <Redirect href="/driver" />;
  }

  return <Redirect href="/login" />;
}
