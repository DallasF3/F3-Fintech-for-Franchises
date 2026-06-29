"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  franchiseId?: string;
  storeId?: string;
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      setUser(JSON.parse(jsonPayload));
    } catch (error) {
      // invalid token
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}

export function RbacGuard({ 
  allowedRoles, 
  children,
  fallback = null
}: { 
  allowedRoles: string[], 
  children: React.ReactNode,
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuthUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return null;

  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
