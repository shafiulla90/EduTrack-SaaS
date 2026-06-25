'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSchoolSetupUpdate } from '@/lib/events';

interface TenantContextType {
  schoolName: string;
  schoolType: string;
  adminName: string;
  logoUrl: string | null;
  loading: boolean;
  setupStats: any;
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

  const fetchTenantData = async () => {
    try {
      const response = await api.get('/tenant/setup-status');
      const data = response.data;
      setSetupStats(data);
      if (data.setup) {
        setSchoolName(data.setup.schoolName || "ST. ANNE'S HIGH SCHOOL");
        setSchoolType(data.setup.schoolType || 'School');
        setAdminName(data.setup.adminName || 'Sarah Jenkins');
        setLogoUrl(data.setup.schoolLogo || null);
      }
    } catch (err) {
      console.error('Failed to fetch tenant setup status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

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
