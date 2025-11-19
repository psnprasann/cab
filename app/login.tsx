import { useDrivers } from '@/contexts/DriverContext';
import { LogIn, UserCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [isDriver, setIsDriver] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const { login, registerDriver } = useDrivers();
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    
    if (isRegister) {
      if (!name.trim() || !phone.trim() || !password.trim()) {
        setError('All fields are required');
        return;
      }
      const success = await registerDriver(name.trim(), phone.trim(), password);
      if (success) {
        setIsRegister(false);
        setName('');
        setPhone('');
        setPassword('');
        setError('');
      } else {
        setError('Phone number already exists');
      }
    } else {
      if (!phone.trim() || !password.trim()) {
        setError('Phone and password are required');
        return;
      }
      const success = await login(phone.trim(), password, !isDriver);
      if (success) {
        router.replace(isDriver ? '/driver' : '/admin');
      } else {
        setError('Invalid credentials');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6', '#60a5fa']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <LogIn size={64} color="#fff" strokeWidth={1.5} />
            <Text style={styles.title}>Driver Availability</Text>
            <Text style={styles.subtitle}>Manage your schedule efficiently</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isDriver && styles.toggleButtonActive]}
                onPress={() => {
                  setIsDriver(true);
                  setError('');
                }}
              >
                <UserCircle
                  size={20}
                  color={isDriver ? '#fff' : '#64748b'}
                  strokeWidth={2}
                />
                <Text style={[styles.toggleText, isDriver && styles.toggleTextActive]}>
                  Driver
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isDriver && styles.toggleButtonActive]}
                onPress={() => {
                  setIsDriver(false);
                  setIsRegister(false);
                  setError('');
                }}
              >
                <LogIn size={20} color={!isDriver ? '#fff' : '#64748b'} strokeWidth={2} />
                <Text style={[styles.toggleText, !isDriver && styles.toggleTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {isDriver && !isRegister && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsRegister(true);
                  setError('');
                }}
              >
                <Text style={styles.switchButtonText}>New driver? Register here</Text>
              </TouchableOpacity>
            )}

            {isDriver && isRegister && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsRegister(false);
                  setError('');
                }}
              >
                <Text style={styles.switchButtonText}>Already have an account? Login</Text>
              </TouchableOpacity>
            )}

            <View style={styles.form}>
              {isDriver && isRegister && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {isDriver ? 'Phone Number' : 'Admin Username'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={isDriver ? 'Enter phone number' : 'Enter username'}
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType={isDriver ? 'phone-pad' : 'default'}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {isRegister ? 'Register' : 'Login'}
                </Text>
              </TouchableOpacity>

              {!isDriver && (
                <View style={styles.adminHint}>
                  <Text style={styles.adminHintText}>
                    Default: admin / admin123
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#fff',
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  switchButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600' as const,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  adminHint: {
    alignItems: 'center',
    marginTop: 8,
  },
  adminHintText: {
    fontSize: 12,
    color: '#64748b',
  },
});
