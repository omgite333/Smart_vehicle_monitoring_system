'use client'
import { useEffect, useRef } from 'react'

export default function MapComponent({ lat, lng, zoom = 14 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [lat || 16.8542, lng || 74.6015],
          zoom,
          zoomControl: true,
          attributionControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Custom marker icon
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:32px;height:32px;">
              <div style="
                width:32px;height:32px;
                background:rgba(0,212,255,0.15);
                border:2px solid #00d4ff;
                border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                box-shadow:0 0 20px rgba(0,212,255,0.5);
                animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;
              ">
                <div style="width:10px;height:10px;background:#00d4ff;border-radius:50%;"></div>
              </div>
              <div style="
                position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                width:48px;height:48px;
                border:1px solid rgba(0,212,255,0.3);
                border-radius:50%;
                animation: ping 2s cubic-bezier(0,0,0.2,1) infinite 0.5s;
              "></div>
            </div>
            <style>
              @keyframes ping {
                0% { opacity: 1; transform: scale(1); }
                75%, 100% { opacity: 0; transform: scale(2); }
              }
            </style>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        if (lat && lng) {
          const marker = L.marker([lat, lng], { icon }).addTo(map)
          marker.bindPopup(`
            <div style="font-family:monospace;font-size:12px;background:#0f1527;color:#00d4ff;padding:8px;border-radius:4px;">
              <strong>VEHICLE LOCATION</strong><br/>
              Lat: ${lat.toFixed(6)}<br/>
              Lng: ${lng.toFixed(6)}
            </div>
          `)
          markerRef.current = marker
        }

        mapInstanceRef.current = map
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Update marker position without reinitializing
  useEffect(() => {
    if (!mapInstanceRef.current || !lat || !lng) return

    const updatePosition = async () => {
      const L = (await import('leaflet')).default

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        mapInstanceRef.current.panTo([lat, lng])
      } else {
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:32px;height:32px;">
              <div style="width:32px;height:32px;background:rgba(0,212,255,0.15);border:2px solid #00d4ff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,212,255,0.5);">
                <div style="width:10px;height:10px;background:#00d4ff;border-radius:50%;"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
        markerRef.current = marker
        mapInstanceRef.current.setView([lat, lng], zoom)
      }
    }

    updatePosition()
  }, [lat, lng])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px', background: '#0a0e1a' }}
    />
  )
}
