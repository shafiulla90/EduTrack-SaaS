'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { useSchoolSetupUpdate } from '@/lib/events';

interface TenantContextType {
  schoolName: string;
  schoolType: string;
  adminName: string;
  logoUrl: string | null;
  loading: boolean;
  setupStats: any;
  currentUser: any;
  refresh: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [adminName, setAdminName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupStats, setSetupStats] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchTenantData = async () => {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!currentToken) {
      setSchoolName("ST. ANNE'S HIGH SCHOOL");
      setSchoolType("School");
      setAdminName("Sarah Jenkins");
      setLogoUrl(null);
      setSetupStats(null);
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/tenant/setup-status');
      const data = response.data;
      setSetupStats(data);
      setCurrentUser(data.currentUser || null);
      
      const setupObj = data.setup;
      if (setupObj) {
        setSchoolName(setupObj.schoolName || "ST. ANNE'S HIGH SCHOOL");
        setSchoolType(setupObj.schoolType || 'School');
        setAdminName(setupObj.adminName || 'Sarah Jenkins');
        setLogoUrl(setupObj.schoolLogo || null);
      } else {
        setSchoolName("ST. ANNE'S HIGH SCHOOL");
        setSchoolType("School");
        setAdminName("Sarah Jenkins");
        setLogoUrl(null);
      }
    } catch (err) {
      console.error('Failed to fetch tenant setup status:', err);
      setSchoolName("ST. ANNE'S HIGH SCHOOL");
      setSchoolType("School");
      setAdminName("Sarah Jenkins");
      setLogoUrl(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sync token from localStorage on routing/pathname changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }
  }, [pathname, token]);

  // Automatically fetch profile when the token state changes (login, logout, or startup)
  useEffect(() => {
    fetchTenantData();
  }, [token]);

  // Use the centralized school-setup-updated listener
  useSchoolSetupUpdate(fetchTenantData);

  return (
    <TenantContext.Provider value={{
      schoolName,
      schoolType,
      adminName,
      logoUrl,
      loading,
      setupStats,
      currentUser,
      refresh: fetchTenantData
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
