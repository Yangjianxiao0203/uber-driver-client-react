import React, { useState, createContext } from 'react';
import axios from 'axios';

interface IAuthContext {
    auth: string | null;
    setAuthToken: (token: string | null) => void;
  }
  
export const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<string | null>(null);
  
  const setAuthToken = (token : string | null) => {
    if (token) {
      axios.defaults.headers.common["x-auth-token"] = token;
      setAuth(token); 
    } else {
      delete axios.defaults.headers.common["x-auth-token"];
      setAuth(null);
    }
  };
  
  // 我们将setAuthToken函数和auth state一起传递给子组件
  return <AuthContext.Provider value={{ auth, setAuthToken }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;