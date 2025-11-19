import Calendar from '@/components/Calendar';
import { useDrivers } from '@/contexts/DriverContext';
import { format, isSameDay } from '@/utils/dateUtils';
import { LogOut, Calendar as CalendarIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DriverScreen() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const { currentUser, logout, setAvailability, getDriverAvailability } = useDrivers();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const markedDates = useMemo(() => {
    if (!currentUser) return {};
    
    const dates: { [key: string]: { available?: boolean; unavailable?: boolean } } = {};
    const today = new Date();
    const monthsToShow = 3;

    for (let month = -1; month <= monthsToShow; month++) {
      const date = new Date(today.getFullYear(), today.getMonth() + month, 1);
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        const availability = getDriverAvailability(currentUser.id, dateStr);

        if (availability === false) {
          dates[dateStr] = { unavailable: true };
        } else if (availability === true) {
          dates[dateStr] = { available: true };
        }
      }
    }

    return dates;
  }, [currentUser, getDriverAvailability]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDates(prev => {
      const isAlreadySelected = prev.some(d => isSameDay(d, date));
      if (isAlreadySelected) {
        return prev.filter(d => !isSameDay(d, date));
      } else {
        return [...prev, date];
      }
    });
  };

  const handleSaveAvailable = async () => {
    if (currentUser && selectedDates.length > 0) {
      const availableList: { date: string; available: boolean }[] = [];
      
      selectedDates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        availableList.push({ date: dateStr, available: true });
      });
      
      for (const item of availableList) {
        setAvailability(currentUser.id, item.date, item.available);
      }
      
      setSelectedDates([]);
      alert('All dates saved successfully');
    }
  };

  const handleSaveUnavailable = async () => {
    if (currentUser && selectedDates.length > 0) {
      const notAvailableList: { date: string; available: boolean }[] = [];
      
      selectedDates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        notAvailableList.push({ date: dateStr, available: false });
      });
      
      for (const item of notAvailableList) {
        setAvailability(currentUser.id, item.date, item.available);
      }
      
      setSelectedDates([]);
      alert('All dates saved successfully');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{currentUser.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={24} color="#000" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Manage Availability</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select dates and choose an option to save</Text>

          <Calendar
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            markedDates={markedDates}
            mode="unavailable"
          />
          
          {selectedDates.length > 0 && (
            <View style={styles.saveButtons}>
              <TouchableOpacity 
                style={styles.saveButtonGreen}
                onPress={handleSaveAvailable}
              >
                <Text style={styles.saveButtonText}>
                  Save Available ({selectedDates.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButtonRed}
                onPress={handleSaveUnavailable}
              >
                <Text style={styles.saveButtonText}>
                  Save Not Available ({selectedDates.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Not Available</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500' as const,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#000',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  statusCardAvailable: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  statusCardUnavailable: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#64748b',
    marginTop: 12,
  },
  statusTextAvailable: {
    color: '#22c55e',
  },
  statusTextUnavailable: {
    color: '#ef4444',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availableButton: {
    backgroundColor: '#22c55e',
  },
  unavailableButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonActive: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  legend: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
    marginBottom: 12,
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500' as const,
  },

  saveButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButtonGreen: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonRed: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
