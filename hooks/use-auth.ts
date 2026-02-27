"use client"

import { useState, useCallback, useEffect } from "react"
import type { User } from "@/lib/types"
import api from "@/lib/api"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // O'rnatish: dastlabki login da foydalanuvchini oladik
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/me/');
        setUser(response.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [])

  const login = useCallback(async (credentials: any) => {
    try {
      const response = await api.post('/login/', credentials);
      const { token } = response.data;
      localStorage.setItem("auth_token", token);

      // Fetch user details
      const userResponse = await api.get('/me/');
      setUser(userResponse.data);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("auth_token");
  }, [])

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
