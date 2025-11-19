import Calendar from '@/components/Calendar';
import { useDrivers } from '@/contexts/DriverContext';
import { format } from '@/utils/dateUtils';
import { LogOut, Calendar as CalendarIcon, Users, Check, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { logout, drivers, getAllDriversAvailability } = useDrivers();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const driversAvailability = getAllDriversAvailability(format(selectedDate, 'yyyy-MM-dd')) || [];

  const availableDrivers = (driversAvailability || []).filter((d) => d.available !== false);
  const unavailableDrivers = (driversAvailability || []).filter((d) => d.available === false);

  const markedDates = useMemo(() => {
    const dates: { [key: string]: { available?: boolean; unavailable?: boolean } } = {};
    const today = new Date();
    const monthsToShow = 3;

    for (let month = -1; month <= monthsToShow; month++) {
      const date = new Date(today.getFullYear(), today.getMonth() + month, 1);
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayDrivers = getAllDriversAvailability(dateStr);

        if (dayDrivers && dayDrivers.length > 0) {
          const hasAvailable = dayDrivers.some((d) => d.available === true);
          const hasUnavailable = dayDrivers.some((d) => d.available === false);

          if (hasAvailable && !hasUnavailable) {
            dates[dateStr] = { available: true };
          } else if (hasUnavailable && !hasAvailable) {
            dates[dateStr] = { unavailable: true };
          }
        }
      }
    }

    return dates;
  }, [getAllDriversAvailability]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bgGradient} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.name}>Driver Availability</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#2563eb" strokeWidth={2} />
            <Text style={styles.statNumber}>{drivers.length}</Text>
            <Text style={styles.statLabel}>Total Drivers</Text>
          </View>
          <View style={styles.statCard}>
            <Check size={24} color="#22c55e" strokeWidth={2.5} />
            <Text style={styles.statNumber}>{availableDrivers.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <X size={24} color="#ef4444" strokeWidth={2.5} />
            <Text style={styles.statNumber}>{unavailableDrivers.length}</Text>
            <Text style={styles.statLabel}>Not Available</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={24} color="#2563eb" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <Calendar
            selectedDates={[selectedDate]}
            onDateSelect={setSelectedDate}
            markedDates={markedDates}
            mode="available"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.selectedDateText}>
            {format(selectedDate, 'MMMM dd, yyyy')}
          </Text>

          {drivers.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No Drivers Registered</Text>
              <Text style={styles.emptyStateText}>
                Drivers need to register to appear here
              </Text>
            </View>
          ) : (
            <>
              {availableDrivers.length > 0 && (
                <View style={styles.driverGroup}>
                  <View style={styles.driverGroupHeader}>
                    <Check size={20} color="#22c55e" strokeWidth={2.5} />
                    <Text style={[styles.driverGroupTitle, { color: '#22c55e' }]}>
                      Available ({availableDrivers.length})
                    </Text>
                  </View>
                  {availableDrivers.map((item) => (
                    <View key={item.driver.id} style={[styles.driverCard, styles.driverCardAvailable]}>
                      <View>
                        <Text style={styles.driverName}>{item.driver.name}</Text>
                        <Text style={styles.driverPhone}>{item.driver.phone}</Text>
                      </View>
                      <View style={[styles.statusBadge, styles.statusBadgeAvailable]}>
                        <Text style={styles.statusBadgeText}>Available</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {unavailableDrivers.length > 0 && (
                <View style={styles.driverGroup}>
                  <View style={styles.driverGroupHeader}>
                    <X size={20} color="#ef4444" strokeWidth={2.5} />
                    <Text style={[styles.driverGroupTitle, { color: '#ef4444' }]}>
                      Not Available ({unavailableDrivers.length})
                    </Text>
                  </View>
                  {unavailableDrivers.map((item) => (
                    <View key={item.driver.id} style={[styles.driverCard, styles.driverCardUnavailable]}>
                      <View>
                        <Text style={styles.driverName}>{item.driver.name}</Text>
                        <Text style={styles.driverPhone}>{item.driver.phone}</Text>
                      </View>
                      <View style={[styles.statusBadge, styles.statusBadgeUnavailable]}>
                        <Text style={styles.statusBadgeText}>Not Available</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#2563eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500' as const,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1e293b',
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  driverGroup: {
    marginBottom: 20,
  },
  driverGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  driverGroupTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  driverCardAvailable: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  driverCardUnavailable: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  driverPhone: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  statusBadgeAvailable: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeUnavailable: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748b',
  },
});
