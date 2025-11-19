import { format, isSameDay } from '@/utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  markedDates?: {
    [key: string]: { available?: boolean; unavailable?: boolean };
  };
  mode: 'available' | 'unavailable';
}

export default function Calendar({ selectedDates, onDateSelect, markedDates = {}, mode }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDateStatus = (date: Date | null) => {
    if (!date) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return markedDates[dateStr];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color="#2563eb" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color="#2563eb" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const status = getDateStatus(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDates.some(d => isSameDay(d, day));

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={() => onDateSelect(day)}
            >
              {status?.unavailable ? (
                <View style={styles.unavailableCircle}>
                  <Text style={styles.unavailableText}>
                    {day.getDate()}
                  </Text>
                </View>
              ) : status?.available ? (
                <View style={styles.availableCircle}>
                  <Text style={styles.availableText}>
                    {day.getDate()}
                  </Text>
                </View>
              ) : isSelected ? (
                <View style={mode === 'available' ? styles.selectedCircleGreen : styles.selectedCircleRed}>
                  <Text style={mode === 'available' ? styles.selectedTextGreen : styles.selectedTextRed}>
                    {day.getDate()}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.dayText,
                    isToday && styles.todayText,
                  ]}
                >
                  {day.getDate()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    padding: 4,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#000',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: '#374151',
  },
  todayText: {
    color: '#000',
    fontWeight: '600' as const,
  },
  unavailableCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#fff',
  },
  availableCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#fff',
  },
  selectedCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTextGreen: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#22c55e',
  },
  selectedCircleRed: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fecaca',
    borderWidth: 2,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTextRed: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ef4444',
  },
});
