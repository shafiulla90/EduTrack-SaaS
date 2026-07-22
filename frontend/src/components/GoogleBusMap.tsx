'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

interface Stop {
  name: string;
  lat: number;
  lng: number;
}

interface BusLocation {
  id: string;
  busNumber: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  isOnline: boolean;
}

interface GoogleBusMapProps {
  buses: BusLocation[];
  stops: Stop[];
  center: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem',
};

// Map options to remove default UI and style it
const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapId: '8d123439b1a5e', // Use a custom MapID for advanced markers/styling if needed
};

export default function GoogleBusMap({ buses, stops, center, zoom = 14, height = '400px' }: GoogleBusMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Calculate route polyline natively with Google Directions API
  useEffect(() => {
    if (isLoaded && stops.length >= 2 && !directions && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      const directionsService = new window.google.maps.DirectionsService();
      
      const origin = stops[0];
      const destination = stops[stops.length - 1];
      const waypoints = stops.slice(1, -1).map(stop => ({
        location: { lat: stop.lat, lng: stop.lng },
        stopover: true,
      }));

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error('Error fetching directions', status);
          }
        }
      );
    }
  }, [isLoaded, stops, directions]);

  // Center map on active bus if only one is tracked
  useEffect(() => {
    if (map && buses.length === 1 && buses[0].isOnline) {
      map.panTo({ lat: buses[0].lat, lng: buses[0].lng });
    }
  }, [buses, map]);

  if (loadError) {
    return (
      <div style={{ height }} className="w-full bg-red-50 rounded-3xl flex flex-col items-center justify-center text-red-400 font-bold p-6 text-center border border-red-100">
        <div>Google Maps Failed to Load</div>
        <div className="text-xs font-medium text-red-300 mt-2">Please check your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height }} className="w-full bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-bold animate-pulse border border-slate-200">
        Loading Real-Time Map...
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full relative shadow-inner rounded-3xl overflow-hidden bg-slate-50">
      {/* If API Key is missing, show a prominent overlay */}
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white p-6 rounded-3xl text-center max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">Google Maps Key Required</h3>
            <p className="text-xs text-slate-500 font-medium">
              The architecture is fully wired and ready. Please provide the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment variables to enable the live map view.
            </p>
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={options}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Draw Route Line (Fall back to direct Polyline if Directions API isn't ready) */}
        {directions && (
          <Polyline
            path={directions.routes[0].overview_path}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.8,
              strokeWeight: 6,
            }}
          />
        )}
        
        {!directions && stops.length > 0 && (
          <Polyline
            path={stops.map(s => ({ lat: s.lat, lng: s.lng }))}
            options={{
              strokeColor: '#94a3b8',
              strokeOpacity: 0.6,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Draw Stops */}
        {stops.map((stop, idx) => (
          <Marker
            key={idx}
            position={{ lat: stop.lat, lng: stop.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="#ffffff" stroke="#2563eb" stroke-width="4"/></svg>'),
              anchor: new window.google.maps.Point(12, 12),
            }}
            title={stop.name}
          />
        ))}

        {/* Draw Buses with live animation/icon */}
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={{ lat: bus.lat, lng: bus.lng }}
            title={`Bus ${bus.busNumber} (${Math.round(bus.speed)} km/h)`}
            icon={{
              // Use a bus icon with a pinging effect natively rendered or a simple SVG
              url: bus.isOnline 
                ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="#10b981"/><circle cx="20" cy="20" r="8" fill="#ffffff"/></svg>')
                : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="#94a3b8"/><circle cx="20" cy="20" r="8" fill="#ffffff"/></svg>'),
              anchor: new window.google.maps.Point(20, 20),
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
