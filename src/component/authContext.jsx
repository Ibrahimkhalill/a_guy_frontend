/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

// Create AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize auth state with cookies
  const [auth, setAuth] = useState(() => {
    const token = Cookies.get("authToken");
    const email = Cookies.get("authemail");
    const username = Cookies.get("username");
    return {
      token: token || null,
      email: email || null,
      username: username || null,
    };
  });

  // Login
  const login = (token, email, name, refreshToken = null) => {
    setAuth({ token, email, username: name });

    console.log("Login successful:", { token, email, name, refreshToken });

    Cookies.set("authToken", token, { secure: true, sameSite: "Strict" });
    Cookies.set("authemail", email, { secure: true, sameSite: "Strict" });
    Cookies.set("username", name, { secure: true, sameSite: "Strict" });

    if (refreshToken) {
      Cookies.set("refreshToken", refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
    }
  };

  // Logout
  const logout = () => {
    setAuth({ token: null, email: null, username: null });
    Cookies.remove("authToken");
    Cookies.remove("authemail");
    Cookies.remove("username");
    Cookies.remove("refreshToken");
  };

  const isAuthenticated = !!auth.token;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
