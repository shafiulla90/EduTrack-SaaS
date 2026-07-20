'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function DriverPortalPage() {
  const [token, setToken] = useState<string | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [loading, setLoading] = useState(false);
  const [assignedBusData, setAssignedBusData] = useState<any>(null);
  const [dutyStatus, setDutyStatus] = useState<string>('OFF_DUTY');
  const [gpsActive, setGpsActive] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; speed: number } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('driver_token');
    if (savedToken) {
      setToken(savedToken);
      fetchAssignedBus(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: emailOrPhone,
        password,
      });
      const userToken = res.data.access_token || res.data.token;
      if (userToken) {
        localStorage.setItem('driver_token', userToken);
        setToken(userToken);
        await fetchAssignedBus(userToken);
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Login failed. Please check your Driver credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    stopGpsTracking();
    localStorage.removeItem('driver_token');
    setToken(null);
    setAssignedBusData(null);
  };

  const fetchAssignedBus = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/transport/driver/assigned-bus`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAssignedBusData(res.data);
      if (res.data?.bus?.dutyStatus) {
        setDutyStatus(res.data.bus.dutyStatus);
      }
    } catch (err: any) {
      console.error('Failed to fetch assigned bus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Request Wake Lock API to prevent phone screen from dimming/sleeping
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  };

  const startGpsTracking = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your mobile browser.');
      return;
    }

    await requestWakeLock();
    setGpsActive(true);

    // Start HTML5 Geolocation Watch Position
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0; // m/s to km/h
        const heading = pos.coords.heading || 0;

        setCurrentCoords({ lat, lng, speed });
        setLastPingTime(new Date().toLocaleTimeString());

        // Send GPS ping to backend
        if (token) {
          try {
            await axios.post(
              `${API_BASE}/transport/driver/gps`,
              { lat, lng, speed, heading, dutyStatus },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          } catch (err) {
            console.error('Failed to post GPS position:', err);
          }
        }
      },
      (err) => {
        console.error('GPS Watch Error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    releaseWakeLock();
    setGpsActive(false);
  };

  const handleDutyChange = async (newStatus: string) => {
    setDutyStatus(newStatus);
    if (token) {
      try {
        await axios.post(
          `${API_BASE}/transport/driver/duty`,
          { dutyStatus: newStatus },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (err) {
        console.error('Failed to update duty status:', err);
      }
    }

    if (newStatus === 'STARTING_ROUTE' || newStatus === 'EN_ROUTE') {
      if (!gpsActive) {
        startGpsTracking();
      }
    } else if (newStatus === 'OFF_DUTY' || newStatus === 'ROUTE_COMPLETED') {
      stopGpsTracking();
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-blue-500/30">
              🚌
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Portal Login</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              EduTrack SaaS Real-Time Mobile GPS Tracking
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Employee ID / Email / Phone
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. driver@school.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : 'Sign In to Driver Duty'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const bus = assignedBusData?.bus;
  const driver = assignedBusData?.driver;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12">
      {/* Mobile Top Header */}
      <header className="bg-slate-900 text-white px-6 py-5 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-black">
            🚌
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-tight">{driver?.user?.name || 'Driver Portal'}</h1>
            <p className="text-[11px] text-slate-400 font-mono">Bus: {bus?.busNumber || 'Assigned'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* GPS Broadcast Status Card */}
        <div className={`p-5 rounded-2xl border ${gpsActive ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-800 border-slate-200'} shadow-md transition-all`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-extrabold text-xs uppercase tracking-wider">
              {gpsActive ? '🔴 LIVE GPS BROADCASTING' : '⚪ GPS TRACKING STANDBY'}
            </span>
            <span className={`w-3 h-3 rounded-full ${gpsActive ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
          </div>
          <div className="text-2xl font-black mb-1">
            {gpsActive ? `${currentCoords?.speed || 0} km/h` : 'Off Duty'}
          </div>
          <div className="text-xs font-medium opacity-90">
            {gpsActive
              ? `Last Ping: ${lastPingTime || 'Sending...'} (${currentCoords?.lat.toFixed(4)}, ${currentCoords?.lng.toFixed(4)})`
              : 'Click Start Duty below to enable live phone location updates.'}
          </div>
        </div>

        {/* Duty Control Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-xs text-slate-500 uppercase tracking-wide">
            Duty &amp; Route Stage Controls
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDutyChange('STARTING_ROUTE')}
              className={`p-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${dutyStatus === 'STARTING_ROUTE' ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
            >
              1. Start Route
            </button>
            <button
              onClick={() => handleDutyChange('EN_ROUTE')}
              className={`p-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${dutyStatus === 'EN_ROUTE' ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
            >
              2. En Route
            </button>
            <button
              onClick={() => handleDutyChange('SCHOOL_REACHED')}
              className={`p-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${dutyStatus === 'SCHOOL_REACHED' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
            >
              3. School Reached
            </button>
            <button
              onClick={() => handleDutyChange('ROUTE_COMPLETED')}
              className={`p-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${dutyStatus === 'ROUTE_COMPLETED' ? 'bg-amber-600 text-white border-amber-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
            >
              4. Complete Route
            </button>
          </div>

          <div className="pt-2">
            {!gpsActive ? (
              <button
                onClick={startGpsTracking}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                ▶ Start Duty &amp; Enable Mobile GPS
              </button>
            ) : (
              <button
                onClick={stopGpsTracking}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                ⏹ End Duty &amp; Stop GPS
              </button>
            )}
          </div>
        </div>

        {/* Assigned Bus & Route Details */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-extrabold text-xs text-slate-500 uppercase tracking-wide">
            Assigned Vehicle &amp; Route
          </h2>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-1.5 text-xs font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Bus Number:</span>
              <strong className="text-slate-900">{bus?.busNumber || 'N/A'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Registration:</span>
              <strong className="text-slate-900">{bus?.registrationNo || 'N/A'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Route Name:</span>
              <strong className="text-blue-600 font-bold">{bus?.route?.routeName || 'Unassigned Route'}</strong>
            </div>
          </div>
        </div>

        {/* Route Stops Checklist */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-extrabold text-xs text-slate-500 uppercase tracking-wide">
            Route Stops Sequence
          </h2>
          <div className="space-y-2">
            {bus?.route?.stops && bus.route.stops.length > 0 ? (
              bus.route.stops.map((stop: any, idx: number) => (
                <div key={stop.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                  <div>
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold inline-flex items-center justify-center mr-2 text-[10px]">
                      {idx + 1}
                    </span>
                    <strong className="text-slate-800">{stop.stopName}</strong>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{stop.pickupTime}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium">No stops configured for this route.</p>
            )}
          </div>
        </div>

        {/* Emergency Call School Button */}
        <a
          href="tel:+919876543210"
          className="block w-full text-center py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer transition-all"
        >
          📞 Emergency Call School Transport Dept
        </a>
      </main>
    </div>
  );
}
