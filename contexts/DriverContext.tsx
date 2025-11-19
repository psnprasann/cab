import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  password: string;
}

export interface AvailabilityEntry {
  driverId: string;
  date: string;
  available: boolean;
}

interface DriverState {
  drivers: Driver[];
  availability: AvailabilityEntry[];
  currentUser: Driver | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (phone: string, password: string, asAdmin?: boolean) => Promise<boolean>;
  logout: () => void;
  registerDriver: (name: string, phone: string, password: string) => Promise<boolean>;
  setAvailability: (driverId: string, date: string, available: boolean) => void;
  getDriverAvailability: (driverId: string, date: string) => boolean | undefined;
  getAllDriversAvailability: (date: string) => { driver: Driver; available: boolean | undefined }[];
}

const STORAGE_KEYS = {
  DRIVERS: 'drivers_list',
  AVAILABILITY: 'drivers_availability',
  CURRENT_USER: 'current_user',
  IS_ADMIN: 'is_admin',
};

const ADMIN_CREDENTIALS = {
  phone: 'admin',
  password: 'admin123',
};

export const [DriverProvider, useDrivers] = createContextHook((): DriverState => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<Driver | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [driversData, availabilityData, currentUserData, isAdminData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DRIVERS),
        AsyncStorage.getItem(STORAGE_KEYS.AVAILABILITY),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
        AsyncStorage.getItem(STORAGE_KEYS.IS_ADMIN),
      ]);

      if (driversData) setDrivers(JSON.parse(driversData));
      if (availabilityData) setAvailability(JSON.parse(availabilityData));
      if (currentUserData) setCurrentUser(JSON.parse(currentUserData));
      if (isAdminData) setIsAdmin(JSON.parse(isAdminData));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveDrivers = useCallback(async (newDrivers: Driver[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(newDrivers));
      setDrivers(newDrivers);
    } catch (error) {
      console.error('Failed to save drivers:', error);
    }
  }, []);

  const saveAvailability = useCallback(async (newAvailability: AvailabilityEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(newAvailability));
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Failed to save availability:', error);
    }
  }, []);

  const login = useCallback(async (phone: string, password: string, asAdmin = false): Promise<boolean> => {
    if (asAdmin) {
      if (phone === ADMIN_CREDENTIALS.phone && password === ADMIN_CREDENTIALS.password) {
        setIsAdmin(true);
        setCurrentUser(null);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(true));
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return true;
      }
      return false;
    }

    const driver = drivers.find((d) => d.phone === phone && d.password === password);
    if (driver) {
      setCurrentUser(driver);
      setIsAdmin(false);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(driver));
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(false));
      return true;
    }
    return false;
  }, [drivers]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    setIsAdmin(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
  }, []);

  const registerDriver = useCallback(async (name: string, phone: string, password: string): Promise<boolean> => {
    if (drivers.some((d) => d.phone === phone)) {
      return false;
    }

    const newDriver: Driver = {
      id: Date.now().toString(),
      name,
      phone,
      password,
    };

    await saveDrivers([...drivers, newDriver]);
    return true;
  }, [drivers, saveDrivers]);

  const setAvailabilityEntry = useCallback((driverId: string, date: string, available: boolean) => {
    const existingIndex = availability.findIndex(
      (entry) => entry.driverId === driverId && entry.date === date
    );

    let newAvailability: AvailabilityEntry[];
    if (existingIndex >= 0) {
      newAvailability = [...availability];
      newAvailability[existingIndex] = { driverId, date, available };
    } else {
      newAvailability = [...availability, { driverId, date, available }];
    }

    saveAvailability(newAvailability);
  }, [availability, saveAvailability]);

  const getDriverAvailability = useCallback((driverId: string, date: string): boolean | undefined => {
    const entry = availability.find((e) => e.driverId === driverId && e.date === date);
    return entry?.available;
  }, [availability]);

  const getAllDriversAvailability = useCallback((date: string) => {
    return drivers.map((driver) => ({
      driver,
      available: getDriverAvailability(driver.id, date),
    }));
  }, [drivers, getDriverAvailability]);

  return useMemo(() => ({
    drivers,
    availability,
    currentUser,
    isAdmin,
    isLoading,
    login,
    logout,
    registerDriver,
    setAvailability: setAvailabilityEntry,
    getDriverAvailability,
    getAllDriversAvailability,
  }), [drivers, availability, currentUser, isAdmin, isLoading, login, logout, registerDriver, setAvailabilityEntry, getDriverAvailability, getAllDriversAvailability]);
});
