import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';


interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignout: boolean;
  isPremium: boolean;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  purchasePremium: () => Promise<void>;
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
            user: action.payload.user,
            isPremium: action.payload.isPremium,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            user: action.payload.user,
            isPremium: action.payload.isPremium,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            user: action.payload.user,
            isPremium: action.payload.isPremium,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            user: null,
            isPremium: false,
          };
        case 'SET_PREMIUM':
          return {
            ...prevState,
            isPremium: action.payload,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      user: null,
      isPremium: false,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const userObj = JSON.parse(userJson);
          const token = await AsyncStorage.getItem(`user_${userObj.email}_token`);
          
          let refreshedUser = userObj;
          let isPremium = false;
          
          try {
            const response = await fetch(`${API_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const remoteUser = await response.json();
              if (remoteUser) {
                refreshedUser = { ...userObj, ...remoteUser };
                isPremium = remoteUser.isPremium === true;
                await AsyncStorage.setItem('user', JSON.stringify(refreshedUser));
                await AsyncStorage.setItem(`user_premium_${userObj.email}`, isPremium ? 'true' : 'false');
              }
            }
          } catch (fetchErr) {
            console.warn('Sem rede ao restaurar token. Usando cache local.');
            const cachedPremium = await AsyncStorage.getItem(`user_premium_${userObj.email}`);
            isPremium = cachedPremium === 'true';
          }

          dispatch({ 
            type: 'RESTORE_TOKEN', 
            payload: { user: refreshedUser, isPremium } 
          });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, isPremium: false } });
        }
      } catch (e) {
        console.warn('Failed to restore token', e);
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, isPremium: false } });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isSignout: state.isSignout,
    isPremium: state.isPremium,
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
        await AsyncStorage.setItem(`user_premium_${email}`, 'false');

        dispatch({ type: 'SIGN_UP', payload: { user: newUser, isPremium: false } });
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

        const isPremium = user.isPremium === true;
        await AsyncStorage.setItem(`user_premium_${email}`, isPremium ? 'true' : 'false');
        dispatch({ type: 'SIGN_IN', payload: { user, isPremium } });
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
    purchasePremium: async () => {
      try {
        if (!state.user) return;
        const email = state.user.email;
        const token = await AsyncStorage.getItem(`user_${email}_token`);
        const response = await fetch(`${API_URL}/auth/premium`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ isPremium: true }),
        });

        if (!response.ok) {
          throw new Error('Falha ao registrar compra no servidor.');
        }

        const refreshedUser = { ...state.user, isPremium: true };
        await AsyncStorage.setItem('user', JSON.stringify(refreshedUser));
        await AsyncStorage.setItem(`user_premium_${email}`, 'true');
        
        dispatch({ type: 'SET_PREMIUM', payload: true });
      } catch (e) {
        console.warn('Erro ao comprar premium:', e);
        throw new Error('Falha ao registrar compra.');
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
