import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface UserData {
  id?: string;
  username?: string; // Added username for shareable profile links
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  profession: string;
  locationType: string;
  serviceArea?: string;
  profileImageUrl?: string;
  voicemailMessage?: string;
  smsFollowUpMessage?: string;
  availabilityHours?: string; // JSON string with availability hours
  customInsights?: Array<{
    label: string;
    value: string | number;
    isVisible: boolean;
  }>;
  stats?: {
    clientsHelped: number;
    tasksCompleted: number;
    goalsReached: number;
    satisfactionRate: number;
  };
  // Additional properties for UI demo
  businessHours?: Array<{
    day: string;
    opens: string;
    closes: string;
  }>;
  reviews?: Array<{
    id: number;
    name: string;
    rating: number;
    date: string;
    comment: string;
  }>;
  cancellationPolicy?: string;
  services: Array<{
    name: string;
    description?: string;
    duration: number;
    price: number;
    locationType?: string;
  }>;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  setUser: (user: UserData | null) => void;
  updateUser: (userData: Partial<UserData>) => void;
  clearUser: () => void;
}

const defaultUserContext: UserContextType = {
  user: null,
  isLoading: true,
  setUser: () => {},
  updateUser: () => {},
  clearUser: () => {},
};

export const UserContext = createContext<UserContextType>(defaultUserContext);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load user data from local storage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save user data to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }, [user]);

  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    if (userData === null) {
      localStorage.removeItem('userData');
    }
  };

  const updateUser = (userData: Partial<UserData>) => {
    setUserState(prev => {
      if (!prev) return userData as UserData;
      return { ...prev, ...userData };
    });
    
    // Invalidate any related queries
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const clearUser = () => {
    setUserState(null);
    localStorage.removeItem('userData');
    queryClient.invalidateQueries();
  };

  return (
    <UserContext.Provider value={{ user, isLoading, setUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}