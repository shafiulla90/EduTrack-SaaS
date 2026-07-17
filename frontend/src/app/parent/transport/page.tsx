'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { Bus, Phone, MapPin, Clock, Info, Loader2 } from 'lucide-react';

export default function TransportPage() {
  const { selectedChild } = useParent();
  const [transport, setTransport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedEta, setSimulatedEta] = useState(8);
  const [simulatedCoords, setSimulatedCoords] = useState({ lat: 18.5529, lng: 73.9312 });

  const fetchTransport = async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/transport`);
      setTransport(res.data);
      if (res.data?.liveGPS) {
        setSimulatedEta(res.data.liveGPS.etaMinutes);
        setSimulatedCoords({ lat: res.data.liveGPS.latitude, lng: res.data.liveGPS.longitude });
      }
    } catch (err) {
      console.error('Failed to fetch transport:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchTransport(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchTransport(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  // Simulate active movement of school bus every 6 seconds
  useEffect(() => {
    if (!transport) return;
    const interval = setInterval(() => {
      setSimulatedEta(prev => {
        if (prev <= 1) return 10; // reset loop
        return prev - 1;
      });
      setSimulatedCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, [transport]);

  if (!selectedChild) {
    return (
      <div className="text-slate-500 text-sm text-center py-12">
        Please select a child to track transport.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-[#2E5BFF] border-r-[#2E5BFF] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          Live Transport GPS: <span className="text-[#2E5BFF] font-extrabold">{selectedChild.name}</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-light">Monitor school bus pickup/drop timings and track real-time locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Driver/Route details */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Bus className="w-4.5 h-4.5 text-[#2E5BFF]" />
              Bus Details
            </h3>
            
            <div className="space-y-3 text-xs text-slate-650">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Bus Number</span>
                <strong className="text-slate-700 text-sm">{transport?.busNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Assigned Route</span>
                <strong className="text-slate-700">{transport?.route}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Pickup Scheduled</span>
                  <strong className="text-slate-700">{transport?.pickupTime}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Drop Scheduled</span>
                  <strong className="text-slate-700">{transport?.dropTime}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Phone className="w-4.5 h-4.5 text-emerald-600" />
              Driver Profile
            </h3>
            
            <div className="flex justify-between items-center gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700">{transport?.driverName}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Primary Driver Contact</p>
              </div>
              <a
                href={`tel:${transport?.driverPhone}`}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#2E5BFF] transition-all cursor-pointer flex items-center gap-1.5 font-semibold text-xs animate-pulse"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            </div>
          </div>
        </div>

        {/* Live GPS Map Area */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-[360px] lg:h-auto relative overflow-hidden">
          {/* Mock Map Background Grids */}
          <div className="absolute inset-0 bg-slate-100/50 opacity-40 select-none pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="z-10 bg-white/95 border border-slate-200 rounded-2xl p-4 flex justify-between items-center text-xs gap-4 shadow-sm relative">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 animate-bounce" />
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Live Status</span>
                <strong className="text-slate-700">En route to destination stop</strong>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Estimated ETA</span>
              <strong className="text-[#2E5BFF] font-black text-sm">{simulatedEta} mins away</strong>
            </div>
          </div>

          {/* Visual GPS Plot */}
          <div className="z-10 flex-1 flex items-center justify-center p-6 relative">
            <div className="w-40 h-40 rounded-full border border-blue-500/10 flex items-center justify-center relative bg-blue-500/5 animate-pulse">
              <div className="w-24 h-24 rounded-full border border-blue-500/20 flex items-center justify-center relative">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2E5BFF]">
                  <Bus className="w-4.5 h-4.5 animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          <div className="z-10 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 leading-normal flex items-center gap-2 select-none relative">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Simulating active GPS broadcast. Coordinates: Lat {simulatedCoords.lat.toFixed(4)}, Lng {simulatedCoords.lng.toFixed(4)}.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
