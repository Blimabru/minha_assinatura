import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';

let AsyncStorage: any = null;

// Importar AsyncStorage de forma segura
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // Se falhar, criar um mock para web/testes
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => null,
    removeItem: async () => null,
    getAllKeys: async () => [],
  };
}

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
        // Em uma aplicação real, isso faria uma chamada à API
        // Por enquanto, apenas salvamos localmente
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
        };

        // Salvamos os dados do usuário incluindo a senha (simplificado)
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem(`user_${email}_password`, password);

        dispatch({ type: 'SIGN_UP', payload: newUser });
      } catch {
        throw new Error('Falha ao registrar. Tente novamente.');
      }
    },
    signIn: async (email: string, password: string, rememberMe: boolean) => {
      try {
        // Em uma aplicação real, isso faria uma chamada à API
        // Verificamos se o usuário existe e a senha está correta
        const storedPassword = await AsyncStorage.getItem(`user_${email}_password`);

        if (!storedPassword || storedPassword !== password) {
          throw new Error('E-mail ou senha incorretos.');
        }

        // Buscamos os dados do usuário
        const allKeys = await AsyncStorage.getAllKeys();
        let user: User | null = null;

        // Procuramos pelo usuário com este email
        for (const key of allKeys) {
          if (key === 'user') {
            const storedUser = await AsyncStorage.getItem(key);
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.email === email) {
                user = parsedUser;
                break;
              }
            }
          }
        }

        if (!user) {
          throw new Error('Usuário não encontrado.');
        }

        if (rememberMe) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        dispatch({ type: 'SIGN_IN', payload: user });
      } catch (e) {
        throw e;
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
