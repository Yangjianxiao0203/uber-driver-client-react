import React, { useState, createContext, useEffect } from 'react';
import axios from 'axios';

export interface IAuthContext {
    auth: string | null;
    setAuthToken: (token: string | null) => void;
  }
  
export const AuthContext = createContext<IAuthContext>({ auth: null, setAuthToken: () => {} });

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<string | null>(localStorage.getItem("token"));
  
  const setAuthToken = (token : string | null) => {
    if (token) {
      // axios.defaults.headers.common["x-auth-token"] = token;
      setAuth(token); 
      console.log("set token ",auth);
    } else {
      // delete axios.defaults.headers.common["x-auth-token"];
      setAuth(null);
      console.log("delete token ",auth);
    }
  };

  // 我们将setAuthToken函数和auth state一起传递给子组件
  return <AuthContext.Provider value={{ auth, setAuthToken }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;