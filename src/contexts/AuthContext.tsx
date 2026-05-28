import React, { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const USERS_KEY = "edutrade_users";
const PASSWORDS_KEY = "edutrade_passwords";
const SESSION_KEY = "edutrade_session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function isEduEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.edu\.vn$/i.test(email.trim());
}

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  let users: User[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as User[];
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    } catch {
      localStorage.removeItem(USERS_KEY);
    }
  }

  // Ensure admin user exists
  const hasAdmin = users.some((u) => u.email === "admin@edu.vn");
  if (!hasAdmin) {
    const adminUser: User = {
      id: "u-admin",
      name: "Quản trị viên",
      email: "admin@edu.vn",
      role: "admin",
      createdAt: "2026-05-28T00:00:00.000Z",
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  return users;
}

function writeUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readPasswords(): Record<string, string> {
  const raw = localStorage.getItem(PASSWORDS_KEY);
  let passwords: Record<string, string> = {};
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        passwords = parsed;
      }
    } catch {
      localStorage.removeItem(PASSWORDS_KEY);
    }
  }

  // Ensure admin password hash is present (password is "admin")
  if (!passwords["u-admin"]) {
    passwords["u-admin"] = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  }

  return passwords;
}

function writePasswords(passwords: Record<string, string>): void {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}

function readSession(): User | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSession());

  async function register(name: string, email: string, password: string): Promise<string | null> {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) return "Vui lòng nhập họ tên.";
    if (!isEduEmail(normalizedEmail)) return "Chỉ chấp nhận email sinh viên @*.edu.vn.";
    if (password.length < 6) return "Mật khẩu tối thiểu 6 ký tự.";

    const users = readUsers();
    const emailExists = users.some((storedUser) => storedUser.email.toLowerCase() === normalizedEmail);
    if (emailExists) return "Email này đã được đăng ký.";

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };

    const hashedPassword = await hashPassword(password);

    writeUsers([...users, newUser]);
    writePasswords({ ...readPasswords(), [newUser.id]: hashedPassword });
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return null;
  }

  async function login(email: string, password: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = readUsers().find((storedUser) => storedUser.email.toLowerCase() === normalizedEmail);

    if (!foundUser) return "Email chưa được đăng ký.";
    const hashedPassword = await hashPassword(password);
    if (readPasswords()[foundUser.id] !== hashedPassword) return "Mật khẩu không đúng.";

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
    setUser(foundUser);
    return null;
  }

  function logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
