import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';


interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignout: boolean;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri; // Ex: "192.168.1.100:8081"
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const API_URL = getApiUrl();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            user: action.payload,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            user: action.payload,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            user: action.payload,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            user: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          dispatch({ type: 'RESTORE_TOKEN', payload: JSON.parse(userJson) });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }
      } catch (e) {
        console.warn('Failed to restore token', e);
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isSignout: state.isSignout,
    signUp: async (email: string, name: string, password: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            password,
            currencyPreference: 'BRL',
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Falha ao registrar.');
        }

        const data = await response.json();
        const newUser: User = data.user;
        const token = data.token;

        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem(`user_${email}_token`, token);
        await AsyncStorage.setItem(`user_${email}_password`, password);

        dispatch({ type: 'SIGN_UP', payload: newUser });
      } catch (e: any) {
        throw new Error(e.message || 'Falha ao registrar. Tente novamente.');
      }
    },
    signIn: async (email: string, password: string, rememberMe: boolean) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'E-mail ou senha incorretos.');
        }

        const data = await response.json();
        const user: User = data.user;
        const token = data.token;

        if (rememberMe) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
        await AsyncStorage.setItem(`user_${email}_token`, token);
        await AsyncStorage.setItem(`user_${email}_password`, password);

        dispatch({ type: 'SIGN_IN', payload: user });
      } catch (e: any) {
        throw new Error(e.message || 'E-mail ou senha incorretos.');
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('user');
        dispatch({ type: 'SIGN_OUT' });
      } catch {
        throw new Error('Falha ao fazer logout.');
      }
    },
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
