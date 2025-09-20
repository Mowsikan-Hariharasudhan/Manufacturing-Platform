import React, { createContext, useContext, useState } from "react";

type User = {
  loginId: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (loginId: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (payload: { loginId: string; email: string; password: string }) => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory mock users store for demo purposes
const initialUsers: Array<{ loginId: string; email: string; password: string }> = [
  { loginId: "admin", password: "password123", email: "admin@company.com" },
  { loginId: "manager", password: "manager123", email: "manager@company.com" },
  { loginId: "user1", password: "user123", email: "user1@company.com" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState(initialUsers);

  const login = async (loginId: string, password: string) => {
    // simple synchronous check, wrapped in Promise for parity with API
    const found = users.find((u) => u.loginId === loginId && u.password === password);
    if (found) {
      const u = { loginId: found.loginId, email: found.email };
      setUser(u);
      return u;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (payload: { loginId: string; email: string; password: string }) => {
    // Check uniqueness
    if (users.some((u) => u.loginId === payload.loginId || u.email === payload.email)) {
      return null;
    }
    setUsers((prev) => [...prev, { loginId: payload.loginId, email: payload.email, password: payload.password }]);
    const newUser = { loginId: payload.loginId, email: payload.email };
    // Optionally auto-login
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
