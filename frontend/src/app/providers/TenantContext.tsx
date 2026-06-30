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
  const [schoolName, setSchoolName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('schoolName') || '';
    }
    return '';
  });
  const [schoolType, setSchoolType] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('schoolType') || '';
    }
    return '';
  });
  const [adminName, setAdminName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminName') || '';
    }
    return '';
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('logoUrl') || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [setupStats, setSetupStats] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const pathname = usePathname();

  const fetchTenantData = async () => {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!currentToken) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('schoolName');
        localStorage.removeItem('schoolType');
        localStorage.removeItem('adminName');
        localStorage.removeItem('logoUrl');
      }
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
        const sName = setupObj.schoolName || "ST. ANNE'S HIGH SCHOOL";
        const sType = setupObj.schoolType || 'School';
        const aName = setupObj.adminName || 'Sarah Jenkins';
        const logo = setupObj.schoolLogo || null;

        setSchoolName(sName);
        setSchoolType(sType);
        setAdminName(aName);
        setLogoUrl(logo);

        if (typeof window !== 'undefined') {
          localStorage.setItem('schoolName', sName);
          localStorage.setItem('schoolType', sType);
          localStorage.setItem('adminName', aName);
          if (logo) localStorage.setItem('logoUrl', logo);
          else localStorage.removeItem('logoUrl');
        }
      } else {
        setSchoolName("ST. ANNE'S HIGH SCHOOL");
        setSchoolType("School");
        setAdminName("Sarah Jenkins");
        setLogoUrl(null);
      }
    } catch (err) {
      console.error('Failed to fetch tenant setup status:', err);
      if (typeof window !== 'undefined') {
        const cachedName = localStorage.getItem('schoolName');
        if (cachedName) {
          setSchoolName(cachedName);
          setSchoolType(localStorage.getItem('schoolType') || 'School');
          setAdminName(localStorage.getItem('adminName') || 'Sarah Jenkins');
          setLogoUrl(localStorage.getItem('logoUrl') || null);
          setCurrentUser(null);
          setLoading(false);
          return;
        }
      }
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
