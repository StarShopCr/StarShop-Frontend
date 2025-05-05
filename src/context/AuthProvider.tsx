"use client";

import React, { createContext, useState, useEffect } from "react";
import { UserSession } from "@/types/user.types";
import { getSessionFromCookies } from "@/lib/authCookie";

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (user: UserSession) => void;
  logout: () => void;
  setUser: (user: UserSession) => void;
  setRole: (role: "admin" | "user" | "guest") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setUser: () => {},
  setRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user data from cookies on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { token, role } = getSessionFromCookies(document.cookie);

        if (token && role) {
          // Create user session from cookie data
          const userSession: UserSession = {
            id: `user_${role}`, // Generate a unique ID based on role
            token,
            role,
            name: role.charAt(0).toUpperCase() + role.slice(1), // Example name based on role
            email: `${role}@example.com`, // Example email based on role
          };

          setUserState(userSession);
          setIsAuthenticated(true);
        } else {
          // No valid session found
          setUserState(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to load authenticated user:", error);
        setUserState(null);
        setIsAuthenticated(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (userData: UserSession) => {
    try {
      // Set cookies separately
      document.cookie = `auth_token=${userData.token}; Path=/; SameSite=Lax; Max-Age=86400`;
      document.cookie = `user_role=${userData.role}; Path=/; SameSite=Lax; Max-Age=86400`;

      // Update state
      setUserState(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error during login:", error);
      throw new Error("Authentication failed");
    }
  };

  const logout = () => {
    // Clear cookies separately
    document.cookie = 'auth_token=; Path=/; SameSite=Lax; Max-Age=0';
    document.cookie = 'user_role=; Path=/; SameSite=Lax; Max-Age=0';

    // Update state
    setUserState(null);
    setIsAuthenticated(false);
  };

  const setUser = async (userData: UserSession) => {
    try {
      // Update cookies separately
      document.cookie = `auth_token=${userData.token}; Path=/; SameSite=Lax; Max-Age=86400`;
      document.cookie = `user_role=${userData.role}; Path=/; SameSite=Lax; Max-Age=86400`;

      // Update state
      setUserState(userData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const setRole = async (role: "admin" | "user" | "guest") => {
    if (user) {
      const updatedUser = { ...user, role };
      await setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        setUser,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
